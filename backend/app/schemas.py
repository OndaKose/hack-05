from pydantic import BaseModel
from typing import Optional, List

# --- CommonSense 用スキーマ ---
class CommonSenseBase(BaseModel):
    title:   str
    content: str
    genres:  Optional[List[str]] = None
    level:   int

class CommonSenseCreate(CommonSenseBase):
    pass

class CommonSense(CommonSenseBase):
    id: int

    class Config:
        orm_mode = True

# --- User 用スキーマ ---
class UserCreate(BaseModel):
    user_name: str
    password:  str

class UserOut(BaseModel):
    user_id:   int
    user_name: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    user_name: str
    password:  str

# --- Vote 用スキーマ ---
class VoteCreate(BaseModel):
    user_id:         int
    common_sense_id: int
    recognized:      bool

class Vote(BaseModel):
    id:               int
    user_id:          int
    common_sense_id:  int
    recognized:       bool

    class Config:
        orm_mode = True

# --- UserVote 用スキーマ ---
class UserVote(BaseModel):
    common_sense_id: int
    title:           str
    content:         str
    recognized:      bool

    class Config:
        orm_mode = True

# --- UserLevel 用スキーマ ---
class UserLevel(BaseModel):
    level_sum:  int
    user_level: int

    class Config:
        orm_mode = True