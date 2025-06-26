FROM python:3.11-slim
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# ── 1. библиотеки, Chrome-зависимости, OCR ─────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        wget gnupg unzip curl ca-certificates xvfb fluxbox sudo build-essential \
        libnss3 libx11-6 libx11-xcb1 libxext6 libxfixes3 libxi6 \
        libxcursor1 libxrender1 libxinerama1 libxtst6 libfontconfig1 \
        fonts-liberation libappindicator3-1 libasound2 \
        libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 \
        libxrandr2 libgbm1 libxss1 libgconf-2-4 \
        tesseract-ocr libtesseract-dev && \
    rm -rf /var/lib/apt/lists/*

# ── 2. Google Chrome v120 (совместим с драйвером) ──────────────────────
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | \
        gpg --dearmor -o /usr/share/keyrings/google-key.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-key.gpg] \
         http://dl.google.com/linux/chrome/deb/ stable main" \
         > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable=120.0.6099.109-1 && \
    rm -rf /var/lib/apt/lists/*

# ── 3. пользователь app ────────────────────────────────────────────────
RUN useradd --create-home --shell /bin/bash app && \
    echo 'app ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN mkdir -p /app/screenshots /app/logs /app/downloads && chmod -R 755 /app
WORKDIR /app

# ── 4. Python-зависимости ──────────────────────────────────────────────
COPY rpa-bot-cloud/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /app/requirements.txt

# ── 5. исходный код ────────────────────────────────────────────────────
COPY rpa-bot-cloud/ /app/
RUN chown -R app:app /app
USER app

# ── 6. окружение ───────────────────────────────────────────────────────
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/app/.local/bin:${PATH}"
ENV CHROME_BIN=/usr/bin/google-chrome

EXPOSE 8080

# ── 7. запуск gunicorn ─────────────────────────────────────────────────
CMD ["gunicorn", "-b", "0.0.0.0:8080", "rpa_bot_cloud:app"]
