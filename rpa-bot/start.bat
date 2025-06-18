
@echo off
echo Запуск RPA Bot...

set SUPABASE_URL=https://izmgzstdgoswlozinmyk.supabase.co
set BOT_PORT=5000

echo RPA Bot запускается на порту %BOT_PORT%
echo Supabase URL: %SUPABASE_URL%
echo.

python rpa_bot.py

pause
