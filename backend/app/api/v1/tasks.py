import time
import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.task import CareTaskModel
from app.models.plant import PlantModel
from app.schemas.task import CareTaskCreate, CareTaskUpdate, CareTaskOut

router = APIRouter()


@router.get("/tasks", response_model=List[CareTaskOut])
def get_tasks(
    plant_id: Optional[str] = Query(None, description="Filter tasks by plant ID"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    task_type: Optional[str] = Query(None, description="Filter by task type"),
    due_date: Optional[str] = Query(None, description="Filter by due date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """Retrieve care tasks with optional filtering."""
    query = db.query(CareTaskModel)

    if plant_id:
        if plant_id == "unlinked":
            query = query.filter(CareTaskModel.plant_id.is_(None))
        else:
            query = query.filter(CareTaskModel.plant_id == plant_id)

    if completed is not None:
        query = query.filter(CareTaskModel.completed == completed)

    if task_type and task_type.lower() != "all":
        query = query.filter(CareTaskModel.task_type == task_type)

    if due_date:
        query = query.filter(CareTaskModel.due_date == due_date)

    tasks = query.order_by(CareTaskModel.due_date.asc(), CareTaskModel.due_time.asc()).all()
    return tasks


@router.get("/tasks/{task_id}", response_model=CareTaskOut)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """Retrieve a single care task by ID."""
    task = db.query(CareTaskModel).filter(CareTaskModel.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Care task with ID '{task_id}' not found.",
        )
    return task


@router.post("/tasks", response_model=CareTaskOut, status_code=status.HTTP_201_CREATED)
def create_task(task_in: CareTaskCreate, db: Session = Depends(get_db)):
    """Create a new care task, validating plant relationship if provided."""
    task_id = task_in.id or f"task-{int(time.time() * 1000)}-{secrets.token_hex(2)}"

    existing = db.query(CareTaskModel).filter(CareTaskModel.id == task_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A task with ID '{task_id}' already exists.",
        )

    # Validate plant relationship if supplied
    resolved_plant_name = task_in.plant_name
    if task_in.plant_id:
        plant = db.query(PlantModel).filter(PlantModel.id == task_in.plant_id).first()
        if not plant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot associate task with non-existent plant ID '{task_in.plant_id}'.",
            )
        if not resolved_plant_name:
            species_str = f" ({plant.species})" if plant.species else ""
            resolved_plant_name = f"{plant.name}{species_str}"

    task_data = task_in.model_dump(exclude={"id"})
    task_data["plant_name"] = resolved_plant_name
    if not task_data.get("created_at"):
        task_data["created_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    db_task = CareTaskModel(
        id=task_id,
        **task_data,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.patch("/tasks/{task_id}", response_model=CareTaskOut)
def update_task(task_id: str, task_in: CareTaskUpdate, db: Session = Depends(get_db)):
    """Update care task fields or toggle completion."""
    db_task = db.query(CareTaskModel).filter(CareTaskModel.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Care task with ID '{task_id}' not found.",
        )

    updates = task_in.model_dump(exclude_unset=True)
    if not updates:
        return db_task

    # Validate plant relationship if updating plant_id
    if "plant_id" in updates and updates["plant_id"]:
        plant = db.query(PlantModel).filter(PlantModel.id == updates["plant_id"]).first()
        if not plant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot associate task with non-existent plant ID '{updates['plant_id']}'.",
            )
        if "plant_name" not in updates or not updates["plant_name"]:
            species_str = f" ({plant.species})" if plant.species else ""
            updates["plant_name"] = f"{plant.name}{species_str}"

    # Handle completion timestamp automatically if completion toggled
    if "completed" in updates:
        new_completed = updates["completed"]
        if new_completed and not db_task.completed:
            if not updates.get("completed_at"):
                updates["completed_at"] = datetime.now(timezone.utc).isoformat()
        elif not new_completed and db_task.completed:
            updates["completed_at"] = None

    for field, value in updates.items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    """Delete a care task from schedule."""
    db_task = db.query(CareTaskModel).filter(CareTaskModel.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Care task with ID '{task_id}' not found.",
        )

    title = db_task.title
    db.delete(db_task)
    db.commit()

    return {
        "success": True,
        "message": f"Care task '{title}' removed from schedule.",
        "id": task_id,
    }
