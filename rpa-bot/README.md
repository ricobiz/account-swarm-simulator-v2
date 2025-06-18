
# RPA Bot - Автоматизация браузера

Полноценный RPA-бот для выполнения задач автоматизации браузера с поддержкой всех типов действий.

## Возможности

- ✅ Автоматизация браузера (Selenium)
- ✅ Имитация человеческого поведения
- ✅ Поддержка всех типов действий (клики, ввод, прокрутка, навигация)
- ✅ Работа с координатами и селекторами
- ✅ Скриншоты результатов
- ✅ Интеграция с Supabase
- ✅ Логирование всех операций
- ✅ Проверка здоровья сервиса

## Поддерживаемые действия

1. **navigate** - переход на URL
2. **click** - клик по элементу или координатам
3. **type** - ввод текста
4. **wait** - ожидание
5. **scroll** - прокрутка страницы
6. **key** - нажатие клавиш
7. **move** - движение мыши
8. **check_element** - проверка наличия элемента

## Установка

### Windows:
```bash
# Запустите install.bat
install.bat
```

### Linux/macOS:
```bash
# Сделайте скрипт исполняемым и запустите
chmod +x install.sh
./install.sh
```

### Ручная установка:
```bash
pip install -r requirements.txt
```

## Настройка

### Переменные окружения:
- `SUPABASE_URL` - URL вашего Supabase проекта (по умолчанию: https://izmgzstdgoswlozinmyk.supabase.co)
- `SUPABASE_SERVICE_KEY` - Service Role ключ из Supabase
- `BOT_PORT` - порт для запуска сервера (по умолчанию: 5000)

### В Supabase добавьте секрет:
- **Имя:** `RPA_BOT_ENDPOINT`
- **Значение:** `http://localhost:5000` (или ваш адрес сервера)

## Запуск

### Windows:
```bash
start.bat
```

### Linux/macOS:
```bash
python3 rpa_bot.py
```

## API Endpoints

- `GET /health` - проверка здоровья сервиса
- `GET /status` - получение статуса и возможностей бота
- `POST /execute` - выполнение RPA задачи

## Структура задачи

```json
{
  "taskId": "unique-task-id",
  "url": "https://example.com",
  "actions": [
    {"type": "navigate", "url": "https://example.com"},
    {"type": "click", "selector": "#button"},
    {"type": "type", "selector": "#input", "text": "Hello"},
    {"type": "wait", "duration": 2000},
    {"type": "scroll", "x": 0, "y": 100},
    {"type": "key", "key": "Enter"}
  ],
  "timeout": 60000
}
```

## Логи и скриншоты

- Логи сохраняются в `rpa_bot.log`
- Скриншоты сохраняются в папке `screenshots/`

## Безопасность

- Все действия логируются
- Поддержка PyAutoGUI FAILSAFE (движение мыши в угол для остановки)
- Таймауты для предотвращения зависания
- Автоматическое закрытие браузера после выполнения

## Отладка

1. Проверьте логи в файле `rpa_bot.log`
2. Убедитесь, что Chrome установлен
3. Проверьте доступность Supabase URL
4. Убедитесь, что порт 5000 свободен

## Требования

- Python 3.7+
- Google Chrome
- ChromeDriver (устанавливается автоматически)
- Стабильное интернет-соединение
