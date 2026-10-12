from typing import Dict, Any
from app.schemas.base import CamelModel


class HealthResponse(CamelModel):
    status: str
    version: str
    database: str
    storage: str
    details: Dict[str, Any]
