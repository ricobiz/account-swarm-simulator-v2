
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# Системные пакеты + Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg curl ca-certificates xvfb \
    libnss3 libx11-6 libx11-xcb1 libxext6 libxfixes3 libxi6 \
    libxcursor1 libxrender1 libxinerama1 libxtst6 libfontconfig1 \
    libatk-bridge2.0-0 libxrandr2 libgbm1 libxss1 libdrm2 \
    fonts-liberation libasound2 libxcomposite1 libxdamage1 \
    && rm -rf /var/lib/apt/lists/*

# Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | \
    gpg --dearmor -o /usr/share/keyrings/google-key.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-key.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Пользователь и папки
RUN useradd --create-home --shell /bin/bash app && \
    mkdir -p /app/logs && \
    touch /app/logs/rpa_bot.log && \
    chown -R app:app /app

WORKDIR /app

# Python зависимости
COPY requirements.txt ./requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Исходники
COPY . ./
RUN chown -R app:app /app

USER app

# Окружение
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1
ENV CHROME_BIN=/usr/bin/google-chrome

EXPOSE 8080

CMD ["python", "rpa_bot_cloud.py"]
