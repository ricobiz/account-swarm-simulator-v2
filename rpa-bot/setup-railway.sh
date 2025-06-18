
#!/bin/bash
echo "🚀 Автоматическая настройка Railway для RPA-бота"

# Проверяем наличие Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Устанавливаем Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
fi

echo "🔐 Логинимся в Railway (откроется браузер)..."
railway login

echo "📁 Создаем новый проект Railway..."
railway new rpa-bot-cloud

echo "🔗 Связываем с текущей директорией..."
railway link

echo "🌍 Настраиваем переменные окружения..."
railway variables set SUPABASE_URL=https://izmgzstdgoswlozinmyk.supabase.co
echo "⚠️  Установите SUPABASE_SERVICE_KEY вручную в Railway Dashboard"

echo "🚀 Запускаем первое развертывание..."
railway up

echo "✅ Готово! Ваш RPA-бот развертывается в облаке"
echo "🌐 Получите URL в Railway Dashboard"
