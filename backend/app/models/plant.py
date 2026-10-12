from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base


class PlantModel(Base):
    __tablename__ = "plants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    species = Column(String, nullable=True)
    category = Column(String, nullable=True)
    location = Column(String, nullable=True)
    care_status = Column(String, nullable=False, default="needs_info")
    last_watered = Column(String, nullable=True)
    next_watering_days = Column(Integer, nullable=True)
    light_requirement = Column(String, nullable=True)
    watering_frequency_days = Column(Integer, nullable=True)
    watering_guidance = Column(String, nullable=True)
    acquisition_date = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    added_date = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships with safe SET NULL on plant deletion
    care_tasks = relationship("CareTaskModel", back_populates="plant")
    journal_entries = relationship("JournalEntryModel", back_populates="plant")
