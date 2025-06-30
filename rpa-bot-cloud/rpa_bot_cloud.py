
#!/usr/bin/env python3
"""
Максимально простой RPA бот для Railway
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

class BasicRPABot:
    def __init__(self):
        self.driver = None
        self.wait = None
        logger.info("Базовый RPA бот инициализирован")
    
    def setup_browser(self):
        """Максимально простая настройка браузера"""
        try:
            logger.info("🔧 Начинаем настройку базового браузера...")
            
            # Проверяем наличие Chrome
            chrome_path = '/usr/bin/google-chrome'
            if not os.path.exists(chrome_path):
                logger.error(f"❌ Chrome не найден по пути: {chrome_path}")
                return False
            
            logger.info(f"✅ Chrome найден: {chrome_path}")
            
            options = Options()
            
            # Минимальные настройки для Railway
            options.add_argument('--headless=new')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-web-security')
            options.add_argument('--disable-features=VizDisplayCompositor')
            
            logger.info("🔧 Опции Chrome настроены")
            
            # Создаём драйвер
            logger.info("🚀 Создаём WebDriver...")
            self.driver = webdriver.Chrome(options=options)
            logger.info("✅ WebDriver создан успешно")
            
            # Настраиваем ожидания
            self.wait = WebDriverWait(self.driver, ELEMENT_WAIT_TIMEOUT)
            logger.info("✅ WebDriverWait настроен")
            
            # Тестовый переход
            logger.info("🧪 Тестируем браузер...")
            self.driver.get("https://www.google.com")
            logger.info(f"✅ Тестовый переход успешен. Заголовок: {self.driver.title}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Критическая ошибка настройки браузера: {e}")
            logger.error(f"Тип ошибки: {type(e).__name__}")
            
            # Попытка очистки
            try:
                if self.driver:
                    self.driver.quit()
            except:
                pass
            
            return False
    
    def execute_task(self, task):
        """Выполнение RPA задачи"""
        task_id = task.get('taskId', 'unknown')
        logger.info(f"📋 Начало выполнения задачи: {task_id}")
        
        try:
            # Настраиваем браузер
            if not self.setup_browser():
                raise Exception("Не удалось настроить базовый браузер")
            
            logger.info("✅ Браузер настроен, выполняем действия...")
            
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
            for i, action in enumerate(actions):
                action_type = action.get('type')
                logger.info(f"🎯 Действие {i+1}/{len(actions)}: {action_type}")
                
                if action_type == 'navigate':
                    url = action.get('url')
                    logger.info(f"🌐 Переходим на: {url}")
                    self.driver.get(url)
                    time.sleep(2)
                    results.append(f"Переход на {url}")
                    
                elif action_type == 'check_element':
                    element = action.get('element', {})
                    selector = element.get('selector')
                    
                    if selector:
                        try:
                            logger.info(f"🔍 Ищем элемент: {selector}")
                            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                            results.append(f"Элемент найден: {selector}")
                            logger.info(f"✅ Элемент найден: {selector}")
                        except TimeoutException:
                            results.append(f"Элемент не найден: {selector}")
                            logger.warning(f"⚠️ Элемент не найден: {selector}")
                
                elif action_type == 'type':
                    element = action.get('element', {})
                    selector = element.get('selector')
                    text = element.get('text', '')
                    
                    if selector and text:
                        try:
                            logger.info(f"⌨️ Вводим текст в: {selector}")
                            field = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                            field.clear()
                            field.send_keys(text)
                            results.append(f"Текст введен в {selector}")
                        except TimeoutException:
                            results.append(f"Не удалось найти поле: {selector}")
                
                elif action_type == 'click':
                    element = action.get('element', {})
                    selector = element.get('selector')
                    
                    if selector:
                        try:
                            logger.info(f"🖱️ Кликаем по: {selector}")
                            button = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                            button.click()
                            results.append(f"Клик по {selector}")
                        except TimeoutException:
                            results.append(f"Не удалось кликнуть: {selector}")
                
                # Пауза между действиями
                delay = action.get('delay', 1000) / 1000.0
                time.sleep(delay)
            
            return {
                'success': True,
                'taskId': task_id,
                'results': results,
                'message': f'Задача {task_id} выполнена успешно',
                'browser_type': 'basic_chrome'
            }
            
        except Exception as e:
            logger.error(f"❌ Ошибка выполнения действий: {e}")
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
                logger.info(f"📤 Результат задачи {task_id} отправлен в Supabase")
            else:
                logger.error(f"❌ Ошибка отправки результата: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"❌ Ошибка отправки результата: {e}")
    
    def cleanup(self):
        """Очистка ресурсов"""
        try:
            if self.driver:
                logger.info("🧹 Закрываем браузер...")
                self.driver.quit()
                self.driver = None
                self.wait = None
                logger.info("✅ Браузер закрыт")
                
        except Exception as e:
            logger.warning(f"⚠️ Ошибка очистки ресурсов: {e}")

# Глобальный экземпляр бота
rpa_bot = BasicRPABot()

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка здоровья сервиса"""
    return jsonify({
        'status': 'healthy',
        'environment': 'railway-basic',
        'version': '1.0.1-basic',
        'capabilities': ['navigate', 'click', 'type', 'check_element', 'basic_browser']
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
        
        task_id = task.get('taskId')
        logger.info(f"📨 Получена задача: {task_id}")
        
        # Выполняем задачу
        result = rpa_bot.execute_task(task)
        
        return jsonify({
            'success': True,
            'message': f'Задача {task_id} принята к выполнению',
            'taskId': task_id,
            'result': result,
            'environment': 'railway-basic'
        })
        
    except Exception as e:
        logger.error(f"❌ Ошибка выполнения задачи: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/test', methods=['GET'])
def test_bot():
    """Тест RPA бота"""
    try:
        logger.info("🧪 Запуск теста браузера...")
        
        # Простой тест браузера
        test_result = rpa_bot.setup_browser()
        
        if test_result:
            title = rpa_bot.driver.title
            current_url = rpa_bot.driver.current_url
            rpa_bot.cleanup()
            
            logger.info("✅ Тест браузера прошел успешно")
            return jsonify({
                'success': True,
                'message': 'Тест прошел успешно',
                'title': title,
                'url': current_url
            })
        else:
            logger.error("❌ Тест браузера не прошел")
            return jsonify({
                'success': False,
                'error': 'Не удалось настроить браузер'
            }), 500
            
    except Exception as e:
        logger.error(f"❌ Критическая ошибка теста: {e}")
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
    logger.info(f"🚀 Запуск базового RPA бота на порту {port}")
    logger.info(f"🔗 Supabase URL: {SUPABASE_URL}")
    
    # Проверяем Chrome при запуске
    chrome_path = '/usr/bin/google-chrome'
    if os.path.exists(chrome_path):
        logger.info(f"✅ Chrome найден: {chrome_path}")
    else:
        logger.error(f"❌ Chrome НЕ найден: {chrome_path}")
    
    app.run(host='0.0.0.0', port=port, debug=False)
