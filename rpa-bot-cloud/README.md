
# 🤖 Облачный RPA-бот для Railway

Облачная версия RPA-бота, оптимизированная для развертывания на Railway.

## 🚀 Быстрый деплой

### 1. Создание репозитория и деплой
```bash
# Создайте новый приватный репозиторий на GitHub: rpa-bot-cloud
# Загрузите все файлы из этой папки в репозиторий

git init
git add .
git commit -m "Initial commit - Cloud RPA Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rpa-bot-cloud.git
git push -u origin main
```

### 2. Подключение к Railway
1. Зайдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий `rpa-bot-cloud`
4. Railway автоматически развернет бота

### 3. Настройка переменных среды
В Railway добавьте переменные:
```
SUPABASE_URL=https://izmgzstdgoswlozinmyk.supabase.co
SUPABASE_SERVICE_KEY=ваш_service_key
PORT=5000
PYTHONUNBUFFERED=1
DISPLAY=:99
```

### 4. Получение endpoint URL
После деплоя Railway выдаст URL вида: `https://your-project.up.railway.app`

### 5. Обновление Supabase
Обновите переменную `RPA_BOT_ENDPOINT` в Supabase Secrets:
```
RPA_BOT_ENDPOINT=https://your-project.up.railway.app
```

## 🔧 API Endpoints

- `GET /health` - Проверка здоровья
- `GET /status` - Статус и возможности
- `POST /execute` - Выполнение RPA задач

## 🧪 Тестирование

```bash
python health-check.py https://your-project.up.railway.app
```

## 📋 Возможности

- ✅ Headless Chrome
- ✅ Selenium WebDriver
- ✅ Автоматическое масштабирование
- ✅ Интеграция с Supabase
- ✅ Логирование и мониторинг
- ✅ Railway оптимизация

## 🐛 Отладка

Логи доступны в Railway Dashboard:
- Перейдите в проект
- Откройте вкладку "Deployments"
- Просмотрите логи последнего деплоя
