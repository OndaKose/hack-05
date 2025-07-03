# backend/Dockerfile
FROM python:3.10-slim

# 1) 作業ディレクトリ
WORKDIR /app

# 2) OS パッケージ（pg_isready 用）
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      postgresql-client \
      netcat-openbsd \
 && rm -rf /var/lib/apt/lists/*

# 3) Python パッケージ
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4) アプリケーションコードと entrypoint.sh をコピー
COPY . .

# 5) entrypoint.sh に実行権限を付与
RUN chmod +x entrypoint.sh

# 6) コンテナ起動時に entrypoint.sh を実行
ENTRYPOINT ["./entrypoint.sh"]