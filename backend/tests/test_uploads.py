import io
import pytest


def test_upload_and_retrieve_photo(client):
    # 1. Create a journal entry
    entry_resp = client.post("/api/v1/journal", json={
        "date": "2026-04-10",
        "observationType": "growth",
        "title": "Photo Upload Test Entry",
        "notes": "Testing photo persistence"
    })
    assert entry_resp.status_code == 201
    entry_id = entry_resp.json()["id"]

    # 2. Upload dummy JPEG
    fake_jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00fakejpegdata12345"
    files = {
        "file": ("test_leaf.jpg", io.BytesIO(fake_jpeg_content), "image/jpeg")
    }
    upload_resp = client.post(f"/api/v1/journal/{entry_id}/photos", files=files)
    assert upload_resp.status_code == 201
    photo = upload_resp.json()
    assert photo["originalFilename"] == "test_leaf.jpg"
    assert photo["mediaType"] == "image/jpeg"
    assert photo["fileSize"] == len(fake_jpeg_content)
    assert photo["journalEntryId"] == entry_id
    assert "url" in photo
    photo_id = photo["id"]

    # 3. Retrieve the uploaded photo via its URL
    file_resp = client.get(photo["url"])
    assert file_resp.status_code == 200
    assert file_resp.content == fake_jpeg_content
    assert file_resp.headers["content-type"] == "image/jpeg"

    # 4. Verify entry now lists the photo URL in photos array
    get_entry_resp = client.get(f"/api/v1/journal/{entry_id}")
    entry_data = get_entry_resp.json()
    assert len(entry_data["photos"]) == 1
    assert entry_data["photos"][0] == photo["url"]

    # 5. Delete the photo
    del_photo_resp = client.delete(f"/api/v1/journal/{entry_id}/photos/{photo_id}")
    assert del_photo_resp.status_code in [200, 204]

    # 6. Verify photo URL now 404s
    file_after_del = client.get(photo["url"])
    assert file_after_del.status_code == 404

    # 7. Verify entry photo list is empty
    refreshed_entry = client.get(f"/api/v1/journal/{entry_id}").json()
    assert len(refreshed_entry["photos"]) == 0


def test_upload_invalid_mime_type(client):
    entry_resp = client.post("/api/v1/journal", json={
        "date": "2026-04-10",
        "observationType": "general",
        "title": "Invalid Mime Test",
        "notes": "Testing reject of script files"
    })
    assert entry_resp.status_code == 201
    entry_id = entry_resp.json()["id"]

    files = {
        "file": ("malicious.exe", io.BytesIO(b"MZ\x90\x00binary"), "application/x-msdownload")
    }
    upload_resp = client.post(f"/api/v1/journal/{entry_id}/photos", files=files)
    assert upload_resp.status_code in [400, 415]


def test_upload_to_missing_entry(client):
    files = {
        "file": ("leaf.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")
    }
    upload_resp = client.post("/api/v1/journal/non-existent-entry/photos", files=files)
    assert upload_resp.status_code == 404


def test_journal_entry_deletion_cleans_up_photos(client):
    # Create entry
    entry_resp = client.post("/api/v1/journal", json={
        "date": "2026-04-10",
        "observationType": "growth",
        "title": "Cascade Delete Test",
        "notes": "Photos should be removed from disk on entry delete"
    })
    assert entry_resp.status_code == 201
    entry_id = entry_resp.json()["id"]

    # Upload photo
    fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRdata"
    upload_resp = client.post(
        f"/api/v1/journal/{entry_id}/photos",
        files={"file": ("cascade_test.png", io.BytesIO(fake_png), "image/png")}
    )
    assert upload_resp.status_code == 201
    photo_url = upload_resp.json()["url"]

    # Verify file is accessible
    assert client.get(photo_url).status_code == 200

    # Delete parent journal entry
    del_entry_resp = client.delete(f"/api/v1/journal/{entry_id}")
    assert del_entry_resp.status_code in [200, 204]

    # Verify photo file on disk was cleaned up
    assert client.get(photo_url).status_code == 404
