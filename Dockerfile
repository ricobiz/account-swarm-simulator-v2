# Используем Python 3.11 alpine для обхода кэша Railway
FROM python:3.11-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apk add --no-cache gcc musl-dev

# Копируем requirements файл
COPY rpa-bot-cloud/requirements_multilogin.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements_multilogin.txt

# Копируем файлы приложения
COPY rpa-bot-cloud/multilogin_enhanced.py .

# Открываем порт
EXPOSE 8080

# Команда запуска
CMD ["python", "multilogin_enhanced.py"]

