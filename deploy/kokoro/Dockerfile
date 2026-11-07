# Educa+ Digital — APENAS motor Kokoro CPU da videochamada (não hospeda outro site).
# Build no diretório RAIZ: docker build -f deploy/kokoro/Dockerfile -t educa-kokoro .
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    LIA_TTS_ENGINE=kokoro \
    LIA_PREWARM_VOICE=true \
    LIA_MUSETALK_ENABLED=false \
    HF_HOME=/home/app/.cache/huggingface \
    PYTHONPATH=/app:/app/lia_motor
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 libgomp1 espeak-ng ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY lia_motor/requirements.txt /app/lia_motor/requirements.txt
# Evita baixar bibliotecas CUDA enormes quando a implantação não possui GPU.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r /app/lia_motor/requirements.txt
COPY lia_motor/ /app/lia_motor/
RUN useradd -m -u 10001 app && \
    mkdir -p /app/lia_motor/generated /home/app/.cache/huggingface && \
    chown -R app:app /app/lia_motor/generated /home/app/.cache
USER app
EXPOSE 7860
CMD ["sh", "-c", "exec uvicorn lia_motor.server:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1"]
