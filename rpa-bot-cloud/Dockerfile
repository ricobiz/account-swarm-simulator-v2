FROM ultrafunk/undetected-chromedriver:latest

WORKDIR /app

# Python-зависимости
COPY rpa-bot-cloud/requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Копируем весь твой код
COPY rpa-bot-cloud/ ./

EXPOSE 8080

# Гарантированно сработает!
CMD ["gunicorn", "-b", "0.0.0.0:8080", "rpa_bot_cloud:app"]
