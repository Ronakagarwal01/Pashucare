from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Animal
from app.schemas import AnimalCreate, AnimalOut

router = APIRouter(prefix="/api/animals", tags=["animals"])


@router.post("", response_model=AnimalOut)
def create_animal(data: AnimalCreate, db: Session = Depends(get_db)):
    animal = Animal(**data.model_dump())
    db.add(animal)
    db.commit()
    db.refresh(animal)
    return animal


@router.get("", response_model=list[AnimalOut])
def list_animals(db: Session = Depends(get_db)):
    return db.query(Animal).order_by(Animal.created_at.desc()).all()


@router.get("/{animal_id}", response_model=AnimalOut)
def get_animal(animal_id: int, db: Session = Depends(get_db)):
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found.")
    return animal
