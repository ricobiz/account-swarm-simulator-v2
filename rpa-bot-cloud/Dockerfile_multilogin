FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Установка Google Chrome (без фиксированной версии, так как undetected-chromedriver сам управляет версиями)
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY requirements_multilogin.txt requirements.txt

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY multilogin_enhanced.py .
COPY rpa_bot_multilogin.py .
COPY config.py .

# Создание директорий
RUN mkdir -p /tmp/logs

# Переменные окружения
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99
ENV PORT=5000

# Экспорт порта
EXPOSE 5000

# Команда запуска (изменено имя файла)
CMD ["python", "rpa_bot_multilogin.py"]


