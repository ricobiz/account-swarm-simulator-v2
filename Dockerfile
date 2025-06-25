
FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libgconf-2-4 \
    build-essential \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Установка Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Создание пользователя app и рабочей директории
RUN useradd --create-home --shell /bin/bash app
WORKDIR /app

# Обновление pip и установка Python зависимостей
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Копирование всех необходимых файлов RPA-бота из правильной папки
COPY rpa-bot-cloud/ ./

# Создание директорий с правильными правами
RUN mkdir -p /app/logs /app/screenshots /app/frontend \
    && chown -R app:app /app \
    && chmod -R 755 /app

# Переменные окружения
ENV PYTHONUNBUFFERED=1
ENV CHROME_BIN=/usr/bin/google-chrome

USER app

EXPOSE 8080

CMD ["python", "rpa_bot_cloud.py"]
