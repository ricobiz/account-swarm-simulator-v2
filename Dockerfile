# Используем Python 3.11 slim
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл requirements
COPY rpa-bot-cloud/requirements_multilogin.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements_multilogin.txt

# Копируем все файлы из rpa-bot-cloud
COPY rpa-bot-cloud/ .

# Устанавливаем переменную окружения для порта
ENV PORT=8080

# Открываем порт
EXPOSE 8080

# Запускаем приложение
CMD ["python", "multilogin_enhanced.py"]

