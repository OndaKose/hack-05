# ベースイメージ（Python 3.10 を使用）
FROM python:3.10-slim

# 作業ディレクトリを /app に設定
WORKDIR /app

# 依存関係ファイルをコピーしてインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# 環境変数を設定 (.env も読み込めるように)
ENV PYTHONUNBUFFERED=1

# コンテナ起動時に実行するコマンド
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]