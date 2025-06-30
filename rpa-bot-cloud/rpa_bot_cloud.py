
#!/usr/bin/env python3
"""
Простой и надежный RPA бот для Railway
"""

import os
import json
import time
import logging
from flask import Flask, request, jsonify
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, TimeoutException
import undetected_chromedriver as uc

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/rpa_bot.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Конфигурация
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://izmgzstdgoswlozinmyk.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
ELEMENT_WAIT_TIMEOUT = 10
HEADLESS_MODE = True

class SimpleRPABot:
    def __init__(self):
        self.driver = None
        self.wait = None
    
    def setup_browser(self):
        """Настройка простого антидетект браузера"""
        try:
            logger.info("Настройка антидетект браузера...")
            
            options = Options()
            
            # Базовые настройки для облака
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--headless=new')
            options.add_argument('--window-size=1920,1080')
            
            # Антидетект настройки
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            # User Agent
            options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            # Отключаем изображения для скорости
            prefs = {
                "profile.managed_default_content_settings": {
                    "images": 2
                }
            }
            options.add_experimental_option("prefs", prefs)
            
            # Пробуем undetected-chromedriver
            try:
                self.driver = uc.Chrome(options=options, version_main=None)
                logger.info("Используется undetected-chromedriver")
            except Exception as e:
                logger.warning(f"Не удалось использовать undetected-chromedriver: {e}")
                # Fallback на обычный Chrome
                self.driver = webdriver.Chrome(options=options)
                logger.info("Используется обычный Chrome WebDriver")
            
            # Убираем признаки автоматизации
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.wait = WebDriverWait(self.driver, ELEMENT_WAIT_TIMEOUT)
            
            logger.info("Браузер настроен успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки браузера: {e}")
            return False
    
    def execute_task(self, task):
        """Выполнение RPA задачи"""
        task_id = task.get('taskId', 'unknown')
        logger.info(f"Выполнение задачи: {task_id}")
        
        try:
            # Настраиваем браузер
            if not self.setup_browser():
                return {
                    'success': False,
                    'error': 'Не удалось настроить браузер',
                    'taskId': task_id
                }
            
            # Выполняем действия
            result = self._execute_actions(task)
            
            # Отправляем результат
            self._report_result(task_id, result)
            
            return result
            
        except Exception as e:
            error_msg = f"Ошибка выполнения задачи {task_id}: {e}"
            logger.error(error_msg)
            
            result = {
                'success': False,
                'error': error_msg,
                'taskId': task_id
            }
            
            self._report_result(task_id, result)
            return result
            
        finally:
            self.cleanup()
    
    def _execute_actions(self, task):
        """Выполнение списка действий"""
        task_id = task.get('taskId')
        actions = task.get('actions', [])
        results = []
        
        try:
            for action in actions:
                logger.info(f"Выполнение действия: {action.get('type')}")
                
                if action['type'] == 'navigate':
                    self.driver.get(action['url'])
                    time.sleep(action.get('delay', 1000) / 1000.0)
                    results.append(f"Переход на {action['url']}")
                    
                elif action['type'] == 'check_element':
                    element = action.get('element', {})
                    selector = element.get('selector')
                    
                    if selector:
                        try:
                            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                            results.append(f"Элемент найден: {selector}")
                        except TimeoutException:
                            results.append(f"Элемент не найден: {selector}")
                
                elif action['type'] == 'type':
                    element = action.get('element', {})
                    selector = element.get('selector')
                    text = element.get('text', '')
                    
                    if selector and text:
                        try:
                            field = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                            field.clear()
                            field.send_keys(text)
                            results.append(f"Текст введен в {selector}")
                        except TimeoutException:
                            results.append(f"Не удалось найти поле: {selector}")
                
                elif action['type'] == 'click':
                    element = action.get('element', {})
                    selector = element.get('selector')
                    
                    if selector:
                        try:
                            button = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                            button.click()
                            results.append(f"Клик по {selector}")
                        except TimeoutException:
                            results.append(f"Не удалось кликнуть: {selector}")
                
                # Пауза между действиями
                time.sleep(action.get('delay', 1000) / 1000.0)
            
            return {
                'success': True,
                'taskId': task_id,
                'results': results,
                'message': f'Задача {task_id} выполнена успешно',
                'browser_type': 'simple_antidetect'
            }
            
        except Exception as e:
            return {
                'success': False,
                'taskId': task_id,
                'error': str(e),
                'results': results
            }
    
    def _report_result(self, task_id, result):
        """Отправка результата в Supabase"""
        try:
            if not SUPABASE_SERVICE_KEY:
                logger.warning("SUPABASE_SERVICE_KEY не установлен")
                return
                
            supabase_url = SUPABASE_URL.rstrip('/')
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'
            }
            
            response = requests.put(
                f"{supabase_url}/functions/v1/rpa-task",
                headers=headers,
                json={
                    'taskId': task_id,
                    'result': result
                },
                timeout=10
            )
            
            if response.ok:
                logger.info(f"Результат задачи {task_id} отправлен")
            else:
                logger.error(f"Ошибка отправки результата: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Ошибка отправки результата: {e}")
    
    def cleanup(self):
        """Очистка ресурсов"""
        try:
            if self.driver:
                self.driver.quit()
                self.driver = None
                self.wait = None
                
            logger.info("Ресурсы очищены")
            
        except Exception as e:
            logger.warning(f"Ошибка очистки ресурсов: {e}")

# Глобальный экземпляр бота
rpa_bot = SimpleRPABot()

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка здоровья сервиса"""
    return jsonify({
        'status': 'healthy',
        'environment': 'railway-simple',
        'version': '1.0.0-simple',
        'capabilities': ['navigate', 'click', 'type', 'check_element', 'antidetect_browser']
    })

@app.route('/execute', methods=['POST'])
def execute_task():
    """Выполнение RPA задачи"""
    try:
        task = request.get_json()
        
        if not task:
            return jsonify({
                'success': False,
                'error': 'Отсутствуют данные задачи'
            }), 400
        
        logger.info(f"Получена задача: {task.get('taskId')}")
        
        # Выполняем задачу
        result = rpa_bot.execute_task(task)
        
        return jsonify({
            'success': True,
            'message': f'Задача {task.get("taskId")} принята к выполнению',
            'taskId': task.get('taskId'),
            'result': result,
            'environment': 'railway-simple',
            'features': ['antidetect', 'simple-automation']
        })
        
    except Exception as e:
        logger.error(f"Ошибка выполнения задачи: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/test', methods=['GET'])
def test_bot():
    """Тест RPA бота"""
    try:
        # Простой тест браузера
        test_result = rpa_bot.setup_browser()
        
        if test_result:
            rpa_bot.driver.get("https://www.google.com")
            title = rpa_bot.driver.title
            rpa_bot.cleanup()
            
            return jsonify({
                'success': True,
                'message': 'Тест прошел успешно',
                'title': title
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Не удалось настроить браузер'
            }), 500
            
    except Exception as e:
        rpa_bot.cleanup()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Создаем необходимые директории
    os.makedirs('logs', exist_ok=True)
    
    # Запускаем сервер
    port = int(os.environ.get('PORT', 8080))
    logger.info(f"Запуск простого RPA бота на порту {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
