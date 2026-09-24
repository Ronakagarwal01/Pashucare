from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Animal ──

class AnimalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., min_length=1, max_length=50)
    breed: str = ""
    age: str = ""
    gender: str = ""
    weight: Optional[float] = None
    notes: str = ""


class AnimalOut(BaseModel):
    id: int
    name: str
    species: str
    breed: str
    age: str
    gender: str
    weight: Optional[float]
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Consultation ──

class ConsultationCreate(BaseModel):
    animal_id: int


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConsultationOut(BaseModel):
    id: int
    animal_id: int
    urgency: str
    summary: str
    created_at: datetime
    animal: Optional[AnimalOut] = None
    messages: list[MessageOut] = []

    model_config = {"from_attributes": True}


class ConsultationListItem(BaseModel):
    id: int
    animal_id: int
    urgency: str
    summary: str
    created_at: datetime
    animal: Optional[AnimalOut] = None

    model_config = {"from_attributes": True}


# ── Chat ──

class ChatRequest(BaseModel):
    consultation_id: int
    message: str = Field(..., min_length=1, max_length=5000)


class ChatResponse(BaseModel):
    reply: str
    urgency: str
    consultation_id: int


# ── Vision ──

class VisionResponse(BaseModel):
    observation: str
    disclaimer: str


# ── Dashboard ──

class DashboardStats(BaseModel):
    total_animals: int
    total_consultations: int
    active_alerts: int
    recent_consultations: list[ConsultationListItem]


# ── Case Summary ──

class CaseSummaryRequest(BaseModel):
    consultation_id: int


class CaseSummaryResponse(BaseModel):
    summary: str
