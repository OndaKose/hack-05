from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY
from .database import Base

class CommonSense(Base):
    __tablename__ = "common_sense"
    id      = Column(Integer, primary_key=True, index=True)
    title   = Column(String,  nullable=False)
    content = Column(String,  nullable=False)
    genres  = Column(ARRAY(String), nullable=True)
    level   = Column(Integer)

class User(Base):
    __tablename__ = "users"
    user_id   = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, unique=True, nullable=False, index=True)
    password  = Column(String, nullable=False)