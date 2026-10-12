import time
import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.plant import PlantModel
from app.models.task import CareTaskModel
from app.models.journal import JournalEntryModel
from app.schemas.plant import PlantCreate, PlantUpdate, PlantOut

router = APIRouter()


@router.get("/plants", response_model=List[PlantOut])
def get_plants(
    category: Optional[str] = Query(None, description="Filter by plant category"),
    care_status: Optional[str] = Query(None, description="Filter by care status"),
    search: Optional[str] = Query(None, description="Search plant name, species, location, notes"),
    db: Session = Depends(get_db),
):
    """Retrieve all plants with optional filtering and search."""
    query = db.query(PlantModel)

    if category and category.lower() != "all":
        query = query.filter(PlantModel.category == category)

    if care_status and care_status.lower() != "all":
        query = query.filter(PlantModel.care_status == care_status)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                PlantModel.name.ilike(s),
                PlantModel.species.ilike(s),
                PlantModel.location.ilike(s),
                PlantModel.notes.ilike(s),
                PlantModel.category.ilike(s),
            )
        )

    # Return ordered with newest added first
    plants = query.order_by(PlantModel.created_at.desc()).all()
    return plants


@router.get("/plants/{plant_id}", response_model=PlantOut)
def get_plant(plant_id: str, db: Session = Depends(get_db)):
    """Retrieve a single plant by its unique ID."""
    plant = db.query(PlantModel).filter(PlantModel.id == plant_id).first()
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plant with ID '{plant_id}' not found.",
        )
    return plant


@router.post("/plants", response_model=PlantOut, status_code=status.HTTP_201_CREATED)
def create_plant(plant_in: PlantCreate, db: Session = Depends(get_db)):
    """Create a new botanical plant record."""
    plant_id = plant_in.id or f"plant-{int(time.time() * 1000)}-{secrets.token_hex(2)}"

    # Check for existing ID
    existing = db.query(PlantModel).filter(PlantModel.id == plant_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A plant with ID '{plant_id}' already exists.",
        )

    today_str = plant_in.added_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    plant_data = plant_in.model_dump(exclude={"id", "added_date"})
    db_plant = PlantModel(
        id=plant_id,
        added_date=today_str,
        **plant_data,
    )

    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant


@router.patch("/plants/{plant_id}", response_model=PlantOut)
def update_plant(plant_id: str, plant_in: PlantUpdate, db: Session = Depends(get_db)):
    """Update an existing plant record and synchronize name changes across related entities."""
    db_plant = db.query(PlantModel).filter(PlantModel.id == plant_id).first()
    if not db_plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plant with ID '{plant_id}' not found.",
        )

    updates = plant_in.model_dump(exclude_unset=True)
    if not updates:
        return db_plant

    name_changed = "name" in updates and updates["name"] != db_plant.name
    species_changed = "species" in updates and updates["species"] != db_plant.species

    for field, value in updates.items():
        setattr(db_plant, field, value)

    # If plant name or species changed, synchronize name snapshot in tasks and journal entries
    if name_changed or species_changed:
        new_name = updates.get("name", db_plant.name)
        new_species = updates.get("species", db_plant.species)
        species_suffix = f" ({new_species})" if new_species else ""
        formatted_plant_name = f"{new_name}{species_suffix}"

        # Synchronize tasks
        db.query(CareTaskModel).filter(CareTaskModel.plant_id == plant_id).update(
            {"plant_name": formatted_plant_name},
            synchronize_session=False,
        )

        # Synchronize journal entries
        db.query(JournalEntryModel).filter(JournalEntryModel.plant_id == plant_id).update(
            {"plant_name": formatted_plant_name},
            synchronize_session=False,
        )

    db.commit()
    db.refresh(db_plant)
    return db_plant


@router.delete("/plants/{plant_id}")
def delete_plant(plant_id: str, db: Session = Depends(get_db)):
    """
    Safely delete a plant while preserving related tasks and journal entries
    by disassociating them with an archived snapshot label.
    """
    db_plant = db.query(PlantModel).filter(PlantModel.id == plant_id).first()
    if not db_plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plant with ID '{plant_id}' not found.",
        )

    plant_name = db_plant.name
    archived_label = f"{plant_name} (Archived)"

    # Safely disassociate care tasks
    db.query(CareTaskModel).filter(CareTaskModel.plant_id == plant_id).update(
        {
            "plant_id": None,
            "plant_name": archived_label,
        },
        synchronize_session=False,
    )

    # Safely disassociate journal entries
    db.query(JournalEntryModel).filter(JournalEntryModel.plant_id == plant_id).update(
        {
            "plant_id": None,
            "plant_name": archived_label,
        },
        synchronize_session=False,
    )

    db.delete(db_plant)
    db.commit()

    return {
        "success": True,
        "message": f"Plant '{plant_name}' safely removed. Related history preserved as archived.",
        "id": plant_id,
    }
