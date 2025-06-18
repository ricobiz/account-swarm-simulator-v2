
@echo off
echo Установка RPA Bot...

echo Установка Python зависимостей...
pip install -r requirements.txt

echo Скачивание ChromeDriver...
python -c "from webdriver_manager.chrome import ChromeDriverManager; ChromeDriverManager().install()"

echo Создание директорий...
mkdir screenshots 2>nul
mkdir logs 2>nul

echo.
echo RPA Bot установлен успешно!
echo.
echo Для запуска используйте: python rpa_bot.py
echo.
pause
