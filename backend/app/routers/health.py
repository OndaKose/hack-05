# backend/app/routers/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "ok"}