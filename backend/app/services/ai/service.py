import asyncio
import io
import logging
from typing import Optional
from PIL import Image

from app.core.config import settings
from app.schemas.doctor import (
    AnalysisResultOut,
    DoctorStatusOut,
    PlantDoctorContext,
)
from app.services.ai.base import PlantAnalysisProvider
from app.services.ai.onnx_provider import OnnxPlantVillageProvider

logger = logging.getLogger(__name__)


class PlantDoctorService:
    def __init__(self):
        self._provider: Optional[PlantAnalysisProvider] = None
        self._init_provider()

    def _init_provider(self):
        try:
            if settings.AI_PROVIDER_TYPE == "onnx":
                self._provider = OnnxPlantVillageProvider(
                    model_path=str(settings.resolved_model_path),
                    config_path=str(settings.resolved_config_path),
                )
            else:
                logger.warning(f"Unknown AI_PROVIDER_TYPE: {settings.AI_PROVIDER_TYPE}")
                self._provider = None
        except Exception as e:
            logger.error(f"Failed to initialize AI provider: {e}", exc_info=True)
            self._provider = None

    def get_status(self) -> DoctorStatusOut:
        if not self._provider or not self._provider.is_available():
            return DoctorStatusOut(
                is_configured=False,
                service_name="Plant Doctor Local AI Service",
                version="1.0.0",
                model_name="MobileNetV2 (Not loaded)",
                active_provider="none",
                notes="AI model checkpoint or ONNX runtime is not available on this host.",
                supported_classes_count=0,
            )

        return DoctorStatusOut(
            is_configured=True,
            service_name="Plant Doctor Local AI Service",
            version="1.0.0",
            model_name=self._provider.model_name,
            active_provider="onnx_local",
            notes="Local ONNX Runtime inference engine active. 38 plant species and pathology classes supported.",
            supported_classes_count=len(self._provider.supported_classes),
        )

    def validate_image_bytes(self, image_bytes: bytes, filename: str) -> None:
        """
        Validate image size, format, decompression bombs, and dimensions.
        Raises ValueError with clear message if invalid.
        """
        if not image_bytes or len(image_bytes) == 0:
            raise ValueError("Uploaded image file is empty (0 bytes).")

        if len(image_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
            raise ValueError(f"Uploaded file exceeds maximum size limit of {max_mb:.0f} MB.")

        # Inspect magic bytes / headers
        is_jpeg = image_bytes.startswith(b"\xff\xd8\xff")
        is_png = image_bytes.startswith(b"\x89PNG\r\n\x1a\n")
        is_webp = (
            len(image_bytes) >= 12
            and image_bytes[:4] == b"RIFF"
            and image_bytes[8:12] == b"WEBP"
        )

        if not (is_jpeg or is_png or is_webp):
            raise ValueError(
                "Unsupported file format. Please provide a genuine JPEG, PNG, or WebP image."
            )

        # Decompression bomb and dimension checks
        try:
            Image.MAX_IMAGE_PIXELS = 25_000_000
            with Image.open(io.BytesIO(image_bytes)) as img:
                img.verify()
        except Image.DecompressionBombError:
            raise ValueError(
                "Image exceeds safe pixel density limits (decompression bomb protection)."
            )
        except Exception as e:
            raise ValueError(
                f"Image header validation failed: file appears corrupted or invalid ({e})."
            )

    async def analyze_plant_image(
        self,
        image_bytes: bytes,
        filename: str,
        context: Optional[PlantDoctorContext] = None,
    ) -> AnalysisResultOut:
        """
        Perform safety checks and run inference asynchronously in threadpool.
        """
        self.validate_image_bytes(image_bytes, filename)

        if not self._provider or not self._provider.is_available():
            raise RuntimeError(
                "Plant Doctor AI analysis provider is currently unavailable or not configured."
            )

        # Run CPU inference in background threadpool so FastAPI event loop is not blocked
        result = await asyncio.to_thread(self._provider.analyze, image_bytes, context)
        return result


# Global singleton
doctor_service = PlantDoctorService()
