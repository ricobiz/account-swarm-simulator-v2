
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
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Добавление Google Chrome репозитория и установка
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Создание пользователя app
RUN useradd --create-home --shell /bin/bash app \
    && usermod -aG sudo app \
    && echo 'app ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Создание рабочей директории
WORKDIR /app

# Установка владельца директории
RUN chown -R app:app /app

# Переключение на пользователя app
USER app

# Копирование файлов требований
COPY --chown=app:app requirements.txt .

# Установка Python зависимостей
RUN pip install --user --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY --chown=app:app . .

# Создание директорий с правильными правами
RUN mkdir -p screenshots logs profiles extensions downloads \
    && chmod -R 755 screenshots logs profiles extensions downloads

# Установка переменных окружения
ENV DISPLAY=:99
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/app/.local/bin:${PATH}"
ENV CHROME_BIN=/usr/bin/google-chrome
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Переключение обратно на root для финальной настройки
USER root

# Установка правильных прав на исполняемые файлы
RUN chmod +x start.sh rpa_bot_cloud.py \
    && chown app:app start.sh rpa_bot_cloud.py

# Возврат к пользователю app
USER app

# Открытие порта
EXPOSE 5000

# Команда запуска
CMD ["./start.sh"]
