from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.schemas.doctor import AnalysisResultOut, PlantDoctorContext


class PlantAnalysisProvider(ABC):
    """Abstract interface for plant disease and health analysis providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the inference engine."""
        pass

    @property
    @abstractmethod
    def version(self) -> str:
        """Version or checkpoint release."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the provider is initialized and ready for inference."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns detailed provider readiness metadata."""
        pass

    @abstractmethod
    def analyze(
        self,
        image_bytes: bytes,
        context: Optional[PlantDoctorContext] = None,
    ) -> AnalysisResultOut:
        """Execute inference on raw image bytes and return normalized result."""
        pass
