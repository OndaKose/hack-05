# app/schemas.py
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional 

class CommonSense(BaseModel):
    id:      int
    title:   str
    content: str
    genres: Optional[list[str]] = None
    level:   int

    class Config:
        from_attributes = True