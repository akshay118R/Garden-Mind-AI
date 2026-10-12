from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base


class CareTaskModel(Base):
    __tablename__ = "care_tasks"

    id = Column(String, primary_key=True, index=True)
    plant_id = Column(String, ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    plant_name = Column(String, nullable=True)
    task_type = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    due_date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    due_time = Column(String, nullable=True)               # HH:MM
    priority = Column(String, nullable=False, default="normal")
    completed = Column(Boolean, nullable=False, default=False, index=True)
    completed_at = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    recurrence = Column(String, nullable=False, default="none")
    due_description = Column(String, nullable=True)
    is_today = Column(Boolean, nullable=True, default=False)
    created_at = Column(String, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    plant = relationship("PlantModel", back_populates="care_tasks")
