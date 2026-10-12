import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "GardenMind AI Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./data/gardenmind.db"

    # Uploads / Storage
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]

    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # AI Model Configuration
    MODEL_DIR: str = "./models"
    AI_MODEL_PATH: str = "./models/plant_disease_mobilenet_v2.onnx"
    AI_MODEL_CONFIG_PATH: str = "./models/config.json"
    AI_PROVIDER_TYPE: str = "onnx"  # "onnx" or "mock"
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def upload_path(self) -> Path:
        p = Path(self.UPLOAD_DIR)
        if not p.is_absolute() and not p.exists():
            base_dir = Path(__file__).resolve().parent.parent.parent
            alt = base_dir / self.UPLOAD_DIR.lstrip("./")
            if alt.parent.exists():
                alt.mkdir(parents=True, exist_ok=True)
                return alt
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def resolved_model_path(self) -> Path:
        p = Path(self.AI_MODEL_PATH)
        if p.exists():
            return p
        base_dir = Path(__file__).resolve().parent.parent.parent
        alt = base_dir / self.AI_MODEL_PATH.lstrip("./")
        if alt.exists():
            return alt
        return p

    @property
    def resolved_config_path(self) -> Path:
        p = Path(self.AI_MODEL_CONFIG_PATH)
        if p.exists():
            return p
        base_dir = Path(__file__).resolve().parent.parent.parent
        alt = base_dir / self.AI_MODEL_CONFIG_PATH.lstrip("./")
        if alt.exists():
            return alt
        return p


settings = Settings()
