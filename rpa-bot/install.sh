
#!/bin/bash
echo "Установка RPA Bot..."

# Установка Python зависимостей
echo "Установка Python зависимостей..."
pip3 install -r requirements.txt

# Установка Chrome (для Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    echo "Установка Google Chrome..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
    sudo apt-get update
    sudo apt-get install -y google-chrome-stable
fi

# Создание директорий
echo "Создание директорий..."
mkdir -p screenshots
mkdir -p logs

echo ""
echo "RPA Bot установлен успешно!"
echo ""
echo "Для запуска используйте: python3 rpa_bot.py"
echo ""
