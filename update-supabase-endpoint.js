
#!/usr/bin/env node

/**
 * Скрипт для автоматического обновления RPA_BOT_ENDPOINT в Supabase
 * Использует Supabase Management API
 */

const https = require('https');

const SUPABASE_PROJECT_ID = 'izmgzstdgoswlozinmyk';

async function updateSupabaseSecret(railwayUrl) {
    console.log('🔧 Обновляем RPA_BOT_ENDPOINT в Supabase...');
    
    // Для обновления секретов нужен Access Token пользователя
    console.log('⚠️  Для автоматического обновления секретов нужен Supabase Access Token');
    console.log('📝 Вручную обновите RPA_BOT_ENDPOINT в Supabase Dashboard:');
    console.log(`   Значение: ${railwayUrl}`);
    console.log(`   URL: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/functions`);
}

async function testRPABot(railwayUrl) {
    console.log('🧪 Тестируем RPA-бота...');
    
    try {
        const healthUrl = `${railwayUrl}/health`;
        console.log(`🔍 Проверяем: ${healthUrl}`);
        
        // Простая проверка доступности
        const response = await fetch(healthUrl);
        const data = await response.json();
        
        if (data.status === 'ok') {
            console.log('✅ Health check успешен');
            console.log(`📊 Статус: ${data.status}`);
            console.log(`🏷️  Версия: ${data.version}`);
            console.log(`🌍 Среда: ${data.environment}`);
            return true;
        } else {
            console.log('❌ Health check не прошел');
            return false;
        }
    } catch (error) {
        console.log(`❌ Ошибка тестирования: ${error.message}`);
        return false;
    }
}

// Получаем URL из аргументов командной строки
const railwayUrl = process.argv[2];

if (!railwayUrl) {
    console.log('❌ Укажите URL Railway как аргумент');
    console.log('Пример: node update-supabase-endpoint.js https://your-app.up.railway.app');
    process.exit(1);
}

// Убираем лишние слеши
const cleanUrl = railwayUrl.replace(/\/+$/, '');

console.log('🚀 Настройка RPA-бота после деплоя');
console.log('===================================');

updateSupabaseSecret(cleanUrl);
testRPABot(cleanUrl);
