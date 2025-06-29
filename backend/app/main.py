from fastapi import FastAPI, Depends
from app.database import engine, Base, SessionLocal
from app.routers import health

# テーブル自動作成（開発用）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CommonSense API")

app.include_router(health.router)