from typing import Optional, List, Literal
from pydantic import Field, field_validator
from app.schemas.base import CamelModel


JournalObservationType = Literal[
    "general",
    "growth",
    "milestone",
    "flowering",
    "care",
    "repotting",
    "issue",
    "recovery",
]

PlantMood = Literal["thriving", "steady", "struggling", "dormant"]


class JournalPhotoOut(CamelModel):
    id: str
    journal_entry_id: str
    original_filename: str
    media_type: str
    file_size: int
    url: str
    uploaded_at: str


class JournalEntryBase(CamelModel):
    plant_id: Optional[str] = Field(None, max_length=100)
    plant_name: Optional[str] = Field(None, max_length=150)
    date: str = Field(..., max_length=50, description="Entry date")
    title: str = Field(..., min_length=1, max_length=200)
    notes: str = Field(..., min_length=1, max_length=5000)
    observation_type: JournalObservationType = Field("general")
    image_url: Optional[str] = Field(None, max_length=1000)
    photos: List[str] = Field(default_factory=list)
    growth_measurement: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)
    mood: Optional[PlantMood] = None
    plant_doctor_assessment_id: Optional[str] = Field(None, max_length=100)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Observation title cannot be empty.")
        return trimmed

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Observation notes cannot be empty.")
        return trimmed


class JournalEntryCreate(JournalEntryBase):
    id: Optional[str] = Field(None, max_length=100)
    created_at: Optional[str] = Field(None, max_length=50)


class JournalEntryUpdate(CamelModel):
    plant_id: Optional[str] = Field(None, max_length=100)
    plant_name: Optional[str] = Field(None, max_length=150)
    date: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    notes: Optional[str] = Field(None, min_length=1, max_length=5000)
    observation_type: Optional[JournalObservationType] = None
    image_url: Optional[str] = Field(None, max_length=1000)
    photos: Optional[List[str]] = None
    growth_measurement: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    mood: Optional[PlantMood] = None
    plant_doctor_assessment_id: Optional[str] = Field(None, max_length=100)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Observation title cannot be empty.")
            return trimmed
        return None

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Observation notes cannot be empty.")
            return trimmed
        return None


class JournalEntryOut(JournalEntryBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
