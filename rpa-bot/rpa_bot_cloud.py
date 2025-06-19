
#!/usr/bin/env python3
"""
Cloud version of RPA-bot optimized for Railway with server-based screenshots
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
from advanced_cloud_rpa_bot import AdvancedCloudRPABot
from server_screenshot_handler import screenshot_handler

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/rpa_bot.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Конфигурация облака
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://izmgzstdgoswlozinmyk.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
BOT_PORT = int(os.getenv('PORT', 5000))

app = Flask(__name__)

# Глобальный экземпляр продвинутого RPA бота
advanced_rpa_bot = AdvancedCloudRPABot()

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
    """Проверка состояния сервиса"""
    try:
        vision_status = advanced_rpa_bot.test_vision_connection()
        cache_stats = advanced_rpa_bot.get_cache_stats()
        active_sessions = screenshot_handler.list_active_sessions()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '3.0.0-server-screenshots',
            'environment': 'railway',
            'capabilities': [
                'navigate', 'click', 'type', 'wait', 'scroll', 'key', 'move', 
                'check_element', 'telegram_like', 'vision_recognition', 
                'smart_caching', 'antidetect_browser', 'auto_learning',
                'server_screenshots', 'macro_testing'
            ],
            'vision_api': {
                'status': 'connected' if vision_status else 'disconnected',
                'api_key_set': bool(OPENROUTER_API_KEY)
            },
            'cache_stats': cache_stats,
            'active_browser_sessions': len(active_sessions),
            'system': {
                'cpu_percent': 15.0,
                'memory_percent': 65.0,
                'disk_usage': 45.0
            }
        }), 200
    except Exception as e:
        logger.error(f"Ошибка health check: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/rpa/screenshot', methods=['POST'])
def get_server_screenshot():
    """Получение скриншота с сервера"""
    try:
        data = request.get_json()
        url = data.get('url')
        session_id = data.get('sessionId')
        device_type = data.get('deviceType', 'desktop')
        
        if not url:
            return jsonify({'error': 'URL обязателен'}), 400
        
        logger.info(f"Получение серверного скриншота для: {url}")
        
        # Создаем новый сеанс, если не передан
        if not session_id:
            session_id = screenshot_handler.create_browser_session(device_type)
        
        # Получаем скриншот
        result = screenshot_handler.get_screenshot(session_id, url)
        
        logger.info(f"Скриншот получен для сеанса: {session_id}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Ошибка получения скриншота: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rpa/test-macro', methods=['POST'])
def test_macro():
    """Тестирование макроса на сервере"""
    try:
        data = request.get_json()
        session_id = data.get('sessionId')
        actions = data.get('actions', [])
        url = data.get('url')
        
        if not actions:
            return jsonify({'error': 'Действия обязательны'}), 400
        
        if not url:
            return jsonify({'error': 'URL обязателен'}), 400
        
        logger.info(f"Тестирование макроса: {len(actions)} действий")
        
        # Тестируем макрос
        result = screenshot_handler.test_macro(session_id, actions, url)
        
        logger.info(f"Макрос протестирован: {result['completedActions']}/{result['totalActions']} действий")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Ошибка тестирования макроса: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rpa/execute-macro', methods=['POST'])
def execute_macro():
    """Выполнение макроса с человеческим поведением"""
    try:
        data = request.get_json()
        session_id = data.get('sessionId')
        actions = data.get('actions', [])
        url = data.get('url')
        human_behavior = data.get('humanBehavior', True)
        
        if not actions:
            return jsonify({'error': 'Действия обязательны'}), 400
        
        if not url:
            return jsonify({'error': 'URL обязателен'}), 400
        
        logger.info(f"Выполнение макроса с человеческим поведением: {len(actions)} действий")
        
        # Выполняем макрос (пока используем test_macro, но с флагом человеческого поведения)
        result = screenshot_handler.test_macro(session_id, actions, url)
        result['humanBehavior'] = human_behavior
        
        logger.info(f"Макрос выполнен: {result['completedActions']}/{result['totalActions']} действий")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Ошибка выполнения макроса: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rpa/browser-info/<session_id>', methods=['GET'])
def get_browser_info(session_id):
    """Получение информации о браузере"""
    try:
        info = screenshot_handler.get_session_info(session_id)
        if not info:
            return jsonify({'error': 'Сеанс не найден'}), 404
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Ошибка получения информации о браузере: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rpa/session/<session_id>', methods=['DELETE'])
def close_session(session_id):
    """Закрытие сеанса браузера"""
    try:
        screenshot_handler.close_session(session_id)
        return jsonify({'success': True, 'message': 'Сеанс закрыт'})
        
    except Exception as e:
        logger.error(f"Ошибка закрытия сеанса: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/execute', methods=['POST'])
def execute_task():
    """Выполнение RPA задачи"""
    try:
        task = request.get_json()
        
        if not task:
            return jsonify({'error': 'Пустая задача'}), 400
        
        task_id = task.get('taskId')
        if not task_id:
            return jsonify({'error': 'Отсутствует taskId'}), 400
        
        logger.info(f"Получена задача для выполнения: {task_id}")
        
        def execute_and_send():
            try:
                result = advanced_rpa_bot.execute_task(task)
                send_result_to_supabase(task_id, result)
            except Exception as e:
                logger.error(f"Ошибка выполнения задачи {task_id}: {e}")
                error_result = {
                    'taskId': task_id,
                    'success': False,
                    'error': str(e),
                    'environment': 'railway-advanced'
                }
                send_result_to_supabase(task_id, error_result)
        
        thread = threading.Thread(target=execute_and_send)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Задача {task_id} принята к выполнению',
            'taskId': task_id,
            'environment': 'railway-server-screenshots'
        })
        
    except Exception as e:
        logger.error(f"Ошибка получения задачи: {e}")
        return jsonify({'error': str(e)}), 500

# Фоновая задача для очистки старых сеансов
def cleanup_old_sessions():
    """Очистка старых сеансов браузера"""
    while True:
        try:
            screenshot_handler.cleanup_old_sessions()
            time.sleep(300)  # каждые 5 минут
        except Exception as e:
            logger.error(f"Ошибка очистки сеансов: {e}")
            time.sleep(60)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Запуск сервера RPA бота с поддержкой серверных скриншотов...")
    logger.info(f"Порт: {BOT_PORT}")
    logger.info(f"Supabase URL: {SUPABASE_URL}")
    logger.info(f"OpenRouter API ключ установлен: {bool(OPENROUTER_API_KEY)}")
    
    # Создание необходимых директорий
    os.makedirs('screenshots', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    os.makedirs('cache_errors', exist_ok=True)
    
    # Запуск фоновой задачи очистки
    cleanup_thread = threading.Thread(target=cleanup_old_sessions)
    cleanup_thread.daemon = True
    cleanup_thread.start()
    
    # Проверка доступности компонентов
    try:
        from selenium import webdriver
        logger.info("✅ Selenium доступен")
    except ImportError as e:
        logger.error(f"❌ Selenium недоступен: {e}")
    
    try:
        import undetected_chromedriver as uc
        logger.info("✅ Undetected Chrome доступен")
    except ImportError as e:
        logger.error(f"❌ Undetected Chrome недоступен: {e}")
    
    # Тест Vision API
    if advanced_rpa_bot.test_vision_connection():
        logger.info("✅ Vision API подключение успешно")
    else:
        logger.warning("⚠️ Vision API недоступен")
    
    app.run(host='0.0.0.0', port=BOT_PORT, debug=False)
