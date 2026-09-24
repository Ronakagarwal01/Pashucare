from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import Animal
from app.routes import animals, consultations, chat, vision, dashboard

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created.")

    # Initialize RAG
    try:
        from app.services import rag_service
        rag_service.initialize()
    except Exception:
        logger.exception("RAG initialization failed.")

    # Seed sample animal profiles if database is empty
    db = SessionLocal()
    try:
        if db.query(Animal).count() == 0:
            sample_animals = [
                Animal(
                    name="Gauri",
                    species="Cow",
                    breed="Gir",
                    age="4 years",
                    gender="Female",
                    weight=385.0,
                    notes="Milking dairy cow, regular vaccination schedule.",
                ),
                Animal(
                    name="Sheru",
                    species="Dog",
                    breed="Labrador Retriever",
                    age="3 years",
                    gender="Male",
                    weight=29.0,
                    notes="Active household dog, vaccinated against rabies.",
                ),
                Animal(
                    name="Munni",
                    species="Goat",
                    breed="Beetal",
                    age="2 years",
                    gender="Female",
                    weight=34.0,
                    notes="Farm goat, active and grazing normally.",
                ),
            ]
            db.add_all(sample_animals)
            db.commit()
            logger.info("Sample animal profiles seeded successfully.")
    except Exception as e:
        logger.warning(f"Animal seeding skipped: {e}")
    finally:
        db.close()

    yield
    # Shutdown
    logger.info("Shutting down PashuCare AI backend.")


app = FastAPI(title="PashuCare AI", version="1.0.0", lifespan=lifespan)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"^https?:\/\/(localhost|127\.0\.0\.1|.*\.pages\.dev|.*\.workers\.dev)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(animals.router)
app.include_router(consultations.router)
app.include_router(chat.router)
app.include_router(vision.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "PashuCare AI",
        "api_configured": bool(settings.openai_api_key),
        "model": settings.openai_model,
    }
