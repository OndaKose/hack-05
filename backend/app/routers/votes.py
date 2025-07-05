from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/vote",
    tags=["vote"],
)

@router.post(
    "/",
    response_model=schemas.Vote,
    status_code=status.HTTP_201_CREATED,
)
def create_vote(vote: schemas.VoteCreate, db: Session = Depends(get_db)):
    """
    投票を作成または更新（UPSERT）します。
    """
    stmt = insert(models.CommonSenseVote).values(
        user_id=vote.user_id,
        common_sense_id=vote.common_sense_id,
        recognized=vote.recognized,
    ).on_conflict_do_update(
        index_elements=["user_id", "common_sense_id"],
        set_={"recognized": vote.recognized},
    )

    try:
        db.execute(stmt)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"投票の保存に失敗しました: {e}",
        )

    db_vote = db.query(models.CommonSenseVote).filter_by(
        user_id=vote.user_id,
        common_sense_id=vote.common_sense_id,
    ).first()
    if not db_vote:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="投票データが見つかりませんでした",
        )
    return db_vote

@router.get(
    "/check",
    response_model=schemas.Vote,
    status_code=status.HTTP_200_OK,
)
def check_vote(user_id: int, common_sense_id: int, db: Session = Depends(get_db)):
    """
    指定ユーザー＋常識IDの投票を返却。なければ404。
    """
    vote = db.query(models.CommonSenseVote).filter_by(
        user_id=user_id,
        common_sense_id=common_sense_id,
    ).first()
    if not vote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="投票なし",
        )
    return vote

@router.get(
    "/stats/{common_sense_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def vote_stats(common_sense_id: int, db: Session = Depends(get_db)):
    """
    知っていた／知らなかった票数を返す
    """
    known = db.query(func.count(models.CommonSenseVote.id)).filter_by(
        common_sense_id=common_sense_id, recognized=True
    ).scalar() or 0
    unknown = db.query(func.count(models.CommonSenseVote.id)).filter_by(
        common_sense_id=common_sense_id, recognized=False
    ).scalar() or 0

    return {
        "common_sense_id": common_sense_id,
        "known": known,
        "unknown": unknown,
    }

@router.get(
    "/user/{user_id}",
    response_model=List[schemas.CommonSense],
    status_code=status.HTTP_200_OK,
)
def get_user_votes(user_id: int, db: Session = Depends(get_db)):
    """
    指定ユーザーの投票した common_sense をすべて返す
    """
    votes = db.query(models.CommonSenseVote).filter_by(user_id=user_id).all()
    if not votes:
        return []
    common_ids = [v.common_sense_id for v in votes]
    commons = (
        db.query(models.CommonSense)
          .filter(models.CommonSense.id.in_(common_ids))
          .all()
    )
    return commons

@router.get(
    "/user/details/{user_id}",
    response_model=List[schemas.UserVote],
    status_code=status.HTTP_200_OK,
)
def get_user_vote_details(user_id: int, db: Session = Depends(get_db)):
    """
    指定ユーザーの投票詳細（タイトル・内容・評価）を返す
    """
    votes = (
        db.query(
            models.CommonSenseVote.common_sense_id,
            models.CommonSense.title,
            models.CommonSense.content,
            models.CommonSenseVote.recognized,
        )
        .join(models.CommonSense,
              models.CommonSenseVote.common_sense_id == models.CommonSense.id)
        .filter(models.CommonSenseVote.user_id == user_id)
        .all()
    )
    return [
        schemas.UserVote(
            common_sense_id=v.common_sense_id,
            title=v.title,
            content=v.content,
            recognized=v.recognized,
        )
        for v in votes
    ]