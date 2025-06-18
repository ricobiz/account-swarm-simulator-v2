
#!/usr/bin/env python3
"""
Проверка здоровья RPA-бота
"""

import requests
import json
import sys
import time
from datetime import datetime

def check_bot_health(url):
    """Проверяет здоровье RPA-бота"""
    try:
        print(f"🔍 Проверка RPA-бота: {url}")
        
        # Проверка health endpoint
        health_response = requests.get(f"{url}/health", timeout=10)
        
        if health_response.status_code == 200:
            health_data = health_response.json()
            print("✅ RPA-бот онлайн")
            print(f"   Статус: {health_data.get('status')}")
            print(f"   Версия: {health_data.get('version')}")
            print(f"   Среда: {health_data.get('environment')}")
            
            # Проверка возможностей
            status_response = requests.get(f"{url}/status", timeout=10)
            if status_response.status_code == 200:
                status_data = status_response.json()
                print(f"   Возможности: {', '.join(status_data.get('capabilities', []))}")
            
            return True
            
        else:
            print(f"❌ RPA-бот недоступен: {health_response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Не удается подключиться к RPA-боту")
        return False
    except requests.exceptions.Timeout:
        print("❌ Таймаут подключения к RPA-боту")
        return False
    except Exception as e:
        print(f"❌ Ошибка проверки: {e}")
        return False

def test_rpa_task(url):
    """Тестирует выполнение RPA задачи"""
    try:
        print("🧪 Тестирование RPA задачи...")
        
        test_task = {
            "taskId": f"test_{int(time.time())}",
            "url": "https://httpbin.org/get",
            "actions": [
                {"type": "navigate", "url": "https://httpbin.org/get"},
                {"type": "wait", "duration": 2000}
            ],
            "accountId": "test",
            "scenarioId": "test",
            "blockId": "test",
            "timeout": 30000
        }
        
        response = requests.post(
            f"{url}/execute", 
            json=test_task, 
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Тестовая RPA задача принята")
            print(f"   Задача ID: {result.get('taskId')}")
            return True
        else:
            print(f"❌ Ошибка тестовой задачи: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python health-check.py <URL_БОТА>")
        print("Пример: python health-check.py https://your-bot.up.railway.app")
        sys.exit(1)
    
    bot_url = sys.argv[1].rstrip('/')
    
    print(f"🤖 Проверка RPA-бота")
    print(f"📅 Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    # Проверка здоровья
    health_ok = check_bot_health(bot_url)
    
    if health_ok:
        # Тестирование задачи
        test_ok = test_rpa_task(bot_url)
        
        if test_ok:
            print("\n🎉 RPA-бот полностью функционален!")
            sys.exit(0)
        else:
            print("\n⚠️  RPA-бот онлайн, но есть проблемы с выполнением задач")
            sys.exit(1)
    else:
        print("\n❌ RPA-бот недоступен или неисправен")
        sys.exit(1)
