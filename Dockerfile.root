# 1. Базовый образ
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# # 2. Системные зависимости
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        wget gnupg unzip curl ca-certificates \
        fonts-liberation libappindicator3-1 libasound2 \
        libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 \
        libxrandr2 libgbm1 libxss1 libgconf-2-4 build-essential \
        tesseract-ocr libtesseract-dev && \
    rm -rf /var/lib/apt/lists/*

# 3. Google Chrome Stable
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | \
       gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] \
         http://dl.google.com/linux/chrome/deb/ stable main" \
         > /etc/apt/sources.list.d/google.list && \
    apt-get update && apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# 4. Пользователь и рабочая директория
RUN useradd --create-home --shell /bin/bash app
WORKDIR /app

# 5. Python зависимости
COPY rpa-bot-cloud/requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# 6. Исходный код бота
COPY rpa-bot-cloud/ ./

# 7. Директории для логов, скринов и т.п.
RUN mkdir -p /app/logs /app/screenshots /app/frontend && \
    chown -R app:app /app && chmod -R 755 /app

# 8. Переменные окружения
ENV PYTHONUNBUFFERED=1
ENV CHROME_BIN=/usr/bin/google-chrome

# 9. Переключаемся на непривилегированного пользователя
USER app

EXPOSE 8080

# 10. Production-запуск на 0.0.0.0:8080
CMD ["gunicorn", "-b", "0.0.0.0:8080", "rpa_bot_cloud:app"]
