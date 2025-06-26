FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# ── 1. Системные библиотеки + Chrome + OCR ─────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg unzip curl ca-certificates xvfb fluxbox \
    fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libxss1 libgconf-2-4 libnss3 libxi6 \
    libxcursor1 libxinerama1 libxtst6 libxrender1 libfontconfig1 \
    tesseract-ocr libtesseract-dev sudo build-essential && \
    rm -rf /var/lib/apt/lists/*

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | \
    gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] \
    http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google.list && \
    apt-get update && apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# ── 2. Пользователь app ─────────────────────────────────────────
RUN useradd --create-home --shell /bin/bash app && \
    echo 'app ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER app
WORKDIR /app

# ── 3. Python зависимости ───────────────────────────────────────
COPY --chown=app:app rpa-bot-cloud/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ── 4. Исходный код ─────────────────────────────────────────────
COPY --chown=app:app rpa-bot-cloud/ .

# ── 5. Каталоги для логов/скринов ───────────────────────────────
RUN mkdir -p screenshots logs downloads && chmod -R 755 screenshots logs downloads

# ── 6. Переменные окружения ─────────────────────────────────────
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/app/.local/bin:${PATH}"
ENV CHROME_BIN=/usr/bin/google-chrome

EXPOSE 8080

# ── 7. Production-запуск Gunicorn на 8080 ───────────────────────
CMD ["gunicorn", "-b", "0.0.0.0:8080", "rpa_bot_cloud:app"]
