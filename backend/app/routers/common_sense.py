# backend/app/routers/common_sense.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List    # ← ここを追加！
from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/common_sense",
    tags=["common_sense"],
)

@router.get(
    "/",
    response_model=List[schemas.CommonSense],  # List を使うのでインポート必須
)
def list_common_sense(db: Session = Depends(get_db)):
    """全件取得"""
    return db.query(models.CommonSense).all()

@router.get(
    "/{cs_id}",
    response_model=schemas.CommonSense,
    status_code=status.HTTP_200_OK,
)
def get_common_sense(cs_id: int, db: Session = Depends(get_db)):
    """ID 指定取得"""
    cs = db.query(models.CommonSense).filter(models.CommonSense.id == cs_id).first()
    if not cs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"common_sense id={cs_id} not found",
        )
    return cs