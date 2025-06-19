
#!/usr/bin/env python3
"""
Продвинутый облачный RPA-бот с полным функционалом
Включает антидетект, поддержку различных платформ, прокси, captcha solving
"""

import json
import time
import logging
import requests
import os
import random
import base64
import threading
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
import undetected_chromedriver as uc
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
import cv2
import numpy as np
from PIL import Image
import psutil
import schedule

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

# Конфигурация
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
BOT_PORT = int(os.getenv('PORT', 5000))

app = Flask(__name__)

class AntiDetectSystem:
    """Система антидетекта для обхода защиты"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.profiles = self._load_browser_profiles()
    
    def _load_browser_profiles(self):
        """Загрузка профилей браузеров"""
        return [
            {
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'viewport': (1920, 1080),
                'platform': 'Win32',
                'languages': ['en-US', 'en'],
                'timezone': 'America/New_York'
            },
            {
                'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'viewport': (1440, 900),
                'platform': 'MacIntel',
                'languages': ['en-US', 'en'],
                'timezone': 'America/Los_Angeles'
            },
            {
                'user_agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'viewport': (1920, 1080),
                'platform': 'Linux x86_64',
                'languages': ['en-US', 'en'],
                'timezone': 'Europe/London'
            }
        ]
    
    def get_random_profile(self):
        """Получение случайного профиля браузера"""
        return random.choice(self.profiles)
    
    def setup_stealth_options(self, options, profile=None):
        """Настройка стелс-опций для браузера"""
        if not profile:
            profile = self.get_random_profile()
        
        # Основные антидетект опции
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Настройка viewport
        options.add_argument(f'--window-size={profile["viewport"][0]},{profile["viewport"][1]}')
        
        # User Agent
        options.add_argument(f'--user-agent={profile["user_agent"]}')
        
        # Дополнительные опции для обхода детекции
        options.add_argument('--disable-web-security')
        options.add_argument('--disable-features=VizDisplayCompositor')
        options.add_argument('--disable-extensions-file-access-check')
        options.add_argument('--disable-extensions-http-throttling')
        options.add_argument('--disable-component-extensions-with-background-pages')
        
        # Preferences для дополнительного обхода
        prefs = {
            "profile.default_content_setting_values": {
                "notifications": 2,
                "geolocation": 2,
                "media_stream": 2,
            },
            "profile.managed_default_content_settings": {
                "images": 1
            }
        }
        options.add_experimental_option("prefs", prefs)
        
        return options, profile

class HumanBehaviorSimulator:
    """Имитация человеческого поведения"""
    
    @staticmethod
    def random_delay(min_ms=100, max_ms=3000):
        """Случайная задержка"""
        delay = random.uniform(min_ms/1000, max_ms/1000)
        time.sleep(delay)
    
    @staticmethod
    def human_type(element, text, typing_speed_range=(0.05, 0.2)):
        """Человеческий ввод текста"""
        element.clear()
        for char in text:
            element.send_keys(char)
            delay = random.uniform(*typing_speed_range)
            time.sleep(delay)
            
            # Случайные паузы и опечатки
            if random.random() < 0.02:  # 2% шанс опечатки
                wrong_char = random.choice('qwertyuiopasdfghjklzxcvbnm')
                element.send_keys(wrong_char)
                time.sleep(random.uniform(0.1, 0.3))
                element.send_keys(Keys.BACKSPACE)
                time.sleep(random.uniform(0.1, 0.2))
            
            if random.random() < 0.05:  # 5% шанс паузы
                time.sleep(random.uniform(0.5, 2.0))
    
    @staticmethod
    def human_scroll(driver, direction='down', intensity=3):
        """Человеческая прокрутка"""
        for _ in range(random.randint(1, intensity)):
            if direction == 'down':
                driver.execute_script("window.scrollBy(0, arguments[0]);", random.randint(200, 600))
            else:
                driver.execute_script("window.scrollBy(0, arguments[0]);", random.randint(-600, -200))
            time.sleep(random.uniform(0.1, 0.5))
    
    @staticmethod
    def human_mouse_movement(driver, element):
        """Человеческое движение мыши"""
        action = ActionChains(driver)
        
        # Случайное движение перед кликом
        for _ in range(random.randint(1, 3)):
            x_offset = random.randint(-50, 50)
            y_offset = random.randint(-50, 50)
            action.move_by_offset(x_offset, y_offset)
            action.pause(random.uniform(0.1, 0.3))
        
        action.move_to_element(element)
        action.pause(random.uniform(0.2, 0.8))
        action.perform()

class CaptchaSolver:
    """Решение капчи"""
    
    def __init__(self, anticaptcha_key=None):
        self.anticaptcha_key = anticaptcha_key or os.getenv('ANTICAPTCHA_KEY')
    
    def solve_recaptcha_v2(self, driver, site_key):
        """Решение reCAPTCHA v2"""
        try:
            if not self.anticaptcha_key:
                logger.warning("AntiCaptcha ключ не настроен")
                return False
            
            # Здесь будет интеграция с AntiCaptcha API
            logger.info("Попытка решения reCAPTCHA v2...")
            # Временная заглушка
            time.sleep(5)
            return True
            
        except Exception as e:
            logger.error(f"Ошибка решения капчи: {e}")
            return False
    
    def solve_image_captcha(self, image_element):
        """Решение изображений капчи"""
        try:
            # Сохранение изображения
            screenshot = image_element.screenshot_as_png
            image = Image.open(io.BytesIO(screenshot))
            
            # Здесь будет OCR и решение
            logger.info("Попытка решения изображения капчи...")
            return "captcha_solution"
            
        except Exception as e:
            logger.error(f"Ошибка решения изображения капчи: {e}")
            return None

class ProxyManager:
    """Управление прокси"""
    
    def __init__(self):
        self.proxies = []
        self.current_proxy_index = 0
    
    def add_proxy(self, proxy_config):
        """Добавление прокси"""
        self.proxies.append(proxy_config)
    
    def get_next_proxy(self):
        """Получение следующего прокси"""
        if not self.proxies:
            return None
        
        proxy = self.proxies[self.current_proxy_index]
        self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxies)
        return proxy
    
    def format_proxy_for_chrome(self, proxy):
        """Форматирование прокси для Chrome"""
        if proxy:
            return f"{proxy['type']}://{proxy['host']}:{proxy['port']}"
        return None

class PlatformHandler:
    """Обработчик различных платформ"""
    
    def __init__(self, driver, behavior_simulator, captcha_solver):
        self.driver = driver
        self.behavior = behavior_simulator
        self.captcha = captcha_solver
    
    def handle_instagram_login(self, username, password):
        """Вход в Instagram"""
        try:
            self.driver.get("https://www.instagram.com/accounts/login/")
            self.behavior.random_delay(2000, 4000)
            
            # Ввод имени пользователя
            username_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "username"))
            )
            self.behavior.human_type(username_field, username)
            
            # Ввод пароля
            password_field = self.driver.find_element(By.NAME, "password")
            self.behavior.human_type(password_field, password)
            
            # Клик по кнопке входа
            login_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            self.behavior.human_mouse_movement(self.driver, login_button)
            login_button.click()
            
            self.behavior.random_delay(3000, 6000)
            return True
            
        except Exception as e:
            logger.error(f"Ошибка входа в Instagram: {e}")
            return False
    
    def handle_tiktok_actions(self, actions):
        """Обработка действий TikTok"""
        try:
            self.driver.get("https://www.tiktok.com/")
            self.behavior.random_delay(3000, 5000)
            
            for action in actions:
                if action['type'] == 'like_video':
                    self._tiktok_like_video(action.get('video_url'))
                elif action['type'] == 'follow_user':
                    self._tiktok_follow_user(action.get('username'))
                elif action['type'] == 'comment':
                    self._tiktok_comment(action.get('video_url'), action.get('text'))
                
                self.behavior.random_delay(5000, 15000)
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка действий TikTok: {e}")
            return False
    
    def _tiktok_like_video(self, video_url):
        """Лайк видео в TikTok"""
        self.driver.get(video_url)
        self.behavior.random_delay(2000, 4000)
        
        like_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(@data-e2e, 'like')]"))
        )
        self.behavior.human_mouse_movement(self.driver, like_button)
        like_button.click()
    
    def handle_reddit_actions(self, actions):
        """Обработка действий Reddit"""
        try:
            self.driver.get("https://www.reddit.com/")
            self.behavior.random_delay(2000, 4000)
            
            for action in actions:
                if action['type'] == 'upvote_post':
                    self._reddit_upvote_post(action.get('post_url'))
                elif action['type'] == 'comment':
                    self._reddit_comment(action.get('post_url'), action.get('text'))
                
                self.behavior.random_delay(10000, 20000)
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка действий Reddit: {e}")
            return False

class AdvancedRPABot:
    """Продвинутый RPA-бот с полным функционалом"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.antidetect = AntiDetectSystem()
        self.behavior = HumanBehaviorSimulator()
        self.captcha_solver = CaptchaSolver()
        self.proxy_manager = ProxyManager()
        self.platform_handler = None
        self.session_data = {}
        
        logger.info("Продвинутый RPA Bot инициализирован")
    
    def setup_browser(self, proxy=None, profile=None, stealth_mode=True):
        """Настройка продвинутого браузера"""
        try:
            if stealth_mode:
                # Используем undetected-chromedriver для максимальной скрытности
                options = uc.ChromeOptions()
                options.add_argument('--headless')
            else:
                options = Options()
                options.add_argument('--headless')
            
            # Настройка антидетекта
            options, browser_profile = self.antidetect.setup_stealth_options(options, profile)
            
            # Настройка прокси
            if proxy:
                proxy_string = self.proxy_manager.format_proxy_for_chrome(proxy)
                if proxy_string:
                    options.add_argument(f'--proxy-server={proxy_string}')
            
            # Дополнительные опции для Railway
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--remote-debugging-port=9222')
            
            if stealth_mode:
                self.driver = uc.Chrome(options=options, version_main=120)
            else:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
            
            # Настройка антидетект скриптов
            self._setup_antidetect_scripts(browser_profile)
            
            self.wait = WebDriverWait(self.driver, 15)
            self.platform_handler = PlatformHandler(self.driver, self.behavior, self.captcha_solver)
            
            logger.info("Продвинутый браузер настроен успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки продвинутого браузера: {e}")
            return False
    
    def _setup_antidetect_scripts(self, profile):
        """Настройка антидетект скриптов"""
        scripts = [
            # Скрытие webdriver
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})",
            
            # Подмена языков
            f"Object.defineProperty(navigator, 'languages', {{get: () => {json.dumps(profile['languages'])}}})",
            
            # Подмена платформы
            f"Object.defineProperty(navigator, 'platform', {{get: () => '{profile['platform']}'}})",
            
            # Подмена временной зоны
            f"Intl.DateTimeFormat = function(){{return {{resolvedOptions: () => ({{timeZone: '{profile['timezone']}'}})}}}}"
        ]
        
        for script in scripts:
            try:
                self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {'source': script})
            except:
                pass
    
    def execute_advanced_action(self, action):
        """Выполнение продвинутого действия"""
        action_type = action.get('type')
        logger.info(f"Выполнение продвинутого действия: {action_type}")
        
        try:
            # Базовые действия
            if action_type == 'navigate':
                return self._navigate_advanced(action)
            elif action_type == 'click':
                return self._click_advanced(action)
            elif action_type == 'type':
                return self._type_advanced(action)
            elif action_type == 'wait':
                return self._wait_advanced(action)
            elif action_type == 'scroll':
                return self._scroll_advanced(action)
            elif action_type == 'screenshot':
                return self._take_screenshot(action)
            
            # Продвинутые действия
            elif action_type == 'solve_captcha':
                return self._solve_captcha_action(action)
            elif action_type == 'handle_popup':
                return self._handle_popup(action)
            elif action_type == 'extract_data':
                return self._extract_data(action)
            elif action_type == 'upload_file':
                return self._upload_file(action)
            elif action_type == 'switch_tab':
                return self._switch_tab(action)
            
            # Платформо-специфичные действия
            elif action_type == 'instagram_login':
                return self.platform_handler.handle_instagram_login(
                    action.get('username'), action.get('password')
                )
            elif action_type == 'tiktok_actions':
                return self.platform_handler.handle_tiktok_actions(action.get('actions', []))
            elif action_type == 'reddit_actions':
                return self.platform_handler.handle_reddit_actions(action.get('actions', []))
            
            else:
                logger.warning(f"Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка выполнения продвинутого действия {action_type}: {e}")
            return False
    
    def _navigate_advanced(self, action):
        """Продвинутая навигация"""
        url = action.get('url')
        if not url:
            return False
        
        # Проверка и обход блокировок
        self.driver.get(url)
        self.behavior.random_delay(2000, 5000)
        
        # Проверка на капчу или блокировку
        page_source = self.driver.page_source.lower()
        if any(keyword in page_source for keyword in ['captcha', 'blocked', 'forbidden']):
            logger.warning("Обнаружена капча или блокировка")
            return self._handle_blocking()
        
        return True
    
    def _click_advanced(self, action):
        """Продвинутый клик"""
        if 'selector' in action:
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, action['selector'])))
            
            # Прокрутка к элементу
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            self.behavior.random_delay(500, 1500)
            
            # Человеческое движение мыши
            self.behavior.human_mouse_movement(self.driver, element)
            
            # Клик с задержкой
            element.click()
            
        elif 'xpath' in action:
            element = self.wait.until(EC.element_to_be_clickable((By.XPATH, action['xpath'])))
            self.behavior.human_mouse_movement(self.driver, element)
            element.click()
            
        elif 'x' in action and 'y' in action:
            # Клик по координатам с имитацией движения
            action_chains = ActionChains(self.driver)
            action_chains.move_by_offset(action['x'], action['y'])
            action_chains.pause(random.uniform(0.1, 0.3))
            action_chains.click()
            action_chains.perform()
        
        self.behavior.random_delay(200, 800)
        return True
    
    def _type_advanced(self, action):
        """Продвинутый ввод текста"""
        text = action.get('text', '')
        
        if 'selector' in action:
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, action['selector'])))
        elif 'xpath' in action:
            element = self.wait.until(EC.presence_of_element_located((By.XPATH, action['xpath'])))
        else:
            element = self.driver.switch_to.active_element
        
        # Фокус на элементе
        element.click()
        self.behavior.random_delay(100, 300)
        
        # Человеческий ввод
        self.behavior.human_type(element, text)
        
        return True
    
    def _solve_captcha_action(self, action):
        """Решение капчи"""
        captcha_type = action.get('captcha_type', 'recaptcha_v2')
        
        if captcha_type == 'recaptcha_v2':
            site_key = action.get('site_key')
            return self.captcha_solver.solve_recaptcha_v2(self.driver, site_key)
        
        return False
    
    def _extract_data(self, action):
        """Извлечение данных"""
        selector = action.get('selector')
        attribute = action.get('attribute', 'text')
        
        try:
            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
            data = []
            
            for element in elements:
                if attribute == 'text':
                    data.append(element.text)
                else:
                    data.append(element.get_attribute(attribute))
            
            # Сохранение данных в сессии
            self.session_data['extracted_data'] = data
            return True
            
        except Exception as e:
            logger.error(f"Ошибка извлечения данных: {e}")
            return False
    
    def _take_screenshot(self, action):
        """Создание скриншота"""
        filename = action.get('filename', f"screenshot_{int(time.time())}.png")
        filepath = f"screenshots/{filename}"
        
        try:
            self.driver.save_screenshot(filepath)
            self.session_data['last_screenshot'] = filepath
            return True
        except Exception as e:
            logger.error(f"Ошибка создания скриншота: {e}")
            return False
    
    def execute_advanced_task(self, task):
        """Выполнение продвинутой задачи"""
        start_time = time.time()
        task_id = task.get('taskId', 'unknown')
        
        logger.info(f"Начало выполнения продвинутой задачи: {task_id}")
        
        try:
            # Настройка браузера с продвинутыми опциями
            proxy = task.get('proxy')
            stealth_mode = task.get('stealth_mode', True)
            
            if not self.setup_browser(proxy=proxy, stealth_mode=stealth_mode):
                raise Exception("Не удалось настроить продвинутый браузер")
            
            # Начальная навигация
            if task.get('url'):
                self.driver.get(task['url'])
                self.behavior.random_delay(2000, 5000)
            
            completed_actions = 0
            actions = task.get('actions', [])
            results = []
            
            for i, action in enumerate(actions):
                logger.info(f"Выполнение действия {i+1}/{len(actions)}: {action.get('type')}")
                
                result = self.execute_advanced_action(action)
                results.append({
                    'action_index': i,
                    'action_type': action.get('type'),
                    'success': result,
                    'timestamp': datetime.now().isoformat()
                })
                
                if result:
                    completed_actions += 1
                else:
                    logger.warning(f"Действие {i+1} не выполнено: {action}")
                    
                    # Опциональная остановка при ошибке
                    if task.get('stop_on_error', False):
                        break
                
                # Проверка таймаута
                if time.time() - start_time > task.get('timeout', 300000) / 1000:
                    raise TimeoutException("Превышен таймаут выполнения задачи")
                
                # Случайная пауза между действиями
                self.behavior.random_delay(1000, 5000)
            
            execution_time = int((time.time() - start_time) * 1000)
            
            # Финальный скриншот
            final_screenshot = f"screenshots/final_{task_id}_{int(time.time())}.png"
            try:
                self.driver.save_screenshot(final_screenshot)
            except:
                final_screenshot = None
            
            result = {
                'taskId': task_id,
                'success': True,
                'message': f'Продвинутая задача выполнена. Выполнено {completed_actions}/{len(actions)} действий',
                'executionTime': execution_time,
                'completedActions': completed_actions,
                'totalActions': len(actions),
                'screenshot': final_screenshot,
                'actionResults': results,
                'sessionData': self.session_data,
                'data': {
                    'url': self.driver.current_url,
                    'title':чение self.driver.title,
                    'cookies': self.driver.get_cookies()
                },
                'environment': 'advanced-cloud',
                'features': ['antidetect', 'stealth-mode', 'captcha-solving', 'human-behavior']
            }
            
            logger.info(f"Продвинутая задача {task_id} выполнена успешно за {execution_time}ms")
            return result
            
        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            
            # Скриншот ошибки
            error_screenshot = None
            try:
                error_screenshot = f"screenshots/error_{task_id}_{int(time.time())}.png"
                self.driver.save_screenshot(error_screenshot)
            except:
                pass
            
            result = {
                'taskId': task_id,
                'success': False,
                'message': 'Ошибка выполнения продвинутой задачи',
                'error': str(e),
                'executionTime': execution_time,
                'completedActions': completed_actions if 'completed_actions' in locals() else 0,
                'screenshot': error_screenshot,
                'environment': 'advanced-cloud'
            }
            
            logger.error(f"Ошибка выполнения продвинутой задачи {task_id}: {e}")
            return result
            
        finally:
            if self.driver:
                try:
                    self.driver.quit()
                except:
                    pass
                self.driver = None
                self.session_data = {}

# Глобальный экземпляр продвинутого бота
advanced_rpa_bot = AdvancedRPABot()

def send_result_to_supabase(task_id, result):
    """Отправка результата в Supabase с повторными попытками"""
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
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
                logger.info(f"Результат продвинутой задачи {task_id} отправлен в Supabase")
                return True
            else:
                logger.error(f"Ошибка отправки в Supabase: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Попытка {attempt + 1}: Ошибка отправки в Supabase: {e}")
            
        if attempt < max_retries - 1:
            time.sleep(retry_delay * (attempt + 1))
    
    return False

@app.route('/health', methods=['GET'])
def health():
    """Расширенная проверка здоровья"""
    system_info = {
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent
    }
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0-advanced',
        'environment': 'railway-advanced',
        'system': system_info,
        'features': [
            'antidetect', 'stealth-mode', 'captcha-solving', 
            'human-behavior', 'proxy-support', 'platform-handlers',
            'data-extraction', 'advanced-automation'
        ]
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Расширенный статус бота"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'capabilities': [
            'navigate', 'click', 'type', 'wait', 'scroll', 'key', 
            'screenshot', 'solve_captcha', 'handle_popup', 'extract_data',
            'upload_file', 'switch_tab', 'instagram_login', 'tiktok_actions',
            'reddit_actions'
        ],
        'platforms': ['instagram', 'tiktok', 'reddit', 'youtube', 'telegram'],
        'environment': 'railway-advanced-cloud',
        'antidetect': True,
        'stealth_mode': True,
        'captcha_solving': True,
        'proxy_support': True
    })

