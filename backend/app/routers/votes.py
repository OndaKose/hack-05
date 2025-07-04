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
    投票を作成または更新します。
    user_id + common_sense_id が既存なら recognized を UPDATE、
    なければ INSERT（UPSERT）。
    """
    stmt = insert(models.CommonSenseVote).values(
        user_id=vote.user_id,
        common_sense_id=vote.common_sense_id,
        recognized=vote.recognized,
    ).on_conflict_do_update(
        index_elements=['user_id', 'common_sense_id'],
        set_={'recognized': vote.recognized}
    )

    try:
        db.execute(stmt)
        db.commit()
    except Exception as e:
        db.rollback()
        import traceback, sys
        traceback.print_exc(file=sys.stdout)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"投票の保存に失敗しました: {e}"
        )

    db_vote = db.query(models.CommonSenseVote).filter_by(
        user_id=vote.user_id,
        common_sense_id=vote.common_sense_id
    ).first()
    if not db_vote:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="投票データが見つかりませんでした"
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
        common_sense_id=common_sense_id
    ).first()
    if not vote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="投票なし")
    return vote


@router.get(
    "/stats/{common_sense_id}",
    status_code=status.HTTP_200_OK,
    response_model=dict
)
def vote_stats(common_sense_id: int, db: Session = Depends(get_db)):
    """
    common_sense_idに対する
      - 知っていた(recognized=True) 投票数
      - 知らなかった(recognized=False) 投票数
    を返す
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
    指定ユーザー(user_id)が投票した common_sense をすべて返す
    """
    # 1) そのユーザーの投票レコードをすべて取得
    votes = db.query(models.CommonSenseVote).filter_by(user_id=user_id).all()

    # 投票がない場合は空リストを返す
    if not votes:
        return []

    # 2) 投票した common_sense_id の一覧を作成
    common_ids = [v.common_sense_id for v in votes]

    # 3) common_sense テーブルから該当IDを一括で取得
    commons = (
        db.query(models.CommonSense)
          .filter(models.CommonSense.id.in_(common_ids))
          .all()
    )

    return commons