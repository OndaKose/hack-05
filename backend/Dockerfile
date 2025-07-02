FROM python:3.10-slim

WORKDIR /app

# Python 依存関係
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリコード一式
COPY app ./app

# FastAPI サーバ起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]