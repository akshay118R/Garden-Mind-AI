def test_create_task_success(client):
    payload = {
        "title": "Check root moisture",
        "taskType": "watering",
        "dueDate": "2026-10-14",
        "dueTime": "08:30",
        "priority": "high",
        "recurrence": "weekly",
        "notes": "Ensure saucer is emptied after drainage.",
    }
    response = client.post("/api/v1/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Check root moisture"
    assert data["taskType"] == "watering"
    assert data["completed"] is False
    assert data["priority"] == "high"


def test_create_task_with_nonexistent_plant_rejected(client):
    payload = {
        "plantId": "nonexistent-plant-999",
        "title": "Pruning task",
        "taskType": "pruning",
        "dueDate": "2026-10-15",
    }
    response = client.post("/api/v1/tasks", json=payload)
    assert response.status_code == 400
    assert "non-existent" in response.json()["detail"].lower()


def test_toggle_task_completion(client):
    create_res = client.post(
        "/api/v1/tasks",
        json={"title": "Misting bonsai", "taskType": "misting", "dueDate": "2026-10-12"},
    )
    task_id = create_res.json()["id"]

    # Mark complete
    patch_res = client.patch(f"/api/v1/tasks/{task_id}", json={"completed": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["completed"] is True
    assert patch_res.json()["completedAt"] is not None

    # Reopen
    reopen_res = client.patch(f"/api/v1/tasks/{task_id}", json={"completed": False})
    assert reopen_res.status_code == 200
    assert reopen_res.json()["completed"] is False
    assert reopen_res.json()["completedAt"] is None


def test_delete_task(client):
    create_res = client.post(
        "/api/v1/tasks",
        json={"title": "To be removed", "taskType": "general", "dueDate": "2026-10-20"},
    )
    task_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/tasks/{task_id}")
    assert del_res.status_code == 200

    get_res = client.get(f"/api/v1/tasks/{task_id}")
    assert get_res.status_code == 404
