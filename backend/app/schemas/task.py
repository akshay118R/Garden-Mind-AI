from typing import Optional, Literal
from pydantic import Field, field_validator
from app.schemas.base import CamelModel


CareTaskType = Literal[
    "watering",
    "sunlight",
    "pruning",
    "fertilizing",
    "repotting",
    "pest_inspection",
    "general",
    "misting",
]

TaskPriority = Literal["low", "medium", "high", "normal"]
TaskRecurrence = Literal["none", "daily", "weekly", "monthly"]


class CareTaskBase(CamelModel):
    plant_id: Optional[str] = Field(None, max_length=100)
    plant_name: Optional[str] = Field(None, max_length=150)
    task_type: CareTaskType = Field("general")
    title: str = Field(..., min_length=1, max_length=200)
    due_date: str = Field(..., max_length=50, description="Due date (YYYY-MM-DD)")
    due_time: Optional[str] = Field(None, max_length=20)
    priority: TaskPriority = Field("normal")
    completed: bool = Field(False)
    completed_at: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=1000)
    recurrence: TaskRecurrence = Field("none")
    created_at: Optional[str] = Field(None, max_length=50)
    due_description: Optional[str] = Field(None, max_length=100)
    is_today: Optional[bool] = Field(None)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Task title cannot be empty.")
        return trimmed


class CareTaskCreate(CareTaskBase):
    id: Optional[str] = Field(None, max_length=100)


class CareTaskUpdate(CamelModel):
    plant_id: Optional[str] = Field(None, max_length=100)
    plant_name: Optional[str] = Field(None, max_length=150)
    task_type: Optional[CareTaskType] = None
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    due_date: Optional[str] = Field(None, max_length=50)
    due_time: Optional[str] = Field(None, max_length=20)
    priority: Optional[TaskPriority] = None
    completed: Optional[bool] = None
    completed_at: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=1000)
    recurrence: Optional[TaskRecurrence] = None
    due_description: Optional[str] = Field(None, max_length=100)
    is_today: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Task title cannot be empty.")
            return trimmed
        return None


class CareTaskOut(CareTaskBase):
    id: str
