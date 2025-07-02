# app/models.py
from sqlalchemy import Column, Integer, String
from .database import Base
from sqlalchemy.dialects.postgresql import ARRAY

class CommonSense(Base):
    __tablename__ = "common_sense"

    id      = Column(Integer, primary_key=True, index=True)
    title   = Column(String, nullable=False)
    content = Column(String, nullable=False)
    genres = Column(ARRAY(String), nullable=True)
    level   = Column(Integer)