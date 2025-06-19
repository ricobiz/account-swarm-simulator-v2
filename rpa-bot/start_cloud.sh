
#!/bin/bash
# Оптимизированный скрипт запуска для Railway

echo "🚀 Запуск облачного RPA-бота на Railway..."

# Проверка переменных окружения
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Не установлена переменная SUPABASE_URL"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "⚠️  Не установлена переменная SUPABASE_SERVICE_KEY"
    echo "Бот будет работать без отправки результатов в Supabase"
fi

# Создание необходимых директорий
echo "📁 Создание директорий..."
mkdir -p screenshots logs profiles extensions downloads
chmod -R 755 screenshots logs profiles extensions downloads

# Запуск виртуального дисплея для GUI приложений
echo "🖥️  Запуск виртуального дисплея..."
Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &
export DISPLAY=:99

# Запуск window manager
echo "🪟 Запуск window manager..."
fluxbox &

# Ожидание готовности дисплея
sleep 3

# Проверка доступности Chrome
echo "🌐 Проверка Google Chrome..."
if google-chrome --version --no-sandbox --disable-dev-shm-usage; then
    echo "✅ Chrome установлен успешно"
    CHROME_VERSION=$(google-chrome --version --no-sandbox)
    echo "   Версия: $CHROME_VERSION"
else
    echo "❌ Chrome не найден или не работает"
    exit 1
fi

# Проверка Python зависимостей
echo "🐍 Проверка Python зависимостей..."
python -c "
try:
    import selenium
    import flask
    import requests
    print('✅ Основные зависимости установлены')
except ImportError as e:
    print(f'❌ Отсутствует зависимость: {e}')
    exit(1)
" || {
    echo "❌ Не все Python зависимости установлены"
    exit 1
}

# Проверка системных ресурсов
echo "💾 Проверка системных ресурсов..."
echo "   Память: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
echo "   Диск: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " используется)"}')"
echo "   CPU: $(nproc) ядер"

echo "✅ Все компоненты готовы для Railway"
echo "🤖 Запуск облачного RPA-бота..."

# Запуск основного приложения
exec python rpa_bot_cloud.py 2>&1 | tee logs/bot_output.log
