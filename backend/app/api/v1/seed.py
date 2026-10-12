from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.seed_data import seed_demo_data

router = APIRouter()


@router.post("/seed")
def trigger_seed_database(
    force: bool = Query(False, description="Whether to overwrite existing records with demo data"),
    db: Session = Depends(get_db),
):
    """Seed initial demonstration garden records into the database."""
    result = seed_demo_data(db=db, force=force)
    return result
