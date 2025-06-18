
#!/usr/bin/env node

/**
 * Скрипт для тестирования полного RPA workflow
 */

async function createTestRPATask(botUrl) {
    console.log('🧪 Создаем тестовую RPA задачу...');
    
    const testTask = {
        taskId: `test_${Date.now()}`,
        url: "https://httpbin.org/get",
        actions: [
            { type: "navigate", url: "https://httpbin.org/get" },
            { type: "wait", duration: 2000 },
            { type: "check_element", selector: "body" }
        ],
        accountId: "test-account",
        scenarioId: "test-scenario", 
        blockId: "test-block",
        timeout: 30000
    };
    
    try {
        const response = await fetch(`${botUrl}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testTask)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Тестовая задача принята к выполнению');
            console.log(`📋 Task ID: ${result.taskId}`);
            return result.taskId;
        } else {
            console.log('❌ Ошибка создания тестовой задачи');
            console.log(result);
            return null;
        }
    } catch (error) {
        console.log(`❌ Ошибка: ${error.message}`);
        return null;
    }
}

async function checkBotStatus(botUrl) {
    console.log('📊 Проверяем статус бота...');
    
    try {
        const response = await fetch(`${botUrl}/status`);
        const status = await response.json();
        
        console.log('✅ Статус получен:');
        console.log(`   Состояние: ${status.status}`);
        console.log(`   Возможности: ${status.capabilities?.join(', ')}`);
        console.log(`   Оптимизации: ${status.optimizations?.join(', ')}`);
        console.log(`   Среда: ${status.environment}`);
        
        return true;
    } catch (error) {
        console.log(`❌ Ошибка получения статуса: ${error.message}`);
        return false;
    }
}

// Основной workflow
const botUrl = process.argv[2];

if (!botUrl) {
    console.log('❌ Укажите URL бота как аргумент');
    console.log('Пример: node test-rpa-workflow.js https://your-app.up.railway.app');
    process.exit(1);
}

const cleanUrl = botUrl.replace(/\/+$/, '');

console.log('🤖 Тестирование RPA workflow');
console.log('============================');

(async () => {
    // 1. Проверяем статус
    const statusOk = await checkBotStatus(cleanUrl);
    
    if (statusOk) {
        // 2. Создаем тестовую задачу
        const taskId = await createTestRPATask(cleanUrl);
        
        if (taskId) {
            console.log('🎉 Полный workflow тест успешен!');
            console.log('🚀 RPA-бот готов к работе');
        }
    }
})();
