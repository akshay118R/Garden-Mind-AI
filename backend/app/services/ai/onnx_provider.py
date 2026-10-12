import io
import json
import time
import secrets
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

import numpy as np
import onnxruntime as ort
from PIL import Image

from app.schemas.doctor import (
    AnalysisResultOut,
    PlantDoctorContext,
    ConfidenceAssessment,
    VisibleEvidenceItem,
    RecommendedAction,
    ModelMetadata,
)
from app.services.ai.base import PlantAnalysisProvider
from app.services.ai.knowledge_base import get_botanical_interpretation

# Decompression bomb defense
Image.MAX_IMAGE_PIXELS = 25_000_000


class OnnxPlantVillageProvider(PlantAnalysisProvider):
    """Local ONNX Vision classifier fine-tuned on the PlantVillage dataset."""

    def __init__(self, model_path: Optional[str] = None, config_path: Optional[str] = None):
        root = Path(__file__).resolve().parent.parent.parent.parent
        self._model_path = Path(model_path) if model_path else (root / "backend" / "models" / "plant_disease_mobilenet_v2.onnx")
        self._config_path = Path(config_path) if config_path else (root / "backend" / "models" / "config.json")
        
        # Fallback if running directly from backend directory
        if not self._model_path.exists():
            alt_model = Path("models/plant_disease_mobilenet_v2.onnx")
            alt_config = Path("models/config.json")
            if alt_model.exists():
                self._model_path = alt_model
                self._config_path = alt_config

        self._session: Optional[ort.InferenceSession] = None
        self._id2label: Dict[str, str] = {}
        self._is_ready = False
        self._init_error: Optional[str] = None

        self._load_model()

    def _load_model(self):
        try:
            if not self._model_path.exists():
                self._init_error = f"Model checkpoint file not found at {self._model_path}."
                self._is_ready = False
                return

            if not self._config_path.exists():
                self._init_error = f"Model config file not found at {self._config_path}."
                self._is_ready = False
                return

            with open(self._config_path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                self._id2label = cfg.get("id2label", {})

            # Initialize ONNX CPU runtime session
            opts = ort.SessionOptions()
            opts.intra_op_num_threads = 2
            opts.inter_op_num_threads = 1
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            self._session = ort.InferenceSession(
                str(self._model_path),
                sess_options=opts,
                providers=["CPUExecutionProvider"],
            )
            self._is_ready = True
            self._init_error = None
        except Exception as e:
            self._is_ready = False
            self._init_error = str(e)
            self._session = None

    @property
    def name(self) -> str:
        return "Local MobileNetV2 PlantVillage (ONNX)"

    @property
    def model_name(self) -> str:
        return self.name

    @property
    def version(self) -> str:
        return "1.0_224-onnx-community"

    @property
    def supported_classes(self) -> List[str]:
        return list(self._id2label.values())

    def is_available(self) -> bool:
        return self._is_ready and self._session is not None

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "is_ready": self.is_available(),
            "model_path": str(self._model_path),
            "num_classes": len(self._id2label),
            "init_error": self._init_error,
        }

    def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """Decode, resize, and normalize image bytes to (1, 3, 224, 224) float32 tensor."""
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                # Convert to RGB mode
                rgb = img.convert("RGB")
                # Resize to 224x224 using Bilinear filtering
                resized = rgb.resize((224, 224), Image.Resampling.BILINEAR)
                arr = np.array(resized).astype(np.float32) / 255.0

                # Standard ImageNet mean and standard deviation
                mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

                normalized = (arr - mean) / std
                # Transpose HWC -> CHW (3, 224, 224)
                transposed = np.transpose(normalized, (2, 0, 1))
                # Add batch dimension -> (1, 3, 224, 224)
                return np.expand_dims(transposed, axis=0)
        except Exception as e:
            raise ValueError(f"Failed to decode or preprocess image: {str(e)}")

    def analyze(
        self,
        image_bytes: bytes,
        context: Optional[PlantDoctorContext] = None,
    ) -> AnalysisResultOut:
        if not self.is_available() or self._session is None:
            raise RuntimeError(f"ONNX Model provider unavailable: {self._init_error or 'Session uninitialized'}")

        t0 = time.perf_counter()

        # Preprocess input tensor
        tensor = self._preprocess_image(image_bytes)

        # Execute ONNX forward pass
        input_name = self._session.get_inputs()[0].name
        logits = self._session.run(None, {input_name: tensor})[0]

        # Calculate numerically stable Softmax probabilities
        exp_logits = np.exp(logits - np.max(logits, axis=1, keepdims=True))
        probs = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)
        prob_dist = probs[0]

        # Sort indices by probability descending
        sorted_indices = np.argsort(prob_dist)[::-1]
        top_idx = int(sorted_indices[0])
        top_score = float(prob_dist[top_idx])
        top_label = self._id2label.get(str(top_idx), f"Unknown Class {top_idx}")

        inference_time_ms = round((time.perf_counter() - t0) * 1000, 1)

        # Retrieve structured botanical knowledge
        botany = get_botanical_interpretation(top_label)

        # Compile alternative explanations (top 2 and 3)
        alternatives: List[str] = []
        for rank in range(1, min(4, len(sorted_indices))):
            alt_idx = int(sorted_indices[rank])
            alt_score = float(prob_dist[alt_idx])
            alt_label = self._id2label.get(str(alt_idx), f"Class {alt_idx}")
            if alt_score >= 0.05:  # Only report alternatives with > 5% probability
                alt_info = get_botanical_interpretation(alt_label)
                alternatives.append(
                    f"{alt_info['common_name']} ({alt_score * 100:.1f}% mathematical similarity)"
                )

        # Determine outcome, confidence level, and calibrated explanation
        if top_score >= 0.70:
            outcome = "candidate_identified"
            level = "high"
            explanation = (
                f"The specimen presents marked visual features aligning with {botany['common_name']} "
                f"({top_score * 100:.1f}% model score). Note: Computer vision assists observation but cannot "
                f"confirm microscopic pathogen or systemic viral infection."
            )
        elif top_score >= 0.45:
            outcome = "candidate_identified"
            level = "moderate"
            explanation = (
                f"The image exhibits moderate visual similarity to {botany['common_name']} "
                f"({top_score * 100:.1f}% model score). Environmental stress, mineral imbalances, or pests may cause overlapping symptoms."
            )
        elif top_score >= 0.30:
            outcome = "inconclusive"
            level = "low"
            explanation = (
                f"The visual analysis is inconclusive ({top_score * 100:.1f}% top match). Multiple competing conditions "
                f"present comparable patterns. Inspect stem health and moisture levels before taking action."
            )
        else:
            outcome = "inconclusive"
            level = "uncertain"
            explanation = (
                "The analysis is inconclusive. The photograph does not present sufficiently clear or distinct visual symptoms "
                "within the model's 38 supported botanical classes."
            )

        is_inconclusive = outcome == "inconclusive"

        # Build evidence items
        visible_evidence = [
            VisibleEvidenceItem(
                feature=feat[0],
                observation=feat[1],
                significance=feat[2] if len(feat) > 2 else None,
            )
            for feat in botany.get("visible_features", [])
        ]

        # Build recommended actions
        recommended_actions = [
            RecommendedAction(
                id=f"action-{i+1}",
                title=act[0],
                description=act[1],
                category=act[2] if len(act) > 2 else "monitoring",
                suggested_care_task_type=act[3] if len(act) > 3 else botany.get("suggested_task", "general"),
                risk_level="low_risk",
            )
            for i, act in enumerate(botany.get("low_risk_actions", []))
        ]

        # Standard safety limitations
        limitations = [
            "Analysis is based on single 2D leaf image morphology; subterranean root rot and vascular wilt cannot be evaluated.",
            "The model is calibrated on 38 specific agricultural crop conditions (PlantVillage dataset); exotic or rare houseplant species may exhibit different baseline leaf patterns.",
            "Visual features should be cross-referenced with watering habits, lighting exposure, and soil drainage.",
        ]

        additional_observations = [
            "Inspect the underside of leaves with a hand lens for tiny webbing, moving mites, or scale insects.",
            "Check soil moisture 2 inches beneath the surface and verify pot drainage holes are unobstructed.",
            "Review whether any recent changes occurred in fertilizer concentration, ambient temperature, or direct sun exposure.",
        ]

        unique_id = f"diag-{int(time.time() * 1000)}-{secrets.token_hex(2)}"
        now_iso = datetime.now(timezone.utc).isoformat()

        return AnalysisResultOut(
            id=unique_id,
            timestamp=now_iso,
            outcome=outcome,
            summary=botany.get("summary", f"Observation analyzed with pattern matching for {top_label}."),
            candidate_issue=botany.get("common_name", top_label),
            issue_category=botany.get("category", "unknown"),
            is_inconclusive=is_inconclusive,
            confidence=ConfidenceAssessment(
                score=round(top_score, 4),
                level=level,
                calibrated_explanation=explanation,
            ),
            visible_evidence=visible_evidence,
            alternative_explanations=alternatives,
            recommended_low_risk_steps=recommended_actions,
            additional_observations_needed=additional_observations,
            limitations=limitations,
            model_metadata=ModelMetadata(
                model_name=self.name,
                version=self.version,
                inference_time_ms=inference_time_ms,
                endpoint="local://onnxruntime/cpu",
            ),
            context_used=context,
        )
