from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/common_sense", tags=["common_sense"])

@router.get("/", response_model=list[schemas.CommonSense])
def read_common_sense(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return db.query(models.CommonSense).offset(skip).limit(limit).all()