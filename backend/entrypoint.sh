#!/bin/bash
set -e

DATA_DIR="/var/lib/postgresql/data"

# 1) Postgres データ初期化（省略: すでにテーブル作成は startup イベントでやる想定）

# 2) PostgreSQL をバックグラウンド起動
docker-entrypoint.sh postgres &  # 公式イメージのエントリポイントを流用
# こっから、ポートをリッスンするまで待つ
echo "Waiting for Postgres to start..."
until pg_isready -h localhost -p 5432 -U postgres; do
  sleep 1
done
echo "Postgres is ready!"

# 3) マイグレーション（テーブル自動作成）は app/main.py の startup イベントで走る想定

# 4) FastAPI 起動
exec uvicorn app.main:app --host 0.0.0.0 --port 8000