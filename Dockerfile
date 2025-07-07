# Используем Python 3.11 slim образ
FROM python:3.11-slim

# Устанавливаем системные зависимости для Chrome
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends

# Добавляем Google Chrome репозиторий
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'

# Устанавливаем Google Chrome
RUN apt-get update && apt-get install -y google-chrome-stable

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements и устанавливаем Python зависимости
COPY rpa-bot-cloud/requirements_multilogin.txt .
RUN pip install --no-cache-dir -r requirements_multilogin.txt

# Копируем файлы приложения
COPY rpa-bot-cloud/multilogin_enhanced.py .
COPY rpa-bot-cloud/rpa_bot_multilogin.py .
COPY rpa-bot-cloud/config.py .

# Устанавливаем переменные окружения
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99

# Экспонируем порт
EXPOSE 8000

# Команда запуска
CMD ["python", "rpa_bot_multilogin.py"]

