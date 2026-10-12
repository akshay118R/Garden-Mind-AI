import json
from pathlib import Path
import numpy as np
import onnxruntime as ort
from PIL import Image

def test_onnx_model():
    p1 = Path("backend/models/plant_disease_mobilenet_v2.onnx")
    p2 = Path("models/plant_disease_mobilenet_v2.onnx")
    model_path = str(p1 if p1.exists() else p2)

    c1 = Path("backend/models/config.json")
    c2 = Path("models/config.json")
    config_path = str(c1 if c1.exists() else c2)

    session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    inputs = session.get_inputs()
    outputs = session.get_outputs()
    print("Inputs:", [(i.name, i.shape, i.type) for i in inputs])
    print("Outputs:", [(o.name, o.shape, o.type) for o in outputs])

    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    print("Class count:", len(cfg["id2label"]))

    # Test forward pass with 224x224 RGB image
    img = Image.new("RGB", (224, 224), color=(50, 150, 60))
    arr = np.array(img).astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm = (arr - mean) / std
    tensor = np.transpose(norm, (2, 0, 1))
    batch = np.expand_dims(tensor, axis=0)

    input_name = inputs[0].name
    logits = session.run(None, {input_name: batch})[0]
    exp = np.exp(logits - np.max(logits, axis=1, keepdims=True))
    probs = exp / np.sum(exp, axis=1, keepdims=True)
    top_idx = int(np.argmax(probs[0]))
    label = cfg["id2label"][str(top_idx)]
    score = float(probs[0][top_idx])

    print(f"Inference output: Top class index={top_idx}, label='{label}', probability={score:.4f}")
    assert len(probs[0]) == 38
    print("STANDALONE ONNX INFERENCE TEST PASSED!")

if __name__ == "__main__":
    test_onnx_model()
