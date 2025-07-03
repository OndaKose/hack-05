# backend/app/schemas.py

from pydantic import BaseModel
from typing import Optional

class CommonSense(BaseModel):
    id:      int
    title:   str
    content: str
    genres:  Optional[list[str]] = None
    level:   int
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    user_name: str
    password:   str

class UserOut(BaseModel):
    user_id:   int
    user_name: str
    class Config:
        from_attributes = True