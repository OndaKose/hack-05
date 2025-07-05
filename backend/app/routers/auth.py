# backend/app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED,
)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    新規ユーザー登録
    """
    # ユーザー名の重複チェック
    existing = db.query(models.User).filter(models.User.user_name == user.user_name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="このユーザー名はすでに使われています")

    # パスワードはハッシュ化を行う場合はここでハッシュ化
    db_user = models.User(user_name=user.user_name, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post(
    "/login",
    response_model=schemas.UserOut,
    status_code=status.HTTP_200_OK,
)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    ユーザー認証（ログイン）
    """
    db_user = db.query(models.User).filter(models.User.user_name == user.user_name).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名かパスワードが違います",
        )
    return db_user


@router.get(
    "/level/{user_id}",
    response_model=schemas.UserLevel,
    status_code=status.HTTP_200_OK,
)
def get_user_level(user_id: int, db: Session = Depends(get_db)):
    """
    ログイン中のユーザーが recognized=True の投票を行った common_sense の
    level を合計し、10ごとに 1 レベル上昇した結果を返す。
    """
    # 合計レベルポイントを取得
    level_sum = (
        db.query(func.sum(models.CommonSense.level))
          .join(models.CommonSenseVote, models.CommonSenseVote.common_sense_id == models.CommonSense.id)
          .filter(
              models.CommonSenseVote.user_id == user_id,
              models.CommonSenseVote.recognized == True,
          )
          .scalar()
        or 0
    )

    # 10 ポイントごとにレベルを 1 上げる
    user_level = level_sum // 10

    return schemas.UserLevel(level_sum=level_sum, user_level=user_level)