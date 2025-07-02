# app/routers/common_sense.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/common_sense", tags=["common_sense"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.CommonSense])
def read_common_senses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.CommonSense).offset(skip).limit(limit).all()