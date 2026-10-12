"""
Live Plant Doctor AI Integration & Verification Script
Executes real HTTP requests against the live running FastAPI server on http://127.0.0.1:8000
and verifies genuine ONNX model execution, safety validation, and response schema.
"""

import io
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

BASE_URL = "http://127.0.0.1:8000/api/v1"


def http_get(path: str):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_multipart_analyze(
    filename: str,
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    extra_fields: dict = None,
):
    url = f"{BASE_URL}/plant-doctor/analyze"
    boundary = "----WebKitFormBoundaryGardenMindAI777"

    parts = []
    # Add file part
    parts.append(
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'
        f"Content-Type: {mime_type}\r\n\r\n"
    )
    body = "".join(parts).encode("utf-8") + image_bytes + b"\r\n"

    # Add extra form fields
    if extra_fields:
        for k, v in extra_fields.items():
            field_part = (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{k}"\r\n\r\n'
                f"{v}\r\n"
            )
            body += field_part.encode("utf-8")

    body += f"--{boundary}--\r\n".encode("utf-8")

    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(error_content)
        except Exception:
            return e.code, {"raw": error_content}


def main():
    print("=== LIVE PLANT DOCTOR AI INFERENCE & QUALITY VERIFICATION ===")

    # 1. Health & Doctor Status
    status = http_get("/plant-doctor/status")
    print(f"[*] Plant Doctor Service Status:")
    print(f"    - isConfigured: {status['isConfigured']}")
    print(f"    - modelName: {status['modelName']}")
    print(f"    - activeProvider: {status['activeProvider']}")
    print(f"    - supportedClassesCount: {status['supportedClassesCount']}")
    assert status["isConfigured"] is True
    assert status["supportedClassesCount"] == 38
    print("[PASS] 1. Status endpoint confirms local ONNX MobileNetV2 is configured and active.")

    # 2. Live inference with a synthetic green leaf image
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(46, 125, 50))  # Forest green leaf
    img.save(buf, format="JPEG")
    leaf_bytes = buf.getvalue()

    t0 = time.perf_counter()
    code, result = http_multipart_analyze(
        "green_foliage.jpg",
        leaf_bytes,
        "image/jpeg",
        {"species": "Tomato", "symptoms": "Mild yellowing on lower leaves"},
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000

    assert code == 200, f"Inference failed with status {code}: {result}"
    print(f"[PASS] 2. Live inference succeeded in {elapsed_ms:.1f}ms:")
    print(f"    - Diagnostic ID: {result['id']}")
    print(f"    - Outcome: {result['outcome']}")
    print(f"    - Candidate Issue: {result.get('candidateIssue')}")
    print(f"    - Summary: {result['summary'][:80]}...")
    print(f"    - Model: {result['modelMetadata']['modelName']}")
    print(f"    - Confidence Level: {result['confidence']['level']}")
    print(f"    - Visible Evidence items: {len(result['visibleEvidence'])}")
    print(f"    - Alternative Explanations: {len(result['alternativeExplanations'])}")
    print(f"    - Conservative Low-Risk Steps: {len(result['recommendedLowRiskSteps'])}")

    assert result["modelMetadata"]["modelName"] == "Local MobileNetV2 PlantVillage (ONNX)"
    assert len(result["recommendedLowRiskSteps"]) > 0
    assert len(result["limitations"]) > 0

    # 3. Input safety & validation: empty bytes
    code_empty, res_empty = http_multipart_analyze("empty.jpg", b"", "image/jpeg")
    assert code_empty == 400
    print(f"[PASS] 3. Empty file rejected with HTTP 400 ({res_empty.get('detail') or res_empty}).")

    # 4. Input safety: corrupted payload
    corrupted_bytes = b"\xff\xd8\xff\xe0CORRUPT_PAYLOAD" * 10
    code_corrupt, res_corrupt = http_multipart_analyze(
        "corrupted.jpg", corrupted_bytes, "image/jpeg"
    )
    assert code_corrupt == 400
    print(f"[PASS] 4. Corrupted file rejected with HTTP 400 ({res_corrupt.get('detail') or res_corrupt}).")

    # 5. Input safety: fake extension (text file disguised as .jpg)
    fake_txt = b"This is not a real image, just plain ascii text."
    code_fake, res_fake = http_multipart_analyze("fake.jpg", fake_txt, "image/jpeg")
    assert code_fake == 400
    print(f"[PASS] 5. Disguised text file rejected with HTTP 400 ({res_fake.get('detail') or res_fake}).")

    print("\n=======================================================")
    print("ALL LIVE AI INFERENCE & SAFETY CHECKS PASSED SUCCESSFULLY!")
    print("=======================================================\n")


if __name__ == "__main__":
    main()
