
#!/usr/bin/env python3
"""
Облачная версия RPA-бота оптимизированная для Railway
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
import pyautogui
from datetime import datetime
import threading

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('rpa_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Конфигурация для облака
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://izmgzstdgoswlozinmyk.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
BOT_PORT = int(os.getenv('PORT', 5000))  # Railway использует переменную PORT

app = Flask(__name__)

class CloudHumanBehaviorSimulator:
    """Оптимизированная имитация человеческого поведения для облака"""
    
    @staticmethod
    def random_delay(min_ms=50, max_ms=500):
        """Более быстрые задержки для облака"""
        import random
        delay = random.uniform(min_ms/1000, max_ms/1000)
        time.sleep(delay)
    
    @staticmethod
    def human_type(element, text, typing_speed=0.05):
        """Быстрая печать для облака"""
        import random
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.02, typing_speed))
    
    @staticmethod
    def human_mouse_move(driver, element):
        """Облегченное движение мыши"""
        action = ActionChains(driver)
        action.move_to_element(element)
        action.perform()
        CloudHumanBehaviorSimulator.random_delay(100, 300)

class CloudRPABot:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.behavior = CloudHumanBehaviorSimulator()
        
        # Отключаем PyAutoGUI для облака (используем только Selenium)
        pyautogui.FAILSAFE = False
        
        logger.info("Cloud RPA Bot инициализирован")
    
    def setup_browser(self, headless=True, proxy=None):
        """Настройка браузера для облака"""
        try:
            chrome_options = Options()
            
            # Обязательно headless для облака
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--remote-debugging-port=9222')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Оптимизация для облака
            chrome_options.add_argument('--memory-pressure-off')
            chrome_options.add_argument('--max_old_space_size=4096')
            chrome_options.add_argument('--disable-background-timer-throttling')
            chrome_options.add_argument('--disable-backgrounding-occluded-windows')
            chrome_options.add_argument('--disable-renderer-backgrounding')
            
            # Прокси если указан
            if proxy:
                chrome_options.add_argument(f'--proxy-server={proxy}')
            
            # Облачный пользовательский агент
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            # Путь к ChromeDriver в контейнере
            service = Service('/usr/local/bin/chromedriver')
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.wait = WebDriverWait(self.driver, 15)
            
            logger.info("Облачный браузер настроен успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки облачного браузера: {e}")
            return False
    
    def execute_action(self, action):
        """Выполнение действия с облачными оптимизациями"""
        action_type = action.get('type')
        logger.info(f"Выполнение облачного действия: {action_type}")
        
        try:
            if action_type == 'navigate':
                return self._navigate(action)
            elif action_type == 'click':
                return self._click(action)
            elif action_type == 'type':
                return self._type(action)
            elif action_type == 'wait':
                return self._wait(action)
            elif action_type == 'scroll':
                return self._scroll(action)
            elif action_type == 'key':
                return self._key(action)
            elif action_type == 'move':
                return self._move(action)
            elif action_type == 'check_element':
                return self._check_element(action)
            else:
                logger.warning(f"Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка выполнения облачного действия {action_type}: {e}")
            return False
    
    def _navigate(self, action):
        """Переход на URL"""
        url = action.get('url')
        if not url:
            return False
            
        self.driver.get(url)
        self.behavior.random_delay(500, 1500)
        return True
    
    def _click(self, action):
        """Клик по элементу (только Selenium в облаке)"""
        if 'selector' in action:
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, action['selector'])))
            self.behavior.human_mouse_move(self.driver, element)
            element.click()
        elif 'x' in action and 'y' in action:
            # В облаке используем JavaScript для кликов по координатам
            self.driver.execute_script(f"document.elementFromPoint({action['x']}, {action['y']}).click();")
        else:
            return False
            
        self.behavior.random_delay(100, 400)
        return True
    
    def _type(self, action):
        """Ввод текста"""
        text = action.get('text', '')
        
        if 'selector' in action:
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, action['selector'])))
            self.behavior.human_type(element, text)
        else:
            # В облаке отправляем текст активному элементу
            active_element = self.driver.switch_to.active_element
            self.behavior.human_type(active_element, text)
            
        return True
    
    def _wait(self, action):
        """Ожидание"""
        duration = action.get('duration', 1000)
        time.sleep(duration / 1000)
        return True
    
    def _scroll(self, action):
        """Прокрутка"""
        x = action.get('x', 0)
        y = action.get('y', 0)
        
        if 'selector' in action:
            element = self.driver.find_element(By.CSS_SELECTOR, action['selector'])
            self.driver.execute_script("arguments[0].scrollIntoView();", element)
        else:
            self.driver.execute_script(f"window.scrollBy({x}, {y});")
            
        self.behavior.random_delay(200, 600)
        return True
    
    def _key(self, action):
        """Нажатие клавиши"""
        key = action.get('key')
        if not key:
            return False
            
        key_mapping = {
            'Enter': Keys.RETURN,
            'Tab': Keys.TAB,
            'Escape': Keys.ESCAPE,
            'Space': Keys.SPACE,
            'Backspace': Keys.BACKSPACE,
            'Delete': Keys.DELETE,
            'ArrowUp': Keys.ARROW_UP,
            'ArrowDown': Keys.ARROW_DOWN,
            'ArrowLeft': Keys.ARROW_LEFT,
            'ArrowRight': Keys.ARROW_RIGHT
        }
        
        selenium_key = key_mapping.get(key, key)
        active_element = self.driver.switch_to.active_element
        active_element.send_keys(selenium_key)
        
        return True
    
    def _move(self, action):
        """Движение мыши через JavaScript"""
        x = action.get('x')
        y = action.get('y')
        
        if x is not None and y is not None:
            # В облаке имитируем движение через JavaScript
            self.driver.execute_script(f"""
                var event = new MouseEvent('mousemove', {{
                    clientX: {x},
                    clientY: {y},
                    bubbles: true
                }});
                document.dispatchEvent(event);
            """)
            
        return True
    
    def _check_element(self, action):
        """Проверка наличия элемента"""
        selector = action.get('selector')
        if not selector:
            return False
            
        try:
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            return element is not None
        except NoSuchElementException:
            return False
    
    def execute_task(self, task):
        """Выполнение полной задачи в облаке"""
        start_time = time.time()
        task_id = task.get('taskId', 'unknown')
        
        logger.info(f"Начало выполнения облачной задачи: {task_id}")
        
        try:
            if not self.setup_browser():
                raise Exception("Не удалось настроить облачный браузер")
            
            if task.get('url'):
                self.driver.get(task['url'])
                self.behavior.random_delay(1000, 2000)
            
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
            
            # Скриншот результата
            screenshot_path = f"screenshots/cloud_task_{task_id}_{int(time.time())}.png"
            os.makedirs('screenshots', exist_ok=True)
            self.driver.save_screenshot(screenshot_path)
            
            result = {
                'taskId': task_id,
                'success': True,
                'message': f'Облачная задача выполнена успешно. Выполнено {completed_actions}/{len(actions)} действий',
                'executionTime': execution_time,
                'completedActions': completed_actions,
                'screenshot': screenshot_path,
                'data': {
                    'url': self.driver.current_url,
                    'title': self.driver.title
                },
                'environment': 'cloud'
            }
            
            logger.info(f"Облачная задача {task_id} выполнена успешно за {execution_time}ms")
            return result
            
        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            
            result = {
                'taskId': task_id,
                'success': False,
                'message': 'Ошибка выполнения облачной задачи',
                'error': str(e),
                'executionTime': execution_time,
                'completedActions': completed_actions if 'completed_actions' in locals() else 0,
                'environment': 'cloud'
            }
            
            logger.error(f"Ошибка выполнения облачной задачи {task_id}: {e}")
            return result
            
        finally:
            if self.driver:
                self.driver.quit()
                self.driver = None

# Глобальный экземпляр облачного бота
cloud_rpa_bot = CloudRPABot()

def send_result_to_supabase(task_id, result):
    """Отправка результата обратно в Supabase"""
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
            logger.info(f"Результат облачной задачи {task_id} успешно отправлен в Supabase")
        else:
            logger.error(f"Ошибка отправки результата в Supabase: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Ошибка отправки результата в Supabase: {e}")

@app.route('/health', methods=['GET'])
def health():
    """Проверка здоровья облачного сервиса"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0-cloud',
        'environment': 'railway'
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
            result = cloud_rpa_bot.execute_task(task)
            send_result_to_supabase(task_id, result)
        
        thread = threading.Thread(target=execute_and_send)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Облачная задача {task_id} принята к выполнению',
            'taskId': task_id,
            'environment': 'cloud'
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении облачной задачи: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    """Получение статуса облачного бота"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'capabilities': [
            'navigate', 'click', 'type', 'wait', 
            'scroll', 'key', 'move', 'check_element'
        ],
        'environment': 'railway-cloud',
        'optimizations': [
            'headless-browser', 'fast-execution', 
            'cloud-optimized', 'selenium-only'
        ]
    })

if __name__ == '__main__':
    logger.info("Запуск облачного RPA Bot сервера...")
    logger.info(f"Порт: {BOT_PORT}")
    logger.info(f"Supabase URL: {SUPABASE_URL}")
    logger.info("Среда: Railway Cloud")
    
    os.makedirs('screenshots', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    app.run(host='0.0.0.0', port=BOT_PORT, debug=False)