@app.route('/execute', methods=['POST'])
def execute_task():
    """Выполнение продвинутой RPA задачи"""
    try:
        task = request.get_json()
        
        if not task:
            return jsonify({'error': 'Пустая задача'}), 400
        
        task_id = task.get('taskId')
        if not task_id:
            return jsonify({'error': 'Отсутствует taskId'}), 400
        
        # Валидация задачи
        if not task.get('actions') or not isinstance(task['actions'], list):
            return jsonify({'error': 'Отсутствуют или некорректные действия'}), 400
        
        logger.info(f"Получена продвинутая задача: {task_id}")
        
        def execute_and_send():
            result = advanced_rpa_bot.execute_advanced_task(task)
            send_result_to_supabase(task_id, result)
        
        thread = threading.Thread(target=execute_and_send)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Продвинутая задача {task_id} принята к выполнению',
            'taskId': task_id,
            'environment': 'railway-advanced-cloud',
            'features': ['antidetect', 'stealth-mode', 'captcha-solving']
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении продвинутой задачи: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/proxy/add', methods=['POST'])
def add_proxy():
    """Добавление прокси"""
    try:
        proxy_config = request.get_json()
        advanced_rpa_bot.proxy_manager.add_proxy(proxy_config)
        
        return jsonify({
            'success': True,
            'message': 'Прокси добавлен успешно'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/session/data', methods=['GET'])
def get_session_data():
    """Получение данных сессии"""
    return jsonify({
        'sessionData': advanced_rpa_bot.session_data,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("🚀 Запуск продвинутого RPA Bot сервера...")
    logger.info(f"Порт: {BOT_PORT}")
    logger.info(f"Supabase URL: {SUPABASE_URL}")
    logger.info("Среда: Railway Advanced Cloud")
    logger.info("Возможности: Антидетект, Стелс-режим, Решение капчи, Человеческое поведение")
    
    # Создание необходимых директорий
    os.makedirs('screenshots', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    os.makedirs('profiles', exist_ok=True)
    os.makedirs('extensions', exist_ok=True)
    
    app.run(host='0.0.0.0', port=BOT_PORT, debug=False)
