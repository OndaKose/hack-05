#!/bin/sh
set -e

# 環境変数 DATABASE_URL は docker-compose.yml から注入されている想定
# db サービスが立ち上がるまで待機
echo "waiting for postgres at ${DB_HOST:-db}:${DB_PORT:-5432}..."
while ! pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" > /dev/null 2>&1; do
  sleep 1
done
echo "postgres is ready!"

# テーブル自動作成（マイグレーション代替）
python - <<'PYCODE'
from app.database import Base, engine
Base.metadata.create_all(bind=engine)
PYCODE

# FastAPI 起動
exec uvicorn app.main:app \
  --host 0.0.0.0 --port 8000 --reload