from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base


class JournalEntryModel(Base):
    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True, index=True)
    plant_id = Column(String, ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    plant_name = Column(String, nullable=True)
    date = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    notes = Column(String, nullable=False)
    observation_type = Column(String, nullable=False, index=True)
    image_url = Column(String, nullable=True)
    growth_measurement = Column(String, nullable=True)
    tags_csv = Column(String, nullable=True)
    mood = Column(String, nullable=True)
    plant_doctor_assessment_id = Column(String, nullable=True)
    created_at = Column(String, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    plant = relationship("PlantModel", back_populates="journal_entries")
    photos = relationship(
        "JournalPhotoModel",
        back_populates="journal_entry",
        cascade="all, delete-orphan",
        order_by="JournalPhotoModel.uploaded_at",
    )


class JournalPhotoModel(Base):
    __tablename__ = "journal_photos"

    id = Column(String, primary_key=True, index=True)
    journal_entry_id = Column(
        String,
        ForeignKey("journal_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    stored_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    media_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    url = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    journal_entry = relationship("JournalEntryModel", back_populates="photos")
