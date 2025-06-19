
#!/usr/bin/env python3
"""
Облачный RPA-бот для Railway с webdriver-manager
"""

import json
import time
import logging
import requests
import os
from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import threading

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Конфигурация
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
BOT_PORT = int(os.getenv('PORT', 5000))

app = Flask(__name__)

class CloudRPABot:
    def __init__(self):
        self.driver = None
        self.wait = None
        logger.info("Cloud RPA Bot инициализирован")
    
    def setup_browser(self):
        """Настройка браузера для Railway с webdriver-manager"""
        try:
            chrome_options = Options()
            
            # Обязательные опции для Railway
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--remote-debugging-port=9222')
            chrome_options.add_argument('--disable-web-security')
            chrome_options.add_argument('--disable-features=VizDisplayCompositor')
            chrome_options.add_argument('--window-size=1920,1080')
            
            # Антидетект опции
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            # Используем webdriver-manager для автоматической установки ChromeDriver
            logger.info("Устанавливаем ChromeDriver через webdriver-manager...")
            service = Service(ChromeDriverManager().install())
            
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.wait = WebDriverWait(self.driver, 15)
            
            logger.info("Браузер настроен успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки браузера: {e}")
            return False
    
    def execute_action(self, action):
        """Выполнение RPA действия"""
        action_type = action.get('type')
        logger.info(f"Выполнение действия: {action_type}")
        
        try:
            if action_type == 'navigate':
                url = action.get('url')
                if url:
                    self.driver.get(url)
                    time.sleep(2)
                    return True
                    
            elif action_type == 'click':
                if 'selector' in action:
                    element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, action['selector'])))
                    element.click()
                elif 'x' in action and 'y' in action:
                    self.driver.execute_script(f"document.elementFromPoint({action['x']}, {action['y']}).click();")
                time.sleep(0.5)
                return True
                
            elif action_type == 'type':
                text = action.get('text', '')
                if 'selector' in action:
                    element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, action['selector'])))
                    element.clear()
                    element.send_keys(text)
                else:
                    active_element = self.driver.switch_to.active_element
                    active_element.clear()
                    active_element.send_keys(text)
                return True
                
            elif action_type == 'wait':
                duration = action.get('duration', 1000)
                time.sleep(duration / 1000)
                return True
                
            elif action_type == 'scroll':
                x = action.get('x', 0)
                y = action.get('y', 0)
                if 'selector' in action:
                    element = self.driver.find_element(By.CSS_SELECTOR, action['selector'])
                    self.driver.execute_script("arguments[0].scrollIntoView();", element)
                else:
                    self.driver.execute_script(f"window.scrollBy({x}, {y});")
                time.sleep(0.5)
                return True
                
            elif action_type == 'key':
                key = action.get('key')
                key_mapping = {
                    'Enter': Keys.RETURN,
                    'Tab': Keys.TAB,
                    'Escape': Keys.ESCAPE,
                    'Space': Keys.SPACE,
                    'Backspace': Keys.BACKSPACE,
                    'Delete': Keys.DELETE
                }
                selenium_key = key_mapping.get(key, key)
                active_element = self.driver.switch_to.active_element
                active_element.send_keys(selenium_key)
                return True
                
            elif action_type == 'check_element':
                selector = action.get('selector')
                if selector:
                    try:
                        element = self.driver.find_element(By.CSS_SELECTOR, selector)
                        return element is not None
                    except NoSuchElementException:
                        return False
                        
            else:
                logger.warning(f"Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка выполнения действия {action_type}: {e}")
            return False
    
    def execute_task(self, task):
        """Выполнение полной RPA задачи"""
        start_time = time.time()
        task_id = task.get('taskId', 'unknown')
        
        logger.info(f"Начало выполнения задачи: {task_id}")
        
        try:
            if not self.setup_browser():
                raise Exception("Не удалось настроить браузер")
            
            if task.get('url'):
                self.driver.get(task['url'])
                time.sleep(2)
            
            completed_actions = 0
            actions = task.get('actions', [])
            
            for i, action in enumerate(actions):
                logger.info(f"Выполнение действия {i+1}/{len(actions)}: {action.get('type')}")
                
                if self.execute_action(action):
                    completed_actions += 1
                else:
                    logger.warning(f"Действие {i+1} не выполнено: {action}")
                
                if time.time() - start_time > task.get('timeout', 60000) / 1000:
                    raise TimeoutException("Превышен таймаут выполнения задачи")
            
            execution_time = int((time.time() - start_time) * 1000)
            
            result = {
                'taskId': task_id,
                'success': True,
                'message': f'Задача выполнена успешно. Выполнено {completed_actions}/{len(actions)} действий',
                'executionTime': execution_time,
                'completedActions': completed_actions,
                'data': {
                    'url': self.driver.current_url,
                    'title': self.driver.title
                },
                'environment': 'railway-cloud'
            }
            
            logger.info(f"Задача {task_id} выполнена успешно за {execution_time}ms")
            return result
            
        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            
            result = {
                'taskId': task_id,
                'success': False,
                'message': 'Ошибка выполнения задачи',
                'error': str(e),
                'executionTime': execution_time,
                'completedActions': completed_actions if 'completed_actions' in locals() else 0,
                'environment': 'railway-cloud'
            }
            
            logger.error(f"Ошибка выполнения задачи {task_id}: {e}")
            return result
            
        finally:
            if self.driver:
                self.driver.quit()
                self.driver = None

# Глобальный экземпляр бота
cloud_rpa_bot = CloudRPABot()

def send_result_to_supabase(task_id, result):
    """Отправка результата в Supabase"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("Supabase не настроен - результат не отправлен")
        return
        
    try:
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
            logger.info(f"Результат задачи {task_id} отправлен в Supabase")
        else:
            logger.error(f"Ошибка отправки в Supabase: {response.status_code}")
            
    except Exception as e:
        logger.error(f"Ошибка отправки в Supabase: {e}")

@app.route('/health', methods=['GET'])
def health():
    """Проверка здоровья"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'environment': 'railway'
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Статус бота"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'capabilities': [
            'navigate', 'click', 'type', 'wait', 
            'scroll', 'key', 'check_element'
        ],
        'environment': 'railway-cloud'
    })

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
        
        logger.info(f"Получена задача: {task_id}")
        
        def execute_and_send():
            result = cloud_rpa_bot.execute_task(task)
            send_result_to_supabase(task_id, result)
        
        thread = threading.Thread(target=execute_and_send)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Задача {task_id} принята к выполнению',
            'taskId': task_id,
            'environment': 'railway-cloud'
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении задачи: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Запуск Cloud RPA Bot сервера...")
    logger.info(f"Порт: {BOT_PORT}")
    logger.info(f"Supabase URL: {SUPABASE_URL}")
    
    app.run(host='0.0.0.0', port=BOT_PORT, debug=False)
