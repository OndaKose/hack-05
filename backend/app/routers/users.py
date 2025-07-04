# backend/app/routers/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post(
    "/register",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED
)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # ユーザー名の重複チェック
    if db.query(models.User).filter(models.User.user_name == user.user_name).first():
        raise HTTPException(status_code=400, detail="username already taken")
    hashed = hash_password(user.password)
    db_user = models.User(user_name=user.user_name, password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.UserOut)
def login(form: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.user_name == form.user_name).first()
    if not db_user or not verify_password(form.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return db_user