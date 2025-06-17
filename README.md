
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/be782e9a-87fb-4bcd-845c-591777560958

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/be782e9a-87fb-4bcd-845c-591777560958) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/be782e9a-87fb-4bcd-845c-591777560958) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

# External Controller API

Этот проект предоставляет REST API для внешнего контроллера (AI-агента) для управления фермой аккаунтов и мониторинга.

## Настройка API

1. Настройте переменную окружения `API_KEY` в настройках Supabase Edge Functions
2. Все запросы должны содержать заголовок `x-api-key` с этим ключом

## API Endpoints

### 1. GET /api/status
Возвращает текущий статус всех аккаунтов и активных сценариев.

**Пример запроса:**
```bash
curl -X GET "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-status" \
  -H "x-api-key: YOUR_API_KEY"
```

**Пример fetch:**
```javascript
const response = await fetch('https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-status', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});
const data = await response.json();
```

**Пример ответа:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "accounts": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "user1",
      "platform": "telegram",
      "status": "working",
      "lastAction": "2024-01-15T10:25:00.000Z",
      "proxyId": "proxy-123",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T10:25:00.000Z"
    }
  ],
  "scenarios": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Telegram Posting",
      "platform": "telegram",
      "status": "running",
      "progress": 75,
      "accountsCount": 1,
      "createdAt": "2024-01-15T09:30:00.000Z",
      "updatedAt": "2024-01-15T10:25:00.000Z"
    }
  ],
  "recentErrors": 2,
  "summary": {
    "totalAccounts": 10,
    "activeAccounts": 3,
    "idleAccounts": 6,
    "errorAccounts": 1,
    "totalScenarios": 5,
    "runningScenarios": 2
  }
}
```

### 2. GET /api/logs?minutes=10
Возвращает все логи за последние X минут (по умолчанию 10).

**Пример запроса:**
```bash
curl -X GET "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-logs?minutes=30" \
  -H "x-api-key: YOUR_API_KEY"
```

**Пример fetch:**
```javascript
const response = await fetch('https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-logs?minutes=30', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});
const logs = await response.json();
```

### 3. POST /api/control/stop-account
Останавливает указанный аккаунт.

**Пример запроса:**
```bash
curl -X POST "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-control/stop-account" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"accountId": "123e4567-e89b-12d3-a456-426614174000"}'
```

**Пример fetch:**
```javascript
const response = await fetch('https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-control/stop-account', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    accountId: '123e4567-e89b-12d3-a456-426614174000'
  })
});
```

### 4. POST /api/control/restart-account
Перезапускает задачу для указанного аккаунта.

**Пример запроса:**
```bash
curl -X POST "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-control/restart-account" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"accountId": "123e4567-e89b-12d3-a456-426614174000"}'
```

### 5. POST /api/control/change-proxy
Меняет прокси для аккаунта и перезапускает с новой сессией.

**Пример запроса:**
```bash
curl -X POST "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-control/change-proxy" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"accountId": "123e4567-e89b-12d3-a456-426614174000", "proxyId": "new-proxy-456"}'
```

### 6. POST /api/control/update-settings
Обновляет настройки системы на лету.

**Пример запроса:**
```bash
curl -X POST "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1/api-control/update-settings" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "settings": {
      "maxConcurrentJobs": 5,
      "checkInterval": 30000,
      "retryAttempts": 3,
      "userAgent": "Mozilla/5.0..."
    }
  }'
```

## Использование с внешним контроллером

### Python пример:
```python
import requests

API_BASE = "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1"
API_KEY = "your-api-key"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Получить статус
status = requests.get(f"{API_BASE}/api-status", headers=headers)
print(status.json())

# Остановить аккаунт
response = requests.post(
    f"{API_BASE}/api-control/stop-account",
    headers=headers,
    json={"accountId": "123e4567-e89b-12d3-a456-426614174000"}
)
```

### Node.js пример:
```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://izmgzstdgoswlozinmyk.supabase.co/functions/v1',
  headers: {
    'x-api-key': 'your-api-key',
    'Content-Type': 'application/json'
  }
});

// Получить логи за последние 20 минут
const logs = await apiClient.get('/api-logs?minutes=20');

// Перезапустить аккаунт
const restart = await apiClient.post('/api-control/restart-account', {
  accountId: '123e4567-e89b-12d3-a456-426614174000'
});
```

## Настройка API ключа

1. Перейдите в [Edge Functions secrets](https://supabase.com/dashboard/project/izmgzstdgoswlozinmyk/settings/functions)
2. Добавьте секрет `API_KEY` с вашим ключом
3. Используйте этот ключ в заголовке `x-api-key` для всех запросов

## Мониторинг API

Логи всех API вызовов можно просматривать в:
- [Edge Function logs](https://supabase.com/dashboard/project/izmgzstdgoswlozinmyk/functions)
- Таблице `logs` в базе данных для системных событий
