
# Multi-stage build для оптимизации
FROM node:18-alpine as frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Основной образ для RPA-бота
FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    fluxbox \
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
    sudo \
    nginx \
    supervisor \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Установка Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Создание пользователя app
RUN useradd --create-home --shell /bin/bash app \
    && usermod -aG sudo app \
    && echo 'app ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

WORKDIR /app

# Копирование frontend build
COPY --from=frontend-builder /app/dist ./frontend

# Копирование Python зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование RPA-бота
COPY rpa_bot.py health_check.py ./
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Настройка прав
RUN chown -R app:app /app \
    && mkdir -p /var/log/supervisor \
    && mkdir -p /app/screenshots /app/logs /app/profiles /app/extensions /app/downloads \
    && chmod -R 755 /app/screenshots /app/logs /app/profiles /app/extensions /app/downloads

# Переменные окружения
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1
ENV CHROME_BIN=/usr/bin/google-chrome
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

USER app

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
