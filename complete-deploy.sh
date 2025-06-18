
#!/bin/bash

echo "🚀 ПОЛНЫЙ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ RPA-БОТА"
echo "========================================"

# 1. Деплой на Railway
echo "Шаг 1: Деплой на Railway..."
./deploy-to-railway.sh

# Получаем URL из логов Railway (простой способ)
cd rpa-bot-cloud
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null)

if [ -z "$RAILWAY_URL" ] || [ "$RAILWAY_URL" = "null" ]; then
    echo "⚠️  Получите URL Railway вручную и запустите:"
    echo "   node ../update-supabase-endpoint.js YOUR_RAILWAY_URL"
    echo "   node ../test-rpa-workflow.js YOUR_RAILWAY_URL"
    exit 1
fi

cd ..

# 2. Обновляем Supabase
echo "Шаг 2: Обновляем Supabase..."
node update-supabase-endpoint.js "$RAILWAY_URL"

# 3. Тестируем workflow
echo "Шаг 3: Тестируем workflow..."
node test-rpa-workflow.js "$RAILWAY_URL"

echo ""
echo "🎉 ДЕПЛОЙ ЗАВЕРШЕН!"
echo "=================="
echo "🌐 URL бота: $RAILWAY_URL"
echo "🔧 Обновите RPA_BOT_ENDPOINT в Supabase на: $RAILWAY_URL"
echo "🧪 Протестируйте через RPA Dashboard"
