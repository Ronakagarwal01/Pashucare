from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Consultation, Animal, Message
from app.schemas import ConsultationCreate, ConsultationOut, ConsultationListItem, CaseSummaryRequest, CaseSummaryResponse
from app.services import llm_service, rag_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["consultations"])


@router.post("/consultations", response_model=ConsultationOut)
def create_consultation(data: ConsultationCreate, db: Session = Depends(get_db)):
    animal = db.query(Animal).filter(Animal.id == data.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found.")
    consultation = Consultation(animal_id=data.animal_id)
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return db.query(Consultation).options(joinedload(Consultation.animal), joinedload(Consultation.messages)).filter(Consultation.id == consultation.id).first()


@router.get("/consultations", response_model=list[ConsultationListItem])
def list_consultations(db: Session = Depends(get_db)):
    return (
        db.query(Consultation)
        .options(joinedload(Consultation.animal))
        .order_by(Consultation.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/consultations/{consultation_id}", response_model=ConsultationOut)
def get_consultation(consultation_id: int, db: Session = Depends(get_db)):
    c = (
        db.query(Consultation)
        .options(joinedload(Consultation.animal), joinedload(Consultation.messages))
        .filter(Consultation.id == consultation_id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found.")
    return c


@router.post("/case-summary", response_model=CaseSummaryResponse)
def generate_case_summary(data: CaseSummaryRequest, db: Session = Depends(get_db)):
    consultation = (
        db.query(Consultation)
        .options(joinedload(Consultation.animal), joinedload(Consultation.messages))
        .filter(Consultation.id == data.consultation_id)
        .first()
    )
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found.")

    animal = consultation.animal
    animal_info = f"Name: {animal.name}, Species: {animal.species}, Breed: {animal.breed}, Age: {animal.age}, Gender: {animal.gender}, Weight: {animal.weight or 'N/A'} kg"

    conversation = "\n".join([f"{m.role.upper()}: {m.content}" for m in consultation.messages])

    all_user_messages = " ".join([m.content for m in consultation.messages if m.role == "user"])
    rag_context = rag_service.retrieve(all_user_messages) if all_user_messages else ""

    try:
        summary = llm_service.generate_case_summary(animal_info, conversation, rag_context)
        return CaseSummaryResponse(summary=summary)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        logger.exception("Case summary generation failed")
        raise HTTPException(status_code=500, detail="Unable to generate case summary. Please try again.")
