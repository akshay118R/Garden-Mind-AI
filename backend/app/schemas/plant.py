from typing import Optional, Literal
from pydantic import Field, field_validator
from app.schemas.base import CamelModel


PlantStatus = Literal["healthy", "attention", "needs_info"]
LightRequirement = Literal["Direct Sun", "Bright Indirect", "Partial Shade", "Low Light"]


class PlantBase(CamelModel):
    name: str = Field(..., min_length=1, max_length=120, description="Plant common or given name")
    species: Optional[str] = Field(None, max_length=150)
    category: Optional[str] = Field(None, max_length=80)
    location: Optional[str] = Field(None, max_length=100)
    care_status: PlantStatus = Field("needs_info")
    last_watered: Optional[str] = Field(None, max_length=80)
    next_watering_days: Optional[int] = Field(None, ge=0, le=365)
    light_requirement: Optional[str] = Field(None, max_length=50)
    watering_frequency_days: Optional[int] = Field(None, ge=1, le=180)
    watering_guidance: Optional[str] = Field(None, max_length=500)
    acquisition_date: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=1000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Plant name cannot be empty.")
        return trimmed


class PlantCreate(PlantBase):
    id: Optional[str] = Field(None, max_length=100)
    added_date: Optional[str] = Field(None, max_length=50)


class PlantUpdate(CamelModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    species: Optional[str] = Field(None, max_length=150)
    category: Optional[str] = Field(None, max_length=80)
    location: Optional[str] = Field(None, max_length=100)
    care_status: Optional[PlantStatus] = None
    last_watered: Optional[str] = Field(None, max_length=80)
    next_watering_days: Optional[int] = Field(None, ge=0, le=365)
    light_requirement: Optional[str] = Field(None, max_length=50)
    watering_frequency_days: Optional[int] = Field(None, ge=1, le=180)
    watering_guidance: Optional[str] = Field(None, max_length=500)
    acquisition_date: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=1000)
    added_date: Optional[str] = Field(None, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Plant name cannot be empty.")
            return trimmed
        return None


class PlantOut(PlantBase):
    id: str
    added_date: str
