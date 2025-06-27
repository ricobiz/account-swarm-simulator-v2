FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# 1. Системные пакеты (всё что нужно) + git
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg curl ca-certificates xvfb fluxbox sudo git \
    tesseract-ocr libtesseract-dev \
    libnss3 libx11-6 libx11-xcb1 libxext6 libxfixes3 libxi6 \
    libxcursor1 libxrender1 libxinerama1 libxtst6 libfontconfig1 \
    libatk-bridge2.0-0 libxrandr2 libgbm1 libxss1 libdrm2 \
    fonts-liberation libasound2 libxcomposite1 libxdamage1 \
    && rm -rf /var/lib/apt/lists/*

# 2. УСТАНОВКА СТРОГО Chrome 120 — прямая ссылка на .deb!
RUN wget -O /tmp/chrome.deb https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_120.0.6099.109-1_amd64.deb && \
    apt-get update && apt-get install -y /tmp/chrome.deb && \
    rm /tmp/chrome.deb && rm -rf /var/lib/apt/lists/*

# 3. Новый пользователь + все папки (делай всё заранее!)
RUN useradd --create-home --shell /bin/bash app && \
    echo 'app ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
    mkdir -p /app/screenshots /app/logs /app/downloads && \
    touch /app/logs/rpa_bot.log && \
    chown -R app:app /app

WORKDIR /app

# 4. Requirements
COPY rpa-bot-cloud/requirements.txt ./requirements.txt

# 5. Python deps + undetected-chromedriver строго 3.5.4
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "undetected-chromedriver==3.5.4"

# 6. Исходники
COPY rpa-bot-cloud/ ./
RUN chown -R app:app /app

USER app

# 7. Переменные окружения
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/app/.local/bin:${PATH}"
ENV CHROME_BIN=/usr/bin/google-chrome

EXPOSE 8080

# 8. Запуск gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8080", "rpa_bot_cloud:app"]
