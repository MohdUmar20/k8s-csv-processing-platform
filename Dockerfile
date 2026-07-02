FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_HOME=/app \
    PUBLIC_DIR=/shared/public \
    HOME=/home/appuser

WORKDIR ${APP_HOME}

RUN addgroup --system appuser \
    && adduser --system --ingroup appuser --home /home/appuser appuser

COPY app/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY app/ ${APP_HOME}/

RUN mkdir -p /shared/public /home/appuser/.aws \
    && chown -R appuser:appuser ${APP_HOME} /shared /home/appuser

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
