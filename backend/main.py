# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.common_sense import router as common_sense_router
from app.routers.auth         import router as auth_router
from app.routers.votes        import router as votes_router
from app.routers.users        import router as users_router

app = FastAPI(title="Common Sense API")

@app.on_event("startup")
def on_startup():
    # テーブル自動作成
    Base.metadata.create_all(bind=engine)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(common_sense_router)
app.include_router(auth_router)
app.include_router(votes_router)
app.include_router(users_router)