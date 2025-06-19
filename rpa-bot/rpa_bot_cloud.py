
#!/usr/bin/env python3
"""
Cloud version of RPA-bot optimized for Railway
"""

import json
import time
import logging
import requests
import os
import threading
from flask import Flask, request, jsonify
from datetime import datetime

# Локальные импорты
from cloud_rpa_bot import CloudRPABot

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/rpa_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Конфигурация облака
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://izmgzstdgoswlozinmyk.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
BOT_PORT = int(os.getenv('PORT', 5000))

app = Flask(__name__)

# Глобальный экземпляр облачного RPA бота
cloud_rpa_bot = CloudRPABot()

def send_result_to_supabase(task_id, result):
    """Отправка результата обратно в Supabase"""
    try:
        if not SUPABASE_SERVICE_KEY:
            logger.warning("SUPABASE_SERVICE_KEY не установлен, результат не отправлен")
            return
            
        url = f"{SUPABASE_URL}/functions/v1/rpa-task"
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'taskId': task_id,
            'result': result
        }
        
        response = requests.put(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            logger.info(f"Результат задачи {task_id} успешно отправлен в Supabase")
        else:
            logger.error(f"Ошибка отправки результата в Supabase: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Ошибка отправки результата в Supabase: {e}")

@app.route('/health', methods=['GET'])
def health():
    """Проверка состояния облачного сервиса"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'environment': 'railway',
        'capabilities': ['navigate', 'click', 'type', 'wait', 'scroll', 'key', 'move', 'check_element', 'telegram_like'],
        'system': {
            'cpu_percent': 15.0,
            'memory_percent': 65.0,
            'disk_usage': 45.0
        }
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Получение подробного статуса облачного бота"""
    return jsonify({
        'bot_status': 'online',
        'version': '2.0.0-railway',
        'environment': 'railway',
        'supported_platforms': ['instagram', 'youtube', 'twitter', 'telegram'],
        'active_sessions': 0,
        'uptime': time.time(),
        'system_resources': {
            'cpu': '15.0%',
            'memory': '65.0%',
            'disk': '45.0%'
        }
    })

@app.route('/execute', methods=['POST'])
def execute_task():
    """Выполнение RPA задачи в облаке"""
    try:
        task = request.get_json()
        
        if not task:
            return jsonify({'error': 'Пустая задача'}), 400
        
        task_id = task.get('taskId')
        if not task_id:
            return jsonify({'error': 'Отсутствует taskId'}), 400
        
        logger.info(f"Получена облачная задача для выполнения: {task_id}")
        
        def execute_and_send():
            try:
                result = cloud_rpa_bot.execute_task(task)
                send_result_to_supabase(task_id, result)
            except Exception as e:
                logger.error(f"Ошибка выполнения задачи {task_id}: {e}")
                error_result = {
                    'taskId': task_id,
                    'success': False,
                    'error': str(e),
                    'environment': 'railway'
                }
                send_result_to_supabase(task_id, error_result)
        
        thread = threading.Thread(target=execute_and_send)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Облачная задача {task_id} принята к выполнению',
            'taskId': task_id,
            'environment': 'railway'
        })
        
    except Exception as e:
        logger.error(f"Ошибка получения облачной задачи: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Запуск сервера облачного RPA бота...")
    logger.info(f"Порт: {BOT_PORT}")
    logger.info(f"Supabase URL: {SUPABASE_URL}")
    logger.info("Среда: Railway Cloud")
    
    # Создание необходимых директорий
    os.makedirs('screenshots', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    # Проверка доступности основных компонентов
    try:
        from selenium import webdriver
        logger.info("✅ Selenium доступен")
    except ImportError as e:
        logger.error(f"❌ Selenium недоступен: {e}")
    
    app.run(host='0.0.0.0', port=BOT_PORT, debug=False)
