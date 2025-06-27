FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# 1. Системные пакеты + git + Chrome + OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg curl ca-certificates xvfb fluxbox sudo git \
    tesseract-ocr libtesseract-dev \
    libnss3 libx11-6 libx11-xcb1 libxext6 libxfixes3 libxi6 \
    libxcursor1 libxrender1 libxinerama1 libxtst6 libfontconfig1 \
    libatk-bridge2.0-0 libxrandr2 libgbm1 libxss1 libdrm2 \
    fonts-liberation libasound2 libxcomposite1 libxdamage1 \
    && rm -rf /var/lib/apt/lists/*

# 2. Google Chrome (новый, если нужен определённый — меняй версию)
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | \
    gpg --dearmor -o /usr/share/keyrings/google-key.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-key.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# 3. Новый пользователь и папки (создаём всё сразу)
RUN useradd --create-home --shell /bin/bash app && \
    echo 'app ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
    mkdir -p /app/screenshots /app/logs /app/downloads && \
    touch /app/logs/rpa_bot.log && \
    chown -R app:app /app

WORKDIR /app

# 4. Копируем requirements
COPY rpa-bot-cloud/requirements.txt ./requirements.txt

# 5. Python deps + undetected-chromedriver (dev-ветка, если хочешь)
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir git+https://github.com/ultrafunkamsterdam/undetected-chromedriver@v4

# 6. Копируем исходники
COPY rpa-bot-cloud/ ./
RUN chown -R app:app /app

USER app

# 7. Переменные окружения
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/app/.local/bin:${PATH}"
ENV CHROME_BIN=/usr/bin/google-chrome

EXPOSE 8080

# 8. Запуск через gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8080", "rpa_bot_cloud:app"]
