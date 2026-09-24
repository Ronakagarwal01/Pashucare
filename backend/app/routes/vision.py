from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import VisionResponse
from app.services import vision_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["vision"])


@router.post("/analyze-image", response_model=VisionResponse)
async def analyze_image(file: UploadFile = File(...)):
    error = vision_service.validate_image(file.content_type, file.size or 0)
    if error:
        raise HTTPException(status_code=400, detail=error)

    try:
        image_bytes = await file.read()
        if len(image_bytes) > vision_service.MAX_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File too large. Maximum: 5 MB.")

        observation = vision_service.analyze_image(image_bytes)
        return VisionResponse(
            observation=observation,
            disclaimer="This is a preliminary AI observation, not a veterinary diagnosis. Physical examination by a qualified veterinarian is recommended.",
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logger.exception("Image analysis failed")
        raise HTTPException(status_code=500, detail="Unable to process this image. Please try again.")
