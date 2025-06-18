
#!/bin/bash

echo "🚀 Автоматический деплой RPA-бота на Railway"
echo "=============================================="

# Проверяем наличие Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Устанавливаем Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
    echo "✅ Railway CLI установлен"
fi

# Проверяем авторизацию в Railway
echo "🔐 Проверяем авторизацию Railway..."
if ! railway auth whoami &> /dev/null; then
    echo "🔑 Требуется авторизация в Railway..."
    railway login
fi

# Переходим в директорию RPA бота
cd rpa-bot-cloud

echo "🏗️  Создаем новый проект Railway..."
railway new rpa-bot-production --template empty

echo "🔗 Связываем с текущей директорией..."
railway link

echo "🌍 Настраиваем переменные окружения..."
railway variables set SUPABASE_URL=https://izmgzstdgoswlozinmyk.supabase.co
railway variables set PYTHONUNBUFFERED=1
railway variables set DISPLAY=:99

echo "🚀 Запускаем деплой..."
railway up --detach

echo "⏳ Ожидаем завершения деплоя..."
sleep 30

echo "🌐 Получаем URL проекта..."
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null)

if [ -z "$RAILWAY_URL" ] || [ "$RAILWAY_URL" = "null" ]; then
    echo "⚠️  Не удалось автоматически получить URL. Получите его из Railway Dashboard."
    railway status
else
    echo "✅ Проект развернут: $RAILWAY_URL"
    
    # Тестируем health endpoint
    echo "🔍 Тестируем health endpoint..."
    HEALTH_RESPONSE=$(curl -s "$RAILWAY_URL/health" || echo "failed")
    
    if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
        echo "✅ Health check прошел успешно"
        echo "📝 URL для обновления в Supabase: $RAILWAY_URL"
    else
        echo "❌ Health check не прошел. Проверьте логи:"
        railway logs
    fi
fi

echo ""
echo "📋 ОТЧЕТ О ДЕПЛОЕ:"
echo "=================="
echo "🏠 Проект: rpa-bot-production"
echo "🌐 URL: $RAILWAY_URL"
echo "📍 Endpoints:"
echo "   - Health: $RAILWAY_URL/health"
echo "   - Execute: $RAILWAY_URL/execute"
echo "   - Status: $RAILWAY_URL/status"
echo ""
echo "🔧 Следующие шаги:"
echo "1. Обновите RPA_BOT_ENDPOINT в Supabase Secrets на: $RAILWAY_URL"
echo "2. Проверьте работу через RPA Dashboard"
echo ""
echo "🚀 Деплой завершен!"
