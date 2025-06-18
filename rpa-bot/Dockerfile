
FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    x11vnc \
    fluxbox \
    wmctrl \
    && rm -rf /var/lib/apt/lists/*

# Установка Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Установка ChromeDriver
RUN CHROME_VERSION=$(google-chrome --version | cut -d " " -f3 | cut -d "." -f1) \
    && wget -O /tmp/chromedriver.zip "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_VERSION}/chromedriver_linux64.zip" \
    && unzip /tmp/chromedriver.zip -d /usr/local/bin/ \
    && rm /tmp/chromedriver.zip \
    && chmod +x /usr/local/bin/chromedriver

# Создание рабочей директории
WORKDIR /app

# Копирование файлов требований
COPY requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Создание необходимых директорий
RUN mkdir -p screenshots logs

# Установка переменных окружения для headless режима
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1

# Создание скрипта запуска
RUN echo '#!/bin/bash\n\
# Запуск виртуального дисплея\n\
Xvfb :99 -screen 0 1920x1080x24 &\n\
# Запуск window manager\n\
fluxbox &\n\
# Ожидание готовности дисплея\n\
sleep 2\n\
# Запуск RPA бота\n\
python rpa_bot.py' > /app/start.sh

RUN chmod +x /app/start.sh

# Открытие порта
EXPOSE 5000

# Команда запуска
CMD ["/app/start.sh"]
