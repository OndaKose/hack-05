# backend/app/routers/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.database import get_db
from app.models import CommonSenseVote, CommonSense
from app.schemas import UserLevel

router = APIRouter()

@router.get("/user-level/{user_id}", response_model=UserLevel)
def get_user_level(user_id: int, db: Session = Depends(get_db)):
    """
    ログイン中のユーザーが認識した常識の合計レベルを計算し、
    10ごとに1レベル上昇した結果を返す。
    """
    # 合計レベルを取得
    level_sum_result = db.query(
        func.sum(CommonSense.level).label("level_sum")  # CommonSense テーブルの level を合計
    ).join(
        CommonSenseVote, CommonSenseVote.common_sense_id == CommonSense.id
    ).filter(
        CommonSenseVote.user_id == user_id,
        CommonSenseVote.recognized == True  # 認識済みのもののみを計算
    ).first()

    level_sum = level_sum_result.level_sum or 0  # レベル合計（結果が None の場合は 0 にする）
    user_level = level_sum // 10  # 10 ごとに 1 レベル上昇

    return UserLevel(level_sum=level_sum, user_level=user_level)