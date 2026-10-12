import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.models.journal import JournalEntryModel, JournalPhotoModel
from app.schemas.journal import JournalPhotoOut

router = APIRouter()


def sanitize_filename(filename: str) -> str:
    """Removes path separators and ensures safe extension."""
    safe_name = Path(filename).name
    # Extract extension
    suffix = Path(safe_name).suffix.lower()
    if suffix in [".jpg", ".jpeg"]:
        ext = ".jpg"
    elif suffix == ".png":
        ext = ".png"
    elif suffix == ".webp":
        ext = ".webp"
    else:
        ext = ".jpg"
    return f"photo_{uuid.uuid4().hex}{ext}"


@router.post("/journal/{entry_id}/photos", response_model=JournalPhotoOut, status_code=status.HTTP_201_CREATED)
async def upload_journal_photo(
    entry_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload and attach a validated photo (JPEG, PNG, WebP <= 10MB) to a journal entry.
    Saves file to filesystem storage and creates database photo metadata.
    """
    # 1. Verify journal entry exists
    entry = db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal entry with ID '{entry_id}' not found.",
        )

    # 2. Validate MIME type
    media_type = file.content_type or ""
    if media_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported format '{media_type}'. Please upload JPEG, PNG, or WebP images.",
        )

    # 3. Read and validate file size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
        actual_mb = round(file_size / (1024 * 1024), 1)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({actual_mb} MB) exceeds maximum allowed limit of {max_mb} MB.",
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    # 4. Generate safe unique filename and write to disk
    stored_filename = sanitize_filename(file.filename or "photo.jpg")
    dest_path = settings.upload_path / stored_filename

    try:
        with open(dest_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image file: {str(e)}",
        )

    # 5. Build public retrieval URL
    photo_id = f"photo-{uuid.uuid4().hex[:12]}"
    photo_url = f"/api/v1/uploads/{stored_filename}"

    # 6. Save metadata record to database
    db_photo = JournalPhotoModel(
        id=photo_id,
        journal_entry_id=entry_id,
        stored_path=str(dest_path),
        original_filename=Path(file.filename or "photo.jpg").name,
        media_type=media_type,
        file_size=file_size,
        url=photo_url,
        uploaded_at=datetime.now(timezone.utc),
    )

    db.add(db_photo)

    # Update entry primary image if none currently set
    if not entry.image_url:
        entry.image_url = photo_url

    db.commit()
    db.refresh(db_photo)

    return JournalPhotoOut(
        id=db_photo.id,
        journal_entry_id=db_photo.journal_entry_id,
        original_filename=db_photo.original_filename,
        media_type=db_photo.media_type,
        file_size=db_photo.file_size,
        url=db_photo.url,
        uploaded_at=db_photo.uploaded_at.isoformat(),
    )


@router.delete("/journal/{entry_id}/photos/{photo_id}")
def delete_journal_photo(
    entry_id: str,
    photo_id: str,
    db: Session = Depends(get_db),
):
    """Delete a photo attachment from a journal entry and purge from filesystem."""
    photo = (
        db.query(JournalPhotoModel)
        .filter(
            JournalPhotoModel.id == photo_id,
            JournalPhotoModel.journal_entry_id == entry_id,
        )
        .first()
    )
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Photo with ID '{photo_id}' not found for entry '{entry_id}'.",
        )

    # Delete physical file
    try:
        file_path = Path(photo.stored_path)
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
    except Exception:
        pass

    db.delete(photo)

    # Refresh entry primary image_url if it was this photo
    entry = db.query(JournalEntryModel).filter(JournalEntryModel.id == entry_id).first()
    if entry and entry.image_url == photo.url:
        remaining = [p for p in entry.photos if p.id != photo_id]
        entry.image_url = remaining[0].url if remaining else None

    db.commit()

    return {
        "success": True,
        "message": f"Photo '{photo.original_filename}' deleted successfully.",
        "id": photo_id,
    }


@router.get("/uploads/{filename}")
def get_uploaded_file(filename: str):
    """Serve stored photograph securely with path-traversal prevention."""
    # Prevent directory traversal
    safe_name = Path(filename).name
    file_path = settings.upload_path / safe_name

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File '{safe_name}' not found.",
        )

    # Determine media type based on extension
    suffix = file_path.suffix.lower()
    media_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    media_type = media_map.get(suffix, "application/octet-stream")

    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )
