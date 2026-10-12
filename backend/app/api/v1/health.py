from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint distinguishing application status and database connectivity."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unreachable: {str(e)}"

    storage_status = "ready"
    try:
        settings.upload_path.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        storage_status = f"error: {str(e)}"

    overall_status = "healthy" if db_status == "connected" and storage_status == "ready" else "degraded"

    return HealthResponse(
        status=overall_status,
        version=settings.VERSION,
        database=db_status,
        storage=storage_status,
        details={
            "project": settings.PROJECT_NAME,
            "database_url": settings.DATABASE_URL.split("?")[0],
            "upload_dir": str(settings.UPLOAD_DIR),
            "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024),
        },
    )
