
#!/bin/bash
# Обновленный скрипт запуска для облачной среды Railway

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
sleep 5

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

# Проверка ChromeDriver
echo "🚗 Проверка ChromeDriver..."
if chromedriver --version; then
    echo "✅ ChromeDriver работает"
    CHROMEDRIVER_VERSION=$(chromedriver --version)
    echo "   Версия: $CHROMEDRIVER_VERSION"
else
    echo "❌ ChromeDriver не найден"
    exit 1
fi

# Проверка Python зависимостей
echo "🐍 Проверка Python зависимостей..."
python -c "
try:
    import selenium
    import flask
    import requests
    import threading
    import json
    import time
    import logging
    import os
    from datetime import datetime
    print('✅ Все основные зависимости установлены')
    
    # Проверка локальных модулей
    try:
        from cloud_rpa_bot import CloudRPABot
        from human_behavior import CloudHumanBehaviorSimulator
        from browser_manager import CloudBrowserManager
        from action_handlers import ActionHandlers
        from telegram_handler import TelegramHandler
        print('✅ Все локальные модули доступны')
    except ImportError as e:
        print(f'❌ Ошибка импорта локального модуля: {e}')
        exit(1)
        
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
echo "🔧 Поддерживаемые действия:"
echo "   📱 navigate, click, type, wait"
echo "   📜 scroll, key, move, check_element"
echo "   💬 telegram_like (специально для Telegram)"

# Запуск основного приложения
exec python rpa_bot_cloud.py 2>&1 | tee logs/bot_output.log
