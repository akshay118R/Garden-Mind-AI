import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.plant import PlantModel
from app.schemas.doctor import (
    AnalysisResultOut,
    DoctorStatusOut,
    PlantDoctorContext,
)
from app.services.ai.service import doctor_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plant-doctor")


@router.get("/status", response_model=DoctorStatusOut)
def get_plant_doctor_status():
    """
    Returns the current readiness, model metadata, and capability information
    for the AI Plant Doctor service.
    """
    return doctor_service.get_status()


@router.post(
    "/analyze",
    response_model=AnalysisResultOut,
    status_code=status.HTTP_200_OK,
)
async def analyze_plant_image(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    context: Optional[str] = Form(None),
    selected_plant_id: Optional[str] = Form(None),
    plant_name: Optional[str] = Form(None),
    species: Optional[str] = Form(None),
    symptoms: Optional[str] = Form(None),
    affected_area: Optional[str] = Form(None),
    growing_location: Optional[str] = Form(None),
    recent_care_changes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Analyzes an uploaded leaf/plant photo using genuine local ONNX MobileNetV2 inference.
    Accepts either `image` or `file` as the multipart upload field.
    Accepts context as a JSON string (`context`) or individual form parameters.
    """
    upload_file = image or file
    if not upload_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided in upload. Please provide an 'image' or 'file' field.",
        )

    # Parse context
    parsed_context: Optional[PlantDoctorContext] = None
    if context:
        try:
            data = json.loads(context)
            parsed_context = PlantDoctorContext(**data)
        except Exception as e:
            logger.warning(f"Failed to parse context JSON: {e}")
            parsed_context = None

    if not parsed_context:
        # Fall back to separate form fields if provided
        parsed_context = PlantDoctorContext(
            selected_plant_id=selected_plant_id,
            plant_name=plant_name,
            species=species,
            symptoms=symptoms,
            affected_area=affected_area,  # type: ignore
            growing_location=growing_location,
            recent_care_changes=recent_care_changes,
        )

    # If selected_plant_id is provided, cross-check against database to enrich context if missing
    if parsed_context.selected_plant_id:
        db_plant = (
            db.query(PlantModel)
            .filter(PlantModel.id == parsed_context.selected_plant_id)
            .first()
        )
        if db_plant:
            if not parsed_context.plant_name:
                parsed_context.plant_name = db_plant.name
            if not parsed_context.species and db_plant.species:
                parsed_context.species = db_plant.species

    try:
        contents = await upload_file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded image data: {str(e)}",
        )

    try:
        result = await doctor_service.analyze_plant_image(
            image_bytes=contents,
            filename=upload_file.filename or "leaf.jpg",
            context=parsed_context,
        )
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(re),
        )
    except Exception as e:
        logger.error(f"Unexpected inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Plant Doctor inference pipeline encountered an unexpected internal error.",
        )
