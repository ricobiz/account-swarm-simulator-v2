
# 🚀 Быстрое развертывание RPA-бота в облаке

## Один клик развертывание:

### 1. Railway (Рекомендуемый - 2 минуты)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/2hUBjx?referralCode=lovable)

**После нажатия:**
1. Выберите GitHub репозиторий
2. Установите переменную `SUPABASE_SERVICE_KEY`
3. Нажмите Deploy
4. Скопируйте URL из Railway Dashboard
5. Обновите `RPA_BOT_ENDPOINT` в Supabase

### 2. Render (Альтернатива)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-repo/rpa-bot)

### 3. Heroku (Если нужен)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Автоматическая настройка (30 секунд):

```bash
# Клонируйте и запустите
git clone your-repo
cd rpa-bot
chmod +x setup-railway.sh
./setup-railway.sh
```

## После развертывания:
1. Получите URL из облачного сервиса
2. Обновите `RPA_BOT_ENDPOINT` в Supabase секретах
3. Протестируйте RPA через ваше приложение

**Готово!** 🎉 Ваш RPA-бот работает в облаке 24/7
