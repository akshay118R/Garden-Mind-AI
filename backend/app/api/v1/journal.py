import time
import secrets
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.journal import JournalEntryModel, JournalPhotoModel
from app.models.plant import PlantModel
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryOut,
)

router = APIRouter()


def serialize_journal_entry(db_entry: JournalEntryModel) -> JournalEntryOut:
    """Helper to convert JournalEntryModel to JournalEntryOut schema with tags and photo list."""
    tags = [t.strip() for t in db_entry.tags_csv.split(",") if t.strip()] if db_entry.tags_csv else []
    
    # Collect photo URLs from related photo models and legacy image_url
    photos = [p.url for p in db_entry.photos]
    if not photos and db_entry.image_url:
        photos = [db_entry.image_url]

    return JournalEntryOut(
        id=db_entry.id,
        plant_id=db_entry.plant_id,
        plant_name=db_entry.plant_name,
        date=db_entry.date,
        title=db_entry.title,
        notes=db_entry.notes,
        observation_type=db_entry.observation_type,
        image_url=photos[0] if photos else db_entry.image_url,
        photos=photos,
        growth_measurement=db_entry.growth_measurement,
        tags=tags,
        mood=db_entry.mood,
        plant_doctor_assessment_id=db_entry.plant_doctor_assessment_id,
        created_at=db_entry.created_at,
        updated_at=db_entry.updated_at.isoformat() if db_entry.updated_at else None,
    )


@router.get("/journal", response_model=List[JournalEntryOut])
def get_journal_entries(
    plant_id: Optional[str] = Query(None, description="Filter entries by plant ID"),
    observation_type: Optional[str] = Query(None, description="Filter by observation category"),
    search: Optional[str] = Query(None, description="Search in title, notes, tags, measurements"),
    sort: Optional[str] = Query("newest", description="Sort order: newest or oldest"),
    db: Session = Depends(get_db),
):
    """Retrieve journal entries with optional filtering, search, and sorting."""
    query = db.query(JournalEntryModel)

    if plant_id:
        if plant_id == "unlinked":
            query = query.filter(JournalEntryModel.plant_id.is_(None))
        else:
            query = query.filter(JournalEntryModel.plant_id == plant_id)

    if observation_type and observation_type.lower() != "all":
        query = query.filter(JournalEntryModel.observation_type == observation_type)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                JournalEntryModel.title.ilike(s),
                JournalEntryModel.notes.ilike(s),
                JournalEntryModel.plant_name.ilike(s),
                JournalEntryModel.growth_measurement.ilike(s),
                JournalEntryModel.tags_csv.ilike(s),
            )
        )

    entries = query.all()

    # Sort in memory or by date string safely
    reverse_sort = sort != "oldest"
    # Helper to parse date for sorting
    def sort_key(e: JournalEntryModel):
        return e.date or ""

    sorted_entries = sorted(entries, key=sort_key, reverse=reverse_sort)
    return [serialize_journal_entry(e) for e in sorted_entries]


@router.get("/journal/{entry_id}", response_model=JournalEntryOut)
def get_journal_entry(entry_id: str, db: Session = Depends(get_db)):
    """Retrieve a single journal entry by ID."""
    entry = db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal entry with ID '{entry_id}' not found.",
        )
    return serialize_journal_entry(entry)


@router.post("/journal", response_model=JournalEntryOut, status_code=status.HTTP_201_CREATED)
def create_journal_entry(entry_in: JournalEntryCreate, db: Session = Depends(get_db)):
    """Create a new growth journal observation record."""
    entry_id = entry_in.id or f"journal-{int(time.time() * 1000)}-{secrets.token_hex(2)}"

    existing = db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A journal entry with ID '{entry_id}' already exists.",
        )

    # Validate plant relationship if supplied
    resolved_plant_name = entry_in.plant_name
    if entry_in.plant_id:
        plant = db.query(PlantModel).filter(PlantModel.id == entry_in.plant_id).first()
        if not plant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot associate journal entry with non-existent plant ID '{entry_in.plant_id}'.",
            )
        if not resolved_plant_name:
            species_str = f" ({plant.species})" if plant.species else ""
            resolved_plant_name = f"{plant.name}{species_str}"

    tags_csv = ",".join(entry_in.tags) if entry_in.tags else None
    created_at = entry_in.created_at or datetime.now(timezone.utc).isoformat()
    primary_image_url = entry_in.photos[0] if entry_in.photos else entry_in.image_url

    db_entry = JournalEntryModel(
        id=entry_id,
        plant_id=entry_in.plant_id,
        plant_name=resolved_plant_name or "General Garden",
        date=entry_in.date,
        title=entry_in.title,
        notes=entry_in.notes,
        observation_type=entry_in.observation_type,
        image_url=primary_image_url,
        growth_measurement=entry_in.growth_measurement,
        tags_csv=tags_csv,
        mood=entry_in.mood,
        plant_doctor_assessment_id=entry_in.plant_doctor_assessment_id,
        created_at=created_at,
    )

    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return serialize_journal_entry(db_entry)


@router.patch("/journal/{entry_id}", response_model=JournalEntryOut)
def update_journal_entry(
    entry_id: str,
    entry_in: JournalEntryUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing journal entry."""
    db_entry = db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id).first()
    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal entry with ID '{entry_id}' not found.",
        )

    updates = entry_in.model_dump(exclude_unset=True)
    if not updates:
        return serialize_journal_entry(db_entry)

    # Validate plant relationship if updating plant_id
    if "plant_id" in updates and updates["plant_id"]:
        plant = db.query(PlantModel).filter(PlantModel.id == updates["plant_id"]).first()
        if not plant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot associate journal entry with non-existent plant ID '{updates['plant_id']}'.",
            )
        if "plant_name" not in updates or not updates["plant_name"]:
            species_str = f" ({plant.species})" if plant.species else ""
            updates["plant_name"] = f"{plant.name}{species_str}"

    if "tags" in updates and updates["tags"] is not None:
        db_entry.tags_csv = ",".join(updates.pop("tags"))

    if "photos" in updates and updates["photos"] is not None:
        photos = updates.pop("photos")
        if photos:
            db_entry.image_url = photos[0]

    for field, value in updates.items():
        setattr(db_entry, field, value)

    db_entry.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_entry)
    return serialize_journal_entry(db_entry)


@router.delete("/journal/{entry_id}")
def delete_journal_entry(entry_id: str, db: Session = Depends(get_db)):
    """Delete a journal entry and safely clean up stored photo files."""
    db_entry = db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id).first()
    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal entry with ID '{entry_id}' not found.",
        )

    # Delete physical photo files associated with this entry
    for photo in db_entry.photos:
        try:
            p = Path(photo.stored_path)
            if p.exists() and p.is_file():
                p.unlink()
        except Exception:
            pass  # Avoid failing database deletion if file already absent

    title = db_entry.title
    db.delete(db_entry)
    db.commit()

    return {
        "success": True,
        "message": f"Journal entry '{title}' removed.",
        "id": entry_id,
    }
