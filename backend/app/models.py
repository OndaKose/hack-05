# backend/app/models.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from .database import Base

class CommonSense(Base):
    __tablename__ = "common_sense"

    id      = Column(Integer, primary_key=True, index=True)
    title   = Column(String,  nullable=False)
    content = Column(String,  nullable=False)
    genres  = Column(ARRAY(String), nullable=True)
    level   = Column(Integer, nullable=False)

    # CommonSenseVote とのリレーション
    votes = relationship("CommonSenseVote", back_populates="common_sense")


class User(Base):
    __tablename__ = "users"

    user_id   = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, unique=True, nullable=False, index=True)
    password  = Column(String, nullable=False)

    # CommonSenseVote とのリレーション
    votes = relationship("CommonSenseVote", back_populates="user")


class CommonSenseVote(Base):
    __tablename__ = "common_sense_vote"
    __table_args__ = (
        # user_id + common_sense_id の組み合わせを一意にする
        UniqueConstraint('user_id', 'common_sense_id', name='uq_user_sense'),
    )

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    common_sense_id  = Column(Integer, ForeignKey("common_sense.id"), nullable=False)
    recognized       = Column(Boolean, nullable=False)

    # リレーション
    user          = relationship("User", back_populates="votes")
    common_sense  = relationship("CommonSense", back_populates="votes")