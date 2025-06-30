
#!/usr/bin/env python3
"""
Продвинутый RPA бот с интеграцией Multilogin для Railway
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
from multilogin_integration import MultiloginManager
from config import *

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/rpa_bot.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class EnhancedRPABot:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.multilogin = None
        self.current_profile = None
        
        # Инициализация Multilogin если включен
        if is_multilogin_enabled():
            try:
                self.multilogin = MultiloginManager(MULTILOGIN_TOKEN)
                self.multilogin.decode_token_info()
                logger.info("Multilogin интегрирован успешно")
            except Exception as e:
                logger.warning(f"Ошибка инициализации Multilogin: {e}")
                self.multilogin = None
    
    def setup_browser(self, account_data=None):
        """Настройка браузера с Multilogin или обычного антидетект браузера"""
        try:
            # Пробуем использовать Multilogin если доступен
            if self.multilogin and account_data:
                return self._setup_multilogin_browser(account_data)
            else:
                return self._setup_regular_browser()
                
        except Exception as e:
            logger.error(f"Ошибка настройки браузера: {e}")
            # Fallback на обычный браузер
            return self._setup_regular_browser()
    
    def _setup_multilogin_browser(self, account_data):
        """Настройка браузера через Multilogin"""
        try:
            logger.info("Настройка браузера через Multilogin...")
            
            # Получаем или создаем профиль
            profile_id = self.multilogin.get_profile_for_account(account_data)
            if not profile_id:
                logger.error("Не удалось получить профиль Multilogin")
                return self._setup_regular_browser()
            
            # Запускаем профиль
            profile_info = self.multilogin.start_profile(profile_id)
            if not profile_info:
                logger.error("Не удалось запустить профиль Multilogin")
                return self._setup_regular_browser()
            
            self.current_profile = profile_info
            
            # Подключаемся к запущенному браузеру
            options = Options()
            options.add_experimental_option("debuggerAddress", f"127.0.0.1:{profile_info['selenium_port']}")
            
            self.driver = webdriver.Chrome(options=options)
            self.wait = WebDriverWait(self.driver, ELEMENT_WAIT_TIMEOUT)
            
            logger.info(f"Multilogin браузер настроен на порту {profile_info['selenium_port']}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки Multilogin браузера: {e}")
            return self._setup_regular_browser()
    
    def _setup_regular_browser(self):
        """Настройка обычного антидетект браузера"""
        try:
            logger.info("Настройка обычного антидетект браузера...")
            
            options = Options()
            
            # Антидетект настройки
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            # Headless режим для облака
            if HEADLESS_MODE:
                options.add_argument('--headless=new')
            
            # Размер окна
            options.add_argument('--window-size=1920,1080')
            
            # User Agent
            options.add_argument(f'--user-agent={get_random_user_agent()}')
            
            # Настройки для производительности
            prefs = {
                "profile.default_content_setting_values": {
                    "notifications": 2,
                    "media_stream": 2,
                },
                "profile.managed_default_content_settings": {
                    "images": 2  # Отключаем изображения для скорости
                }
            }
            options.add_experimental_option("prefs", prefs)
            
            # Создание драйвера
            try:
                self.driver = uc.Chrome(options=options, version_main=None)
            except:
                # Fallback на обычный Chrome
                self.driver = webdriver.Chrome(options=options)
            
            # Антидетект скрипты
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.wait = WebDriverWait(self.driver, ELEMENT_WAIT_TIMEOUT)
            
            logger.info("Обычный антидетект браузер настроен")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки обычного браузера: {e}")
            return False
    
    def execute_task(self, task):
        """Выполнение RPA задачи"""
        task_id = task.get('taskId', 'unknown')
        logger.info(f"Выполнение задачи: {task_id}")
        
        try:
            # Подготавливаем данные аккаунта
            account_data = {
                'platform': task.get('metadata', {}).get('platform', 'generic'),
                'username': task.get('metadata', {}).get('username', 'user'),
                'accountId': task.get('accountId')
            }
            
            # Настраиваем браузер
            if not self.setup_browser(account_data):
                return {
                    'success': False,
                    'error': 'Не удалось настроить браузер',
                    'taskId': task_id
                }
            
            # Выполняем действия
            result = self._execute_actions(task)
            
            # Сообщаем об успехе
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
                'browser_type': 'multilogin' if self.current_profile else 'regular'
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
            
            if self.multilogin and self.current_profile:
                self.multilogin.stop_profile(self.current_profile['profile_id'])
                self.current_profile = None
                
            logger.info("Ресурсы очищены")
            
        except Exception as e:
            logger.warning(f"Ошибка очистки ресурсов: {e}")

# Глобальный экземпляр бота
rpa_bot = EnhancedRPABot()

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка здоровья сервиса"""
    status = {
        'status': 'healthy',
        'environment': ENVIRONMENT,
        'multilogin_enabled': is_multilogin_enabled(),
        'version': BOT_VERSION
    }
    
    if rpa_bot.multilogin:
        status['multilogin_connected'] = rpa_bot.multilogin.check_connection()
    
    return jsonify(status)

@app.route('/multilogin/status', methods=['GET'])
def multilogin_status():
    """Статус Multilogin"""
    if not rpa_bot.multilogin:
        return jsonify({
            'connected': False,
            'error': 'Multilogin не инициализирован'
        })
    
    try:
        # Проверяем подключение
        connected = rpa_bot.multilogin.check_connection()
        
        if connected:
            # Декодируем токен
            token_info = rpa_bot.multilogin.decode_token_info()
            profiles = rpa_bot.multilogin.get_profiles()
            
            return jsonify({
                'connected': True,
                'workspace_id': rpa_bot.multilogin.workspace_id,
                'email': token_info.get('email'),
                'plan': token_info.get('planName'),
                'profiles_count': len(profiles),
                'active_profiles': len(rpa_bot.multilogin.active_profiles)
            })
        else:
            return jsonify({
                'connected': False,
                'error': 'Не удалось подключиться к Multilogin API'
            })
            
    except Exception as e:
        return jsonify({
            'connected': False,
            'error': str(e)
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
            'environment': ENVIRONMENT,
            'features': ['universal-platforms', 'antidetect', 'human-behavior'] + (['multilogin'] if is_multilogin_enabled() else [])
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
                'title': title,
                'multilogin_enabled': is_multilogin_enabled()
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
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)
    
    # Проверяем конфигурацию
    config_errors = validate_config()
    if config_errors:
        logger.warning(f"Проблемы конфигурации: {config_errors}")
    
    # Запускаем сервер
    port = int(os.environ.get('PORT', 8080))
    logger.info(f"Запуск RPA бота на порту {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
