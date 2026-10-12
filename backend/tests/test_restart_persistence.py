"""
Verification of Data and Upload Persistence Across Backend Restart
Tests that SQLite database records and uploaded media survive full server termination and restart.
"""

import io
import json
import sqlite3
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

BASE_URL = "http://127.0.0.1:8000/api/v1"

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
    boundary = "----WebKitFormBoundaryRestartTest"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {mime}\r\n\r\n"
    ).encode("utf-8") + content_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")
    
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def create_synthetic_image() -> bytes:
    img = Image.new("RGB", (128, 128), color=(40, 160, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()

def phase1_seed():
    print("--- PHASE 1: Seeding Records Prior to Restart ---")
    plant = http_json("POST", "/plants", {
        "name": "Restart Persistence Ficus",
        "species": "Ficus lyrata",
        "location": "Audit Lab",
        "category": "Foliage",
        "careStatus": "healthy",
        "wateringFrequencyDays": 5,
        "notes": "Specimen created specifically to test restart persistence."
    })
    plant_id = plant["id"]
    print(f"Created Plant: {plant_id}")

    task = http_json("POST", "/tasks", {
        "plantId": plant_id,
        "title": "Check root moisture after restart",
        "taskType": "watering",
        "priority": "high",
        "dueDate": "2026-10-15",
        "recurrence": "weekly",
        "notes": "Verify task persists across uvicorn reload"
    })
    task_id = task["id"]
    print(f"Created Task: {task_id}")

    journal = http_json("POST", "/journal", {
        "plantId": plant_id,
        "title": "Pre-restart Leaf Observation",
        "observationType": "growth",
        "notes": "Noting baseline leaf length before server shutdown",
        "growthMeasurement": "24 cm",
        "tags": ["restart_test", "persistence"],
        "date": "2026-10-11"
    })
    journal_id = journal["id"]
    print(f"Created Journal Entry: {journal_id}")

    img_bytes = create_synthetic_image()
    photo_res = http_multipart_upload(journal_id, "restart_test_leaf.jpg", img_bytes, "image/jpeg")
    photo_url = photo_res["url"]
    print(f"Uploaded Photo: {photo_res['id']} -> {photo_url}")

    manifest = {
        "plant_id": plant_id,
        "task_id": task_id,
        "journal_id": journal_id,
        "photo_id": photo_res["id"],
        "photo_url": photo_url,
        "photo_size": len(img_bytes),
    }
    with open("backend/data/restart_test_manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f)
    print("Manifest saved. Ready for server restart.")

def phase2_verify():
    print("--- PHASE 2: Verifying Records After Restart ---")
    with open("backend/data/restart_test_manifest.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # 1. Verify plant
    plant = http_json("GET", f"/plants/{manifest['plant_id']}")
    assert plant["name"] == "Restart Persistence Ficus", "Plant name mismatch!"
    print(f"[PASS] Plant survived restart: {plant['name']} ({plant['id']})")

    # 2. Verify task
    tasks = http_json("GET", f"/tasks?plantId={manifest['plant_id']}")
    assert any(t["id"] == manifest["task_id"] for t in tasks), "Task not found after restart!"
    print(f"[PASS] Task survived restart: {manifest['task_id']}")

    # 3. Verify journal
    entries = http_json("GET", f"/journal?plantId={manifest['plant_id']}")
    target_entry = next((e for e in entries if e["id"] == manifest["journal_id"]), None)
    assert target_entry is not None, "Journal entry not found after restart!"
    assert len(target_entry.get("photos", [])) > 0, "Photo reference missing from journal entry!"
    print(f"[PASS] Journal entry survived restart: {manifest['journal_id']} with photo reference")

    # 4. Verify HTTP media download
    photo_url = f"http://127.0.0.1:8000{manifest['photo_url']}"
    req = urllib.request.Request(photo_url)
    with urllib.request.urlopen(req) as resp:
        downloaded_bytes = resp.read()
        assert len(downloaded_bytes) == manifest["photo_size"], "Downloaded photo size mismatch!"
        assert resp.headers.get("content-type") == "image/jpeg", "Unexpected content-type!"
    print(f"[PASS] Physical photo retrieval via HTTP succeeded: {len(downloaded_bytes)} bytes intact.")

    # 5. Cleanup test data
    http_json("DELETE", f"/plants/{manifest['plant_id']}")
    http_json("DELETE", f"/journal/{manifest['journal_id']}")
    Path("backend/data/restart_test_manifest.json").unlink(missing_ok=True)
    print("[PASS] Cleanup completed safely.")
    print("ALL RESTART PERSISTENCE CHECKS PASSED!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        phase2_verify()
    else:
        phase1_seed()
