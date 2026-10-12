import pytest
from datetime import date


def test_create_and_get_journal_entry(client):
    # First create a plant with valid PlantStatus ('healthy')
    plant_resp = client.post("/api/v1/plants", json={
        "name": "Monstera Albo",
        "species": "Monstera deliciosa",
        "location": "Living Room Window",
        "careStatus": "healthy",
        "notes": "Fast growing"
    })
    assert plant_resp.status_code == 201
    plant_id = plant_resp.json()["id"]

    # Create journal entry
    payload = {
        "plantId": plant_id,
        "date": str(date.today()),
        "observationType": "growth",
        "title": "First Fenestration Visible",
        "notes": "New leaf unfurled with 4 distinct fenestrations. Looks very healthy and vibrant green.",
        "growthMeasurement": "18.5 cm leaf width",
        "tags": ["fenestration", "growth-spurt", "new-leaf"]
    }
    response = client.post("/api/v1/journal", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["plantId"] == plant_id
    assert "Monstera Albo" in data["plantName"]
    assert data["observationType"] == "growth"
    assert data["growthMeasurement"] == "18.5 cm leaf width"
    assert "fenestration" in data["tags"]
    assert len(data["tags"]) == 3
    entry_id = data["id"]

    # Get single entry
    get_resp = client.get(f"/api/v1/journal/{entry_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == entry_id
    assert "Monstera Albo" in get_resp.json()["plantName"]


def test_create_journal_invalid_plant_id(client):
    payload = {
        "plantId": "non-existent-plant-999",
        "date": str(date.today()),
        "observationType": "general",
        "title": "Invalid Plant Entry",
        "notes": "This should fail because plant does not exist."
    }
    response = client.post("/api/v1/journal", json=payload)
    assert response.status_code == 400
    assert "non-existent" in response.json()["detail"].lower()


def test_update_journal_entry(client):
    # Create entry without plant
    create_resp = client.post("/api/v1/journal", json={
        "date": str(date.today()),
        "observationType": "general",
        "title": "Garden General Notes",
        "notes": "Checked humidity levels in the sunroom."
    })
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]

    # Update entry
    update_resp = client.patch(f"/api/v1/journal/{entry_id}", json={
        "title": "Updated Garden Notes",
        "growthMeasurement": "65% humidity",
        "tags": ["humidity", "environment"]
    })
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["title"] == "Updated Garden Notes"
    assert updated["growthMeasurement"] == "65% humidity"
    assert updated["tags"] == ["humidity", "environment"]


def test_delete_journal_entry(client):
    create_resp = client.post("/api/v1/journal", json={
        "date": str(date.today()),
        "observationType": "general",
        "title": "Temporary Entry",
        "notes": "To be deleted soon."
    })
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/journal/{entry_id}")
    assert del_resp.status_code in [200, 204]

    get_resp = client.get(f"/api/v1/journal/{entry_id}")
    assert get_resp.status_code == 404


def test_list_and_filter_journal(client):
    # Create plant
    p = client.post("/api/v1/plants", json={"name": "Ferny", "careStatus": "healthy"}).json()

    # Create entries
    client.post("/api/v1/journal", json={
        "plantId": p["id"],
        "date": "2026-04-01",
        "observationType": "repotting",
        "title": "Repotted Fern",
        "notes": "Moved to larger terracotta pot.",
        "tags": ["repotting"]
    })
    client.post("/api/v1/journal", json={
        "plantId": p["id"],
        "date": "2026-04-02",
        "observationType": "issue",
        "title": "Found Spider Mites",
        "notes": "Isolated and sprayed with neem oil.",
        "tags": ["pests", "neem"]
    })

    # Filter by plant
    resp_plant = client.get(f"/api/v1/journal?plant_id={p['id']}")
    assert resp_plant.status_code == 200
    assert len(resp_plant.json()) >= 2

    # Filter by type
    resp_pest = client.get("/api/v1/journal?observation_type=issue")
    assert resp_pest.status_code == 200
    assert all(e["observationType"] == "issue" for e in resp_pest.json())

    # Search
    resp_search = client.get("/api/v1/journal?search=neem")
    assert resp_search.status_code == 200
    assert len(resp_search.json()) >= 1
    assert any("neem" in e["notes"].lower() for e in resp_search.json())
