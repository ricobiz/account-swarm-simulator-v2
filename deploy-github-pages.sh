#!/bin/bash

# 🚀 Скрипт автоматического развертывания AI Orchestra на GitHub Pages

echo "🎼 AI Orchestra - Развертывание на GitHub Pages"
echo "================================================"

# Проверяем наличие git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен. Установите Git и попробуйте снова."
    exit 1
fi

# Создаем новую ветку gh-pages если её нет
echo "📁 Подготавливаем ветку gh-pages..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Добавляем все файлы для мобильной демонстрации
echo "📱 Подготавливаем мобильную версию..."

# Копируем мобильную демо как индексную страницу
cp mobile-demo.html gh-pages-index.html

# Создаем специальную индексную страницу с выбором версий
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎼 AI Orchestra - Выберите версию</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 500px;
        }
        .logo {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        h1 {
            margin-bottom: 30px;
            font-size: 2rem;
        }
        .version-btn {
            display: block;
            width: 100%;
            padding: 20px;
            margin: 15px 0;
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 15px;
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .version-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        .mobile-btn {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
        }
        .desktop-btn {
            background: linear-gradient(45deg, #4CAF50, #2196F3);
        }
        .description {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎼</div>
        <h1>AI Orchestra</h1>
        <p>Система оркестрации ИИ-ассистентов</p>
        
        <a href="mobile-demo.html" class="version-btn mobile-btn">
            📱 Мобильная версия
            <div class="description">Для телефонов и планшетов</div>
        </a>
        
        <a href="desktop-demo.html" class="version-btn desktop-btn">
            💻 Десктоп версия
            <div class="description">Полная функциональность для компьютеров</div>
        </a>
        
        <p style="margin-top: 30px; font-size: 0.8rem; opacity: 0.6;">
            Управляйте до 6 окон с ИИ одновременно<br>
            Автоматическая оркестрация сообщений
        </p>
    </div>
</body>
</html>
EOF

# Копируем основное приложение как десктоп версию
if [ -f "ai-orchestra-main.html" ]; then
    cp ai-orchestra-main.html desktop-demo.html
else
    # Создаем ссылку на основное приложение, если файл называется по-другому
    if [ -f "index_old.html" ]; then
        cp index_old.html desktop-demo.html
    else
        echo "⚠️  Основной файл приложения не найден. Используем mobile-demo как desktop версию."
        cp mobile-demo.html desktop-demo.html
    fi
fi

# Добавляем все файлы в git
echo "📦 Добавляем файлы в Git..."
git add .
git add -f mobile-demo.html
git add -f index.html
git add -f desktop-demo.html

# Коммитим изменения
echo "💾 Создаем коммит..."
git commit -m "🚀 Deploy AI Orchestra to GitHub Pages

- ✅ Mobile demo ready for iPhone
- ✅ Desktop version included  
- ✅ Auto-orchestration functionality
- ✅ Multi-window AI management

Features:
- 📱 Mobile-optimized interface
- 🎼 AI message orchestration
- 💬 Real-time chat simulation
- ⚡ Touch-friendly controls"

# Пушим в GitHub
echo "🌐 Загружаем на GitHub..."
git push origin gh-pages -f

echo ""
echo "✅ Развертывание завершено!"
echo ""
echo "📱 Ваше приложение будет доступно по адресу:"
echo "   https://ваш-username.github.io/ваш-репозиторий/"
echo ""
echo "🔧 Следующие шаги:"
echo "   1. Зайдите в настройки репозитория на GitHub"
echo "   2. Найдите раздел 'Pages'"
echo "   3. Выберите источник: 'Deploy from branch'"
echo "   4. Выберите ветку: 'gh-pages'"
echo "   5. Нажмите 'Save'"
echo ""
echo "⏰ Подождите 1-2 минуты для активации GitHub Pages"
echo ""
echo "📱 Для iPhone:"
echo "   - Откройте ссылку в Safari"
echo "   - Нажмите 'Поделиться' → 'На экран Домой'"
echo "   - Наслаждайтесь AI Orchestra!"

# Возвращаемся на основную ветку
git checkout main 2>/dev/null || git checkout master 2>/dev/null

echo ""
echo "🎉 Готово! AI Orchestra готов к использованию на iPhone!"