def test_create_plant_success(client):
    payload = {
        "name": "Test Monstera",
        "species": "Monstera deliciosa",
        "category": "Foliage",
        "location": "Greenhouse",
        "careStatus": "needs_info",
        "notes": "Healthy test seedling",
    }
    response = client.post("/api/v1/plants", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Monstera"
    assert data["species"] == "Monstera deliciosa"
    assert data["careStatus"] == "needs_info"
    assert "id" in data
    assert "addedDate" in data


def test_create_plant_invalid_name(client):
    payload = {
        "name": "   ",  # Blank name should fail validation
        "category": "Foliage",
    }
    response = client.post("/api/v1/plants", json=payload)
    assert response.status_code == 422


def test_get_plant_not_found(client):
    response = client.get("/api/v1/plants/non-existent-plant-id")
    assert response.status_code == 404


def test_update_plant_success(client):
    # First create
    create_res = client.post("/api/v1/plants", json={"name": "Pothos Vine"})
    assert create_res.status_code == 201
    plant_id = create_res.json()["id"]

    # Now update
    update_res = client.patch(
        f"/api/v1/plants/{plant_id}",
        json={"name": "Golden Pothos", "careStatus": "healthy", "location": "Living Room"},
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["name"] == "Golden Pothos"
    assert updated_data["careStatus"] == "healthy"
    assert updated_data["location"] == "Living Room"


def test_delete_plant_relationship_safety(client):
    # Create plant
    plant_res = client.post("/api/v1/plants", json={"name": "Calathea Zebra"})
    plant_id = plant_res.json()["id"]

    # Create associated task
    task_res = client.post(
        "/api/v1/tasks",
        json={
            "plantId": plant_id,
            "title": "Misting foliage",
            "dueDate": "2026-10-15",
            "taskType": "misting",
        },
    )
    task_id = task_res.json()["id"]

    # Create associated journal entry
    journal_res = client.post(
        "/api/v1/journal",
        json={
            "plantId": plant_id,
            "title": "Repotting in porous mix",
            "notes": "Added perlite and bark.",
            "date": "2026-10-12",
            "observationType": "repotting",
        },
    )
    journal_id = journal_res.json()["id"]

    # Delete plant
    del_res = client.delete(f"/api/v1/plants/{plant_id}")
    assert del_res.status_code == 200

    # Verify plant itself is deleted
    get_plant_res = client.get(f"/api/v1/plants/{plant_id}")
    assert get_plant_res.status_code == 404

    # Verify task is NOT deleted, but safely unlinked with archived label
    get_task_res = client.get(f"/api/v1/tasks/{task_id}")
    assert get_task_res.status_code == 200
    task_data = get_task_res.json()
    assert task_data["plantId"] is None
    assert "Archived" in (task_data["plantName"] or "")

    # Verify journal entry is NOT deleted, but safely unlinked with archived label
    get_journal_res = client.get(f"/api/v1/journal/{journal_id}")
    assert get_journal_res.status_code == 200
    journal_data = get_journal_res.json()
    assert journal_data["plantId"] is None
    assert "Archived" in (journal_data["plantName"] or "")
