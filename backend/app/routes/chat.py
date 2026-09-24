from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Consultation, Message
from app.schemas import ChatRequest, ChatResponse
from app.services import llm_service, rag_service, triage_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(data: ChatRequest, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == data.consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found.")

    # Save user message
    user_msg = Message(consultation_id=consultation.id, role="user", content=data.message)
    db.add(user_msg)
    db.commit()

    # Build message history
    messages = db.query(Message).filter(Message.consultation_id == consultation.id).order_by(Message.created_at).all()
    chat_history = [{"role": m.role, "content": m.content} for m in messages]

    # RAG retrieval
    rag_context = rag_service.retrieve(data.message)

    # LLM call
    try:
        reply = llm_service.chat_completion(chat_history, rag_context)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=500, detail="AI service is temporarily unavailable. Please try again.")

    # Save assistant message
    assistant_msg = Message(consultation_id=consultation.id, role="assistant", content=reply)
    db.add(assistant_msg)

    # Extract urgency
    urgency = triage_service.extract_urgency(reply)
    if urgency:
        consultation.urgency = urgency

    # Update consultation summary with first user message
    if not consultation.summary:
        consultation.summary = data.message[:200]

    db.commit()

    return ChatResponse(reply=reply, urgency=urgency or consultation.urgency, consultation_id=consultation.id)
