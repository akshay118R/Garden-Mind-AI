import io
import json
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.schemas.doctor import AnalysisResultOut, DoctorStatusOut
from app.services.ai.service import doctor_service


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def valid_leaf_image_bytes():
    """Generates valid synthetic leaf image bytes in JPEG format."""
    buf = io.BytesIO()
    img = Image.new("RGB", (300, 300), color=(34, 139, 34))
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def valid_png_image_bytes():
    """Generates valid PNG image bytes."""
    buf = io.BytesIO()
    img = Image.new("RGB", (250, 250), color=(60, 179, 113))
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_doctor_status_endpoint(client: TestClient):
    """Verifies GET /api/v1/plant-doctor/status returns correct metadata schema."""
    response = client.get("/api/v1/plant-doctor/status")
    assert response.status_code == 200
    data = response.json()
    assert "isConfigured" in data
    assert "serviceName" in data
    assert "modelName" in data
    assert "supportedClassesCount" in data
    assert data["isConfigured"] is True
    assert data["supportedClassesCount"] == 38


def test_analyze_valid_jpeg_leaf(client: TestClient, valid_leaf_image_bytes: bytes):
    """Verifies POST /api/v1/plant-doctor/analyze accepts a JPEG leaf and returns a valid result."""
    files = {"image": ("leaf.jpg", valid_leaf_image_bytes, "image/jpeg")}
    data = {
        "species": "Tomato",
        "symptoms": "Yellow spots on lower foliage",
        "affected_area": "leaves",
    }
    response = client.post("/api/v1/plant-doctor/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()

    # Validate schema fields
    assert "id" in res
    assert "timestamp" in res
    assert "outcome" in res
    assert res["outcome"] in [
        "candidate_identified",
        "inconclusive",
        "unsupported_specimen",
        "low_quality_image",
    ]
    assert "summary" in res
    assert "issueCategory" in res
    assert "isInconclusive" in res
    assert "confidence" in res
    assert "visibleEvidence" in res
    assert isinstance(res["visibleEvidence"], list)
    assert "alternativeExplanations" in res
    assert "recommendedLowRiskSteps" in res
    assert isinstance(res["recommendedLowRiskSteps"], list)
    assert len(res["recommendedLowRiskSteps"]) > 0
    assert "limitations" in res
    assert len(res["limitations"]) > 0
    assert "modelMetadata" in res
    assert res["modelMetadata"]["modelName"] == "Local MobileNetV2 PlantVillage (ONNX)"

    # Verify conservative safety recommendations (no toxic chemicals)
    for action in res["recommendedLowRiskSteps"]:
        assert action["riskLevel"] in ["low_risk", "moderate_risk"]
        assert action["category"] in [
            "hydration",
            "sunlight",
            "isolation",
            "pruning",
            "soil",
            "monitoring",
        ]


def test_analyze_valid_png_leaf(client: TestClient, valid_png_image_bytes: bytes):
    """Verifies POST /api/v1/plant-doctor/analyze accepts PNG image."""
    files = {"file": ("plant.png", valid_png_image_bytes, "image/png")}
    response = client.post("/api/v1/plant-doctor/analyze", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["id"].startswith("diag-")
    assert res["outcome"] is not None


def test_analyze_empty_file(client: TestClient):
    """Verifies empty image upload (0 bytes) is rejected with 400 Bad Request."""
    files = {"image": ("empty.jpg", b"", "image/jpeg")}
    response = client.post("/api/v1/plant-doctor/analyze", files=files)
    assert response.status_code == 400
    assert "empty" in response.text.lower()


def test_analyze_corrupted_image(client: TestClient):
    """Verifies corrupt payload starting with valid header but invalid stream is rejected."""
    # JPEG magic bytes followed by garbage
    corrupt_bytes = b"\xff\xd8\xff\xe0" + b"random_corrupted_payload_data" * 20
    files = {"image": ("corrupted.jpg", corrupt_bytes, "image/jpeg")}
    response = client.post("/api/v1/plant-doctor/analyze", files=files)
    assert response.status_code == 400
    assert "corrupted" in response.text.lower() or "validation failed" in response.text.lower()


def test_analyze_unsupported_format_or_text_disguised_as_jpg(client: TestClient):
    """Verifies plain text disguised with a .jpg extension is rejected."""
    fake_jpg_content = b"This is just a text file with a .jpg filename extension."
    files = {"image": ("fake.jpg", fake_jpg_content, "image/jpeg")}
    response = client.post("/api/v1/plant-doctor/analyze", files=files)
    assert response.status_code == 400
    assert "unsupported" in response.text.lower() or "genuine jpeg" in response.text.lower()


def test_analyze_oversized_file(client: TestClient, monkeypatch):
    """Verifies files exceeding MAX_UPLOAD_SIZE_BYTES are rejected."""
    # Temporarily set max size to 1000 bytes for testing
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_BYTES", 1000)
    fake_large_bytes = b"\xff\xd8\xff" + b"X" * 2000
    files = {"image": ("large.jpg", fake_large_bytes, "image/jpeg")}
    response = client.post("/api/v1/plant-doctor/analyze", files=files)
    assert response.status_code == 400
    assert "exceeds maximum size" in response.text.lower()


def test_analyze_with_json_context(client: TestClient, valid_leaf_image_bytes: bytes):
    """Verifies structured JSON context is parsed and associated with result."""
    context_data = {
        "species": "Capsicum annuum (Bell Pepper)",
        "symptoms": "Bacterial spotting on upper foliage",
        "affectedArea": "leaves",
        "growingLocation": "Indoor greenhouse shelf",
        "recentCareChanges": "Increased humidity last week",
    }
    files = {"image": ("pepper.jpg", valid_leaf_image_bytes, "image/jpeg")}
    data = {"context": json.dumps(context_data)}
    response = client.post("/api/v1/plant-doctor/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["contextUsed"]["species"] == "Capsicum annuum (Bell Pepper)"
    assert res["contextUsed"]["growingLocation"] == "Indoor greenhouse shelf"


def test_analyze_with_existing_plant_association(
    client: TestClient, valid_leaf_image_bytes: bytes
):
    """Verifies selected plant ID from database enriches diagnosis context."""
    # First create a test plant in the database
    plant_payload = {
        "name": "Roma Tomato #4",
        "species": "Solanum lycopersicum",
        "location": "Balcony Planter",
        "wateringFrequencyDays": 2,
    }
    p_res = client.post("/api/v1/plants", json=plant_payload)
    assert p_res.status_code == 201
    created_plant = p_res.json()
    plant_id = created_plant["id"]

    # Submit analysis with selected_plant_id
    files = {"image": ("tomato.jpg", valid_leaf_image_bytes, "image/jpeg")}
    data = {"selected_plant_id": plant_id}
    diag_res = client.post("/api/v1/plant-doctor/analyze", files=files, data=data)
    assert diag_res.status_code == 200
    res = diag_res.json()

    assert res["contextUsed"]["selectedPlantId"] == plant_id
    assert res["contextUsed"]["plantName"] == "Roma Tomato #4"
    assert res["contextUsed"]["species"] == "Solanum lycopersicum"

    # Clean up test plant
    client.delete(f"/api/v1/plants/{plant_id}")


def test_model_unavailable_behavior(
    client: TestClient, valid_leaf_image_bytes: bytes, monkeypatch
):
    """Verifies 503 is cleanly returned when AI provider is not available."""
    monkeypatch.setattr(doctor_service, "_provider", None)
    files = {"image": ("leaf.jpg", valid_leaf_image_bytes, "image/jpeg")}
    response = client.post("/api/v1/plant-doctor/analyze", files=files)
    assert response.status_code == 503
    assert "unavailable" in response.text.lower()
