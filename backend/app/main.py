# hack-05/backend/app/main.py
from fastapi import FastAPI
from app.database import Base, engine  # Base と engine をインポート
from app.routers import common_sense

app = FastAPI()

# ── ここを追加 ───────────────────────────
@app.on_event("startup")
def on_startup():
    # マイグレーションがまだなら、ここでテーブルを全部作る
    Base.metadata.create_all(bind=engine)
# ────────────────────────────────────────

app.include_router(common_sense.router)