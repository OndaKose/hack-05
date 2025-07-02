# backend/app/main.py
from fastapi import FastAPI
from app.routers import health, common_sense   # ← 追加

app = FastAPI()

# 既存の /health エンドポイント
app.include_router(health.router)

# ここで常識ルーターを登録
app.include_router(common_sense.router)