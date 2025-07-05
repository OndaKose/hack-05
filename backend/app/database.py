import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()  # プロジェクトルートの .env を読み込む
DATABASE_URL = os.getenv("DATABASE_URL")

# エンジンとセッション
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 依存注入用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()