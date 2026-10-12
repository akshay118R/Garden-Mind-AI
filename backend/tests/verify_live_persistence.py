"""
Live SQLite Persistence & REST API Verification Script
Executes real HTTP requests against the live running FastAPI server on http://127.0.0.1:8000
and checks that records are physically written to SQLite on disk.
"""

import sys
import io
import json
import sqlite3
from pathlib import Path
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"
p1 = Path("backend/data/gardenmind.db")
p2 = Path("data/gardenmind.db")
DB_PATH = p1 if p1.exists() else p2

def http_json(method: str, path: str, data: dict = None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"} if data else {}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8")
        return json.loads(content) if content else {}

def http_multipart_upload(entry_id: str, filename: str, content_bytes: bytes, mime: str):
    url = f"{BASE_URL}/journal/{entry_id}/photos"
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {mime}\r\n\r\n"
    ).encode("utf-8") + content_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")
    
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=== LIVE FASTAPI & SQLITE PERSISTENCE VERIFICATION ===")

    # 1. Health check
    health = http_json("GET", "/health")
    assert health["status"] == "healthy", f"Unexpected health status: {health}"
    assert health["database"] == "connected"
    print("[PASS] 1. Backend health check: Status healthy, SQLite connected, storage ready.")

    # 2. Plant Creation
    plant_payload = {
        "name": "Variegated Monstera Albo",
        "species": "Monstera deliciosa var. borsigiana",
        "category": "Foliage",
        "location": "Conservatory Bay",
        "careStatus": "healthy",
        "wateringFrequencyDays": 7,
        "notes": "Rare specimen with sectorial variegation."
    }
    plant = http_json("POST", "/plants", plant_payload)
    plant_id = plant["id"]
    assert plant["name"] == plant_payload["name"]
    print(f"[PASS] 2. Created plant in SQLite: {plant_id} ('{plant['name']}')")

    # 3. Verify in SQLite Database directly
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, name, species, care_status FROM plants WHERE id = ?", (plant_id,))
    row = cur.fetchone()
    assert row is not None and row[1] == "Variegated Monstera Albo"
    print(f"[PASS] 3. Verified direct disk persistence in SQLite table 'plants': {row}")

    # 4. Create Care Task associated with plant
    task_payload = {
        "plantId": plant_id,
        "taskType": "watering",
        "title": "Substrate moisture inspection with distilled water",
        "dueDate": "2026-10-10",
        "priority": "high",
        "notes": "Check top 2 inches before watering."
    }
    task = http_json("POST", "/tasks", task_payload)
    task_id = task["id"]
    assert task["plantId"] == plant_id
    print(f"[PASS] 4. Created care task in SQLite: {task_id} ('{task['title']}')")

    # 5. Toggle Care Task Completion
    toggled = http_json("PATCH", f"/tasks/{task_id}", {"completed": True})
    assert toggled["completed"] is True
    cur.execute("SELECT completed FROM care_tasks WHERE id = ?", (task_id,))
    assert cur.fetchone()[0] == 1
    print("[PASS] 5. Persisted care task completion in SQLite.")

    # 6. Create Growth Journal Entry
    journal_payload = {
        "plantId": plant_id,
        "date": "2026-10-10",
        "observationType": "growth",
        "title": "New Marbled Leaf Unfurled",
        "notes": "Over 50% white sectoring with no brown edges. Healthy root aeration visible.",
        "growthMeasurement": "24.5 cm width",
        "tags": ["albo", "variegated", "fenestration"]
    }
    journal = http_json("POST", "/journal", journal_payload)
    entry_id = journal["id"]
    assert journal["plantId"] == plant_id
    assert "fenestration" in journal["tags"]
    print(f"[PASS] 6. Created journal entry in SQLite: {entry_id} ('{journal['title']}')")

    # 7. Upload Photo via Multipart Endpoint
    fake_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00fakeimagepayload9999"
    photo_resp = http_multipart_upload(entry_id, "monstera_albo_leaf.jpg", fake_jpeg, "image/jpeg")
    photo_url = photo_resp["url"]
    photo_id = photo_resp["id"]
    print(f"[PASS] 7. Uploaded photo: {photo_id} -> {photo_url}")

    # 8. Retrieve image bytes from filesystem storage via GET
    with urllib.request.urlopen(f"http://127.0.0.1:8000{photo_url}") as file_resp:
        retrieved_bytes = file_resp.read()
        assert retrieved_bytes == fake_jpeg
        assert file_resp.headers["Content-Type"] == "image/jpeg"
    print("[PASS] 8. Successfully retrieved photo bytes from storage via HTTP route.")

    # 9. Verify SQLite photo metadata row
    cur.execute("SELECT id, journal_entry_id, original_filename, stored_path FROM journal_photos WHERE id = ?", (photo_id,))
    photo_row = cur.fetchone()
    assert photo_row is not None
    assert photo_row[1] == entry_id
    stored_path = Path(photo_row[3]) if Path(photo_row[3]).exists() else (Path("backend") / photo_row[3])
    assert stored_path.exists(), f"Stored photo does not exist at {stored_path}"
    print(f"[PASS] 9. Verified photo metadata in SQLite & physical file on disk: {stored_path}")

    # 10. Test Safe Deletion unlinking
    del_plant = http_json("DELETE", f"/plants/{plant_id}")
    cur.execute("SELECT plant_id, plant_name FROM care_tasks WHERE id = ?", (task_id,))
    task_after = cur.fetchone()
    assert task_after[0] is None
    assert "Archived" in task_after[1]

    cur.execute("SELECT plant_id, plant_name FROM journal_entries WHERE id = ?", (entry_id,))
    journal_after = cur.fetchone()
    assert journal_after[0] is None
    assert "Archived" in journal_after[1]
    print("[PASS] 10. Plant deletion relationship safety verified: Tasks and journal records safely unlinked with (Archived) notation.")

    # Clean up test task and journal
    http_json("DELETE", f"/tasks/{task_id}")
    http_json("DELETE", f"/journal/{entry_id}")
    assert not stored_path.exists(), "Stored photo file was not cleaned up on journal deletion"
    print("[PASS] 11. Journal entry deletion cascade verified: photo file automatically unlinked and cleaned from disk.")

    conn.close()
    print("\n========================================================")
    print("ALL 11 LIVE END-TO-END PERSISTENCE CHECKS PASSED 100%!")
    print("========================================================")

if __name__ == "__main__":
    main()
