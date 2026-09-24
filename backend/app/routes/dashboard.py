from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models import Animal, Consultation
from app.schemas import DashboardStats, ConsultationListItem

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_animals = db.query(func.count(Animal.id)).scalar() or 0
    total_consultations = db.query(func.count(Consultation.id)).scalar() or 0
    active_alerts = (
        db.query(func.count(Consultation.id))
        .filter(Consultation.urgency.in_(["HIGH", "MODERATE"]))
        .scalar()
        or 0
    )

    recent = (
        db.query(Consultation)
        .options(joinedload(Consultation.animal))
        .order_by(Consultation.created_at.desc())
        .limit(10)
        .all()
    )

    return DashboardStats(
        total_animals=total_animals,
        total_consultations=total_consultations,
        active_alerts=active_alerts,
        recent_consultations=recent,
    )
