FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app/app
COPY ./app/.env /app/app/.env
COPY ./app/alembic /app/app/alembic
COPY ./app/alembic.ini /app/app/alembic.ini
ENV PYTHONPATH=/app/app
EXPOSE 8000

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000", "--access-logfile", "-"]
