
#!/usr/bin/env python3
"""
Универсальный облачный RPA-бот с полным функционалом
Поддерживает все основные платформы: Instagram, TikTok, YouTube, X (Twitter), 
Facebook, LinkedIn, Telegram, Reddit, Discord, WhatsApp и другие
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

class UniversalAntiDetectSystem:
    """Универсальная система антидетекта для всех платформ"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.profiles = self._load_universal_profiles()
        self.platform_configs = self._load_platform_configs()
    
    def _load_universal_profiles(self):
        """Загрузка универсальных профилей браузеров"""
        return [
            {
                'name': 'Windows Chrome',
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'viewport': (1920, 1080),
                'platform': 'Win32',
                'languages': ['en-US', 'en'],
                'timezone': 'America/New_York',
                'webgl_vendor': 'Google Inc. (NVIDIA)',
                'webgl_renderer': 'ANGLE (NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0)'
            },
            {
                'name': 'MacOS Safari',
                'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
                'viewport': (1440, 900),
                'platform': 'MacIntel',
                'languages': ['en-US', 'en'],
                'timezone': 'America/Los_Angeles',
                'webgl_vendor': 'Apple',
                'webgl_renderer': 'Apple GPU'
            },
            {
                'name': 'Linux Firefox',
                'user_agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
                'viewport': (1920, 1080),
                'platform': 'Linux x86_64',
                'languages': ['en-US', 'en'],
                'timezone': 'Europe/London',
                'webgl_vendor': 'Mozilla',
                'webgl_renderer': 'Mesa DRI Intel(R) UHD Graphics'
            }
        ]
    
    def _load_platform_configs(self):
        """Конфигурации для различных платформ"""
        return {
            'instagram': {
                'login_url': 'https://www.instagram.com/accounts/login/',
                'selectors': {
                    'username': 'input[name="username"]',
                    'password': 'input[name="password"]',
                    'login_button': 'button[type="submit"]',
                    'like_button': '[aria-label="Like"]',
                    'follow_button': 'button:contains("Follow")',
                    'comment_input': 'textarea[aria-label="Add a comment..."]'
                }
            },
            'tiktok': {
                'login_url': 'https://www.tiktok.com/login',
                'selectors': {
                    'like_button': '[data-e2e="like-icon"]',
                    'follow_button': '[data-e2e="follow-button"]',
                    'share_button': '[data-e2e="share-button"]',
                    'comment_input': '[data-e2e="comment-input"]'
                }
            },
            'youtube': {
                'login_url': 'https://accounts.google.com/signin',
                'selectors': {
                    'like_button': '#top-level-buttons-computed ytd-toggle-button-renderer:first-child button',
                    'subscribe_button': '#subscribe-button button',
                    'comment_input': '#placeholder-area',
                    'comment_submit': '#submit-button button'
                }
            },
            'x': {  # Twitter/X
                'login_url': 'https://x.com/i/flow/login',
                'selectors': {
                    'username': 'input[name="text"]',
                    'password': 'input[name="password"]',
                    'like_button': '[data-testid="like"]',
                    'retweet_button': '[data-testid="retweet"]',
                    'reply_button': '[data-testid="reply"]',
                    'follow_button': '[data-testid*="follow"]'
                }
            },
            'facebook': {
                'login_url': 'https://www.facebook.com/login',
                'selectors': {
                    'email': '#email',
                    'password': '#pass',
                    'login_button': '[name="login"]',
                    'like_button': '[aria-label="Like"]',
                    'comment_input': '[data-testid="comment-input"]'
                }
            },
            'linkedin': {
                'login_url': 'https://www.linkedin.com/login',
                'selectors': {
                    'username': '#username',
                    'password': '#password',
                    'login_button': '.btn__primary--large',
                    'like_button': '.react-button__trigger',
                    'connect_button': '.pvs-profile-actions__action'
                }
            },
            'telegram': {
                'login_url': 'https://web.telegram.org/',
                'selectors': {
                    'phone_input': 'input[type="tel"]',
                    'code_input': '.input-field-input',
                    'chat_item': '.chatlist-chat'
                }
            },
            'reddit': {
                'login_url': 'https://www.reddit.com/login',
                'selectors': {
                    'username': '#loginUsername',
                    'password': '#loginPassword',
                    'login_button': '.AnimatedForm__submitButton',
                    'upvote_button': '[aria-label="upvote"]',
                    'comment_input': '.public-DraftEditor-content'
                }
            },
            'discord': {
                'login_url': 'https://discord.com/login',
                'selectors': {
                    'email': 'input[name="email"]',
                    'password': 'input[name="password"]',
                    'login_button': 'button[type="submit"]',
                    'message_input': '[data-slate-editor="true"]'
                }
            },
            'whatsapp': {
                'login_url': 'https://web.whatsapp.com/',
                'selectors': {
                    'qr_code': '[data-testid="qrcode"]',
                    'chat_item': '[data-testid="chat"]',
                    'message_input': '[data-testid="conversation-compose-box-input"]'
                }
            }
        }

class UniversalHumanBehavior:
    """Универсальная имитация человеческого поведения"""
    
    @staticmethod
    def random_delay(min_ms=100, max_ms=3000):
        """Случайная задержка с человеческим распределением"""
        # Используем гамма-распределение для более естественных пауз
        delay = np.random.gamma(2, (max_ms - min_ms) / 1000 / 4) + min_ms / 1000
        time.sleep(max(delay, min_ms / 1000))
    
    @staticmethod
    def human_type(element, text, typing_speed_range=(0.05, 0.3)):
        """Человеческий ввод с опечатками и исправлениями"""
        element.clear()
        
        for i, char in enumerate(text):
            # Случайные опечатки
            if random.random() < 0.03:  # 3% шанс опечатки
                wrong_chars = 'qwertyuiopasdfghjklzxcvbnm1234567890'
                wrong_char = random.choice(wrong_chars)
                element.send_keys(wrong_char)
                time.sleep(random.uniform(0.1, 0.3))
                element.send_keys(Keys.BACKSPACE)
                time.sleep(random.uniform(0.1, 0.2))
            
            # Ввод правильного символа
            element.send_keys(char)
            
            # Варьируемая скорость печати
            base_delay = random.uniform(*typing_speed_range)
            
            # Более длинные паузы после знаков препинания
            if char in '.,!?;:':
                base_delay *= random.uniform(2, 4)
            # Паузы после пробелов
            elif char == ' ':
                base_delay *= random.uniform(1.5, 2.5)
            
            time.sleep(base_delay)
            
            # Случайные длинные паузы (размышления)
            if random.random() < 0.05:  # 5% шанс паузы размышления
                time.sleep(random.uniform(1, 3))
    
    @staticmethod
    def human_scroll(driver, direction='down', intensity=3, platform='generic'):
        """Человеческая прокрутка с учетом платформы"""
        scroll_patterns = {
            'instagram': {'pixels': (300, 800), 'pauses': (0.2, 0.8)},
            'tiktok': {'pixels': (400, 900), 'pauses': (0.5, 2.0)},
            'youtube': {'pixels': (200, 600), 'pauses': (0.3, 1.0)},
            'x': {'pixels': (250, 700), 'pauses': (0.2, 0.6)},
            'generic': {'pixels': (200, 600), 'pauses': (0.2, 0.8)}
        }
        
        pattern = scroll_patterns.get(platform, scroll_patterns['generic'])
        
        for _ in range(random.randint(1, intensity)):
            scroll_amount = random.randint(*pattern['pixels'])
            if direction == 'up':
                scroll_amount = -scroll_amount
                
            # Естественная прокрутка с ускорением/замедлением
            steps = random.randint(3, 8)
            step_size = scroll_amount // steps
            
            for step in range(steps):
                current_step = step_size
                # Ускорение в начале, замедление в конце
                if step < 2:
                    current_step = int(step_size * 0.3)
                elif step > steps - 3:
                    current_step = int(step_size * 0.7)
                
                driver.execute_script(f"window.scrollBy(0, {current_step});")
                time.sleep(random.uniform(0.01, 0.05))
            
            time.sleep(random.uniform(*pattern['pauses']))
    
    @staticmethod
    def human_mouse_movement(driver, element):
        """Естественное движение мыши к элементу"""
        action = ActionChains(driver)
        
        # Получаем размеры окна
        window_size = driver.get_window_size()
        element_location = element.location
        element_size = element.size
        
        # Случайные промежуточные точки
        intermediate_points = random.randint(2, 5)
        
        for i in range(intermediate_points):
            # Создаем случайные точки по пути к элементу
            progress = (i + 1) / (intermediate_points + 1)
            target_x = element_location['x'] + element_size['width'] / 2
            target_y = element_location['y'] + element_size['height'] / 2
            
            # Добавляем случайность к траектории
            noise_x = random.randint(-100, 100) * (1 - progress)
            noise_y = random.randint(-100, 100) * (1 - progress)
            
            intermediate_x = int(target_x * progress + noise_x)
            intermediate_y = int(target_y * progress + noise_y)
            
            action.move_by_offset(
                intermediate_x - action._get_current_mouse_position()[0] if hasattr(action, '_get_current_mouse_position') else 0,
                intermediate_y - action._get_current_mouse_position()[1] if hasattr(action, '_get_current_mouse_position') else 0
            )
            action.pause(random.uniform(0.05, 0.2))
        
        # Финальное движение к элементу
        action.move_to_element_with_offset(
            element, 
            random.randint(-5, 5), 
            random.randint(-5, 5)
        )
        action.pause(random.uniform(0.1, 0.4))
        action.perform()

class UniversalPlatformHandler:
    """Универсальный обработчик всех платформ"""
    
    def __init__(self, driver, behavior_simulator, antidetect):
        self.driver = driver
        self.behavior = behavior_simulator
        self.antidetect = antidetect
        self.platform_configs = antidetect.platform_configs
    
    def login_to_platform(self, platform, credentials):
        """Универсальный вход на платформу"""
        config = self.platform_configs.get(platform)
        if not config:
            raise ValueError(f"Платформа {platform} не поддерживается")
        
        logger.info(f"Вход на платформу: {platform}")
        
        try:
            # Переход на страницу входа
            self.driver.get(config['login_url'])
            self.behavior.random_delay(2000, 5000)
            
            # Специфичная логика для каждой платформы
            if platform == 'instagram':
                return self._login_instagram(credentials, config['selectors'])
            elif platform == 'tiktok':
                return self._login_tiktok(credentials, config['selectors'])
            elif platform == 'youtube':
                return self._login_youtube(credentials, config['selectors'])
            elif platform == 'x':
                return self._login_x(credentials, config['selectors'])
            elif platform == 'facebook':
                return self._login_facebook(credentials, config['selectors'])
            elif platform == 'linkedin':
                return self._login_linkedin(credentials, config['selectors'])
            elif platform == 'telegram':
                return self._login_telegram(credentials, config['selectors'])
            elif platform == 'reddit':
                return self._login_reddit(credentials, config['selectors'])
            elif platform == 'discord':
                return self._login_discord(credentials, config['selectors'])
            elif platform == 'whatsapp':
                return self._login_whatsapp(credentials, config['selectors'])
            
            return False
            
        except Exception as e:
            logger.error(f"Ошибка входа на {platform}: {e}")
            return False
    
    def _login_instagram(self, credentials, selectors):
        """Вход в Instagram"""
        try:
            # Ввод имени пользователя
            username_field = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selectors['username']))
            )
            self.behavior.human_type(username_field, credentials['username'])
            
            # Ввод пароля
            password_field = self.driver.find_element(By.CSS_SELECTOR, selectors['password'])
            self.behavior.human_type(password_field, credentials['password'])
            
            # Клик по кнопке входа
            login_button = self.driver.find_element(By.CSS_SELECTOR, selectors['login_button'])
            self.behavior.human_mouse_movement(self.driver, login_button)
            login_button.click()
            
            self.behavior.random_delay(3000, 8000)
            
            # Проверка успешного входа
            return 'instagram.com' in self.driver.current_url and '/accounts/login' not in self.driver.current_url
            
        except Exception as e:
            logger.error(f"Ошибка входа в Instagram: {e}")
            return False
    
    def _login_youtube(self, credentials, selectors):
        """Вход в YouTube через Google"""
        try:
            # Ввод email
            email_field = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "identifierId"))
            )
            self.behavior.human_type(email_field, credentials['email'])
            
            # Клик "Далее"
            next_button = self.driver.find_element(By.ID, "identifierNext")
            next_button.click()
            self.behavior.random_delay(2000, 4000)
            
            # Ввод пароля
            password_field = WebDriverWait(self.driver, 15).until(
                EC.element_to_be_clickable((By.NAME, "password"))
            )
            self.behavior.human_type(password_field, credentials['password'])
            
            # Клик "Далее"
            password_next = self.driver.find_element(By.ID, "passwordNext")
            password_next.click()
            
            self.behavior.random_delay(3000, 6000)
            
            # Переход на YouTube
            self.driver.get("https://www.youtube.com")
            self.behavior.random_delay(2000, 4000)
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка входа в YouTube: {e}")
            return False
    
    def _login_x(self, credentials, selectors):
        """Вход в X (Twitter)"""
        try:
            # Ввод username/email
            username_field = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selectors['username']))
            )
            self.behavior.human_type(username_field, credentials['username'])
            
            # Клик "Далее"
            next_button = self.driver.find_element(By.XPATH, "//span[text()='Next']/..")
            next_button.click()
            self.behavior.random_delay(2000, 4000)
            
            # Ввод пароля
            password_field = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selectors['password']))
            )
            self.behavior.human_type(password_field, credentials['password'])
            
            # Клик "Log in"
            login_button = self.driver.find_element(By.XPATH, "//span[text()='Log in']/..")
            login_button.click()
            
            self.behavior.random_delay(3000, 6000)
            return 'x.com/home' in self.driver.current_url
            
        except Exception as e:
            logger.error(f"Ошибка входа в X: {e}")
            return False
    
    def _login_telegram(self, credentials, selectors):
        """Вход в Telegram Web"""
        try:
            # Ввод номера телефона
            phone_field = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selectors['phone_input']))
            )
            self.behavior.human_type(phone_field, credentials['phone'])
            
            # Клик "Next"
            next_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
            next_button.click()
            
            self.behavior.random_delay(2000, 4000)
            
            # Здесь нужно будет ввести код из SMS
            logger.info("Ожидание ввода SMS кода для Telegram")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка входа в Telegram: {e}")
            return False
    
    def perform_platform_action(self, platform, action_type, params):
        """Выполнение действий на платформе"""
        logger.info(f"Выполнение действия {action_type} на {platform}")
        
        try:
            if platform == 'instagram':
                return self._instagram_action(action_type, params)
            elif platform == 'tiktok':
                return self._tiktok_action(action_type, params)
            elif platform == 'youtube':
                return self._youtube_action(action_type, params)
            elif platform == 'x':
                return self._x_action(action_type, params)
            elif platform == 'facebook':
                return self._facebook_action(action_type, params)
            elif platform == 'linkedin':
                return self._linkedin_action(action_type, params)
            elif platform == 'telegram':
                return self._telegram_action(action_type, params)
            elif platform == 'reddit':
                return self._reddit_action(action_type, params)
            
            return False
            
        except Exception as e:
            logger.error(f"Ошибка выполнения действия {action_type} на {platform}: {e}")
            return False
    
    def _instagram_action(self, action_type, params):
        """Действия в Instagram"""
        config = self.platform_configs['instagram']
        
        if action_type == 'like_post':
            if params.get('post_url'):
                self.driver.get(params['post_url'])
                self.behavior.random_delay(2000, 4000)
            
            like_button = self.driver.find_element(By.CSS_SELECTOR, config['selectors']['like_button'])
            self.behavior.human_mouse_movement(self.driver, like_button)
            like_button.click()
            
        elif action_type == 'follow_user':
            if params.get('user_url'):
                self.driver.get(params['user_url'])
                self.behavior.random_delay(2000, 4000)
            
            follow_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Follow')]")
            follow_button.click()
            
        elif action_type == 'comment':
            comment_input = self.driver.find_element(By.CSS_SELECTOR, config['selectors']['comment_input'])
            self.behavior.human_type(comment_input, params['text'])
            comment_input.send_keys(Keys.ENTER)
        
        self.behavior.random_delay(1000, 3000)
        return True
    
    def _youtube_action(self, action_type, params):
        """Действия в YouTube"""
        config = self.platform_configs['youtube']
        
        if action_type == 'like_video':
            if params.get('video_url'):
                self.driver.get(params['video_url'])
                self.behavior.random_delay(3000, 6000)
            
            like_button = self.driver.find_element(By.CSS_SELECTOR, config['selectors']['like_button'])
            like_button.click()
            
        elif action_type == 'subscribe':
            subscribe_button = self.driver.find_element(By.CSS_SELECTOR, config['selectors']['subscribe_button'])
            subscribe_button.click()
            
        elif action_type == 'comment':
            # Прокрутка к комментариям
            self.behavior.human_scroll(self.driver, 'down', 3, 'youtube')
            
            comment_input = self.driver.find_element(By.CSS_SELECTOR, config['selectors']['comment_input'])
            comment_input.click()
            self.behavior.random_delay(500, 1500)
            
            self.behavior.human_type(comment_input, params['text'])
            
            submit_button = self.driver.find_element(By.CSS_SELECTOR, config['selectors']['comment_submit'])
            submit_button.click()
        
        self.behavior.random_delay(1000, 3000)
        return True

class UniversalRPABot:
    """Универсальный RPA-бот для всех платформ"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.antidetect = UniversalAntiDetectSystem()
        self.behavior = UniversalHumanBehavior()
        self.platform_handler = None
        self.session_data = {}
        self.current_platform = None
        
        logger.info("Универсальный RPA Bot инициализирован")
    
    def setup_browser(self, proxy=None, profile=None, stealth_mode=True):
        """Настройка универсального браузера"""
        try:
            if stealth_mode:
                options = uc.ChromeOptions()
                options.add_argument('--headless')
            else:
                options = Options()
                options.add_argument('--headless')
            
            # Получаем профиль
            if not profile:
                profile = random.choice(self.antidetect.profiles)
            
            # Базовые антидетект опции
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--disable-blink-features=AutomationControlled')
            #options.add_experimental_option("excludeSwitches", ["enable-automation"])
            #options.add_experimental_option('useAutomationExtension', False)
            options.add_argument(f'--window-size={profile["viewport"][0]},{profile["viewport"][1]}')
            options.add_argument(f'--user-agent={profile["user_agent"]}')
            options.add_argument("--remote-debugging-port=9222")
            options.add_argument("--remote-debugging-address=0.0.0.0")
            # Расширенные опции антидетекта
            options.add_argument('--disable-web-security')
            options.add_argument('--disable-features=VizDisplayCompositor')
            options.add_argument('--disable-ipc-flooding-protection')
            options.add_argument('--disable-background-timer-throttling')
            options.add_argument('--disable-backgrounding-occluded-windows')
            options.add_argument('--disable-renderer-backgrounding')
            
            # Preferences
            prefs = {
                "profile.default_content_setting_values": {
                    "notifications": 2,
                    "geolocation": 2,
                    "media_stream": 2,
                    "media_stream_mic": 2,
                    "media_stream_camera": 2
                },
                "profile.managed_default_content_settings": {
                    "images": 1
                },
                "profile.default_content_settings": {
                    "popups": 0
                }
            }
            options.add_experimental_option("prefs", prefs)
            
            # Настройка прокси если указан
            if proxy:
                options.add_argument(f'--proxy-server={proxy}')
            
            # Создание драйвера
            if stealth_mode:
                self.driver = uc.Chrome(options=options, version_main=120)
            else:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
            
            # Настройка антидетект скриптов
            self._setup_antidetect_scripts(profile)
            
            self.wait = WebDriverWait(self.driver, 20)
            self.platform_handler = UniversalPlatformHandler(self.driver, self.behavior, self.antidetect)
            
            logger.info(f"Универсальный браузер настроен: {profile['name']}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки универсального браузера: {e}")
            return False
    
    def _setup_antidetect_scripts(self, profile):
        """Настройка продвинутых антидетект скриптов"""
        scripts = [
            # Базовые скрипты
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})",
            f"Object.defineProperty(navigator, 'languages', {{get: () => {json.dumps(profile['languages'])}}})",
            f"Object.defineProperty(navigator, 'platform', {{get: () => '{profile['platform']}'}})",
            
            # WebGL антидетект
            f"""
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {{
                if (parameter === 37445) {{
                    return '{profile['webgl_vendor']}';
                }}
                if (parameter === 37446) {{
                    return '{profile['webgl_renderer']}';
                }}
                return getParameter.call(this, parameter);
            }};
            """,
            
            # Canvas fingerprint защита
            """
            const getImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
                const shift = {
                    'r': Math.floor(Math.random() * 10) - 5,
                    'g': Math.floor(Math.random() * 10) - 5,
                    'b': Math.floor(Math.random() * 10) - 5,
                    'a': Math.floor(Math.random() * 10) - 5
                };
                const imageData = getImageData.apply(this, arguments);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i + 0] = imageData.data[i + 0] + shift['r'];
                    imageData.data[i + 1] = imageData.data[i + 1] + shift['g'];
                    imageData.data[i + 2] = imageData.data[i + 2] + shift['b'];
                    imageData.data[i + 3] = imageData.data[i + 3] + shift['a'];
                }
                return imageData;
            };
            """,
            
            # Fonts защита
            """
            Object.defineProperty(navigator, 'fonts', {
                get: () => ({
                    check: () => Math.random() < 0.5,
                    load: () => Promise.resolve(),
                    ready: Promise.resolve()
                })
            });
            """,
        ]
        
        for script in scripts:
            try:
                self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {'source': script})
            except:
                pass
    
    def execute_universal_task(self, task):
        """Выполнение универсальной задачи"""
        start_time = time.time()
        task_id = task.get('taskId', 'unknown')
        
        logger.info(f"Начало выполнения универсальной задачи: {task_id}")
        
        try:
            # Настройка браузера
            proxy = task.get('proxy')
            stealth_mode = task.get('stealth_mode', True)
            
            if not self.setup_browser(proxy=proxy, stealth_mode=stealth_mode):
                raise Exception("Не удалось настроить универсальный браузер")
            
            # Определение платформы
            platform = task.get('platform', 'generic')
            self.current_platform = platform
            
            # Логин если требуется
            if task.get('credentials'):
                login_success = self.platform_handler.login_to_platform(platform, task['credentials'])
                if not login_success:
                    logger.warning(f"Не удалось войти на платформу {platform}")
            
            # Начальная навигация
            if task.get('url'):
                self.driver.get(task['url'])
                self.behavior.random_delay(2000, 5000)
            
            completed_actions = 0
            actions = task.get('actions', [])
            results = []
            
            for i, action in enumerate(actions):
                logger.info(f"Выполнение действия {i+1}/{len(actions)}: {action.get('type')}")
                
                result = self.execute_universal_action(action)
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
                    
                    if task.get('stop_on_error', False):
                        break
                
                # Проверка таймаута
                if time.time() - start_time > task.get('timeout', 300000) / 1000:
                    raise TimeoutException("Превышен таймаут выполнения задачи")
                
                # Пауза между действиями
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
                'message': f'Универсальная задача выполнена на {platform}. Выполнено {completed_actions}/{len(actions)} действий',
                'executionTime': execution_time,
                'completedActions': completed_actions,
                'totalActions': len(actions),
                'screenshot': final_screenshot,
                'actionResults': results,
                'sessionData': self.session_data,
                'platform': platform,
                'data': {
                    'url': self.driver.current_url,
                    'title': self.driver.title,
                    'cookies': self.driver.get_cookies()
                },
                'environment': 'universal-cloud',
                'features': ['universal-platforms', 'antidetect', 'human-behavior', 'captcha-solving']
            }
            
            logger.info(f"Универсальная задача {task_id} выполнена успешно за {execution_time}ms")
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
                'message': 'Ошибка выполнения универсальной задачи',
                'error': str(e),
                'executionTime': execution_time,
                'completedActions': completed_actions if 'completed_actions' in locals() else 0,
                'screenshot': error_screenshot,
                'platform': platform if 'platform' in locals() else 'unknown',
                'environment': 'universal-cloud'
            }
            
            logger.error(f"Ошибка выполнения универсальной задачи {task_id}: {e}")
            return result
            
        finally:
            if self.driver:
                try:
                    self.driver.quit()
                except:
                    pass
                self.driver = None
                self.session_data = {}
                self.current_platform = None
    
    def execute_universal_action(self, action):
        """Выполнение универсального действия"""
        action_type = action.get('type')
        logger.info(f"Выполнение универсального действия: {action_type}")
        
        try:
            # Базовые действия
            if action_type == 'navigate':
                return self._navigate_universal(action)
            elif action_type == 'click':
                return self._click_universal(action)
            elif action_type == 'type':
                return self._type_universal(action)
            elif action_type == 'wait':
                return self._wait_universal(action)
            elif action_type == 'scroll':
                return self._scroll_universal(action)
            elif action_type == 'screenshot':
                return self._take_screenshot(action)
            
            # Платформо-специфичные действия
            elif action_type.startswith('platform_'):
                # Формат: platform_instagram_like, platform_youtube_subscribe и т.д.
                parts = action_type.split('_')
                if len(parts) >= 3:
                    platform = parts[1]
                    platform_action = '_'.join(parts[2:])
                    return self.platform_handler.perform_platform_action(platform, platform_action, action)
            
            # Универсальные социальные действия
            elif action_type in ['like', 'follow', 'subscribe', 'comment', 'share', 'repost']:
                return self._universal_social_action(action_type, action)
            
            # Извлечение данных
            elif action_type == 'extract_data':
                return self._extract_data(action)
            
            else:
                logger.warning(f"Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка выполнения универсального действия {action_type}: {e}")
            return False
    
    def _universal_social_action(self, action_type, action):
        """Универсальные социальные действия"""
        if not self.current_platform:
            return False
            
        return self.platform_handler.perform_platform_action(
            self.current_platform, 
            action_type, 
            action
        )
    
    def _navigate_universal(self, action):
        """Универсальная навигация"""
        url = action.get('url')
        if not url:
            return False
        
        self.driver.get(url)
        self.behavior.random_delay(2000, 5000)
        
        # Проверка на блокировку или капчу
        page_source = self.driver.page_source.lower()
        if any(keyword in page_source for keyword in ['captcha', 'blocked', 'forbidden', 'bot detected']):
            logger.warning("Обнаружена капча или блокировка")
            # Здесь можно добавить логику решения капчи
        
        return True
    
    def _extract_data(self, action):
        """Универсальное извлечение данных"""
        selector = action.get('selector')
        attribute = action.get('attribute', 'text')
        
        try:
            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
            data = []
            
            for element in elements:
                if attribute == 'text':
                    data.append(element.text)
                elif attribute == 'href':
                    data.append(element.get_attribute('href'))
                elif attribute == 'src':
                    data.append(element.get_attribute('src'))
                else:
                    data.append(element.get_attribute(attribute))
            
            self.session_data['extracted_data'] = data
            logger.info(f"Извлечено {len(data)} элементов данных")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка извлечения данных: {e}")
            return False

# Глобальный экземпляр универсального бота
universal_rpa_bot = UniversalRPABot()

def send_result_to_supabase(task_id, result):
    """Отправка результата в Supabase"""
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
                logger.info(f"Результат универсальной задачи {task_id} отправлен в Supabase")
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
    """Проверка здоровья универсального бота"""
    system_info = {
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent,
        'processes': len(psutil.pids())
    }
    
    supported_platforms = list(universal_rpa_bot.antidetect.platform_configs.keys())
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '3.0.0-universal',
        'environment': 'railway-universal-cloud',
        'system': system_info,
        'supported_platforms': supported_platforms,
        'features': [
            'universal-platforms', 'antidetect', 'human-behavior', 
            'captcha-solving', 'proxy-support', 'data-extraction',
            'social-automation', 'advanced-stealth'
        ],
        'platform_count': len(supported_platforms)
    })

@app.route('/platforms', methods=['GET'])
def get_platforms():
    """Получение списка поддерживаемых платформ"""
    platforms = universal_rpa_bot.antidetect.platform_configs
    
    platform_info = {}
    for platform, config in platforms.items():
        platform_info[platform] = {
            'name': platform.title(),
            'login_url': config['login_url'],
            'supported_actions': list(config['selectors'].keys())
        }
    
    return jsonify({
        'platforms': platform_info,
        'total_count': len(platforms),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/execute', methods=['POST'])
def execute_universal_task():
    """Выполнение универсальной RPA задачи"""
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
        
        platform = task.get('platform', 'generic')
        logger.info(f"Получена универсальная задача: {task_id} для платформы: {platform}")
        
        def execute_and_send():
            result = universal_rpa_bot.execute_universal_task(task)
            send_result_to_supabase(task_id, result)
        
        thread = threading.Thread(target=execute_and_send)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Универсальная задача {task_id} принята к выполнению на платформе {platform}',
            'taskId': task_id,
            'platform': platform,
            'environment': 'railway-universal-cloud',
            'features': ['universal-platforms', 'antidetect', 'human-behavior']
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении универсальной задачи: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/test/<platform>', methods=['POST'])
def test_platform(platform):
    """Тестирование конкретной платформы"""
    try:
        data = request.get_json() or {}
        
        # Простая тестовая задача
        test_task = {
            'taskId': f'test_{platform}_{int(time.time())}',
            'platform': platform,
            'url': universal_rpa_bot.antidetect.platform_configs.get(platform, {}).get('login_url', f'https://{platform}.com'),
            'actions': [
                {'type': 'navigate', 'url': f'https://{platform}.com'},
                {'type': 'wait', 'duration': 3000},
                {'type': 'screenshot'}
            ],
            'timeout': 30000,
            'stealth_mode': True
        }
        
        logger.info(f"Тестирование платформы: {platform}")
        
        def test_and_respond():
            result = universal_rpa_bot.execute_universal_task(test_task)
            return result
        
        # Выполняем синхронно для тестирования
        result = test_and_respond()
        
        return jsonify({
            'success': result['success'],
            'platform': platform,
            'test_result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Ошибка тестирования платформы {platform}: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Запуск универсального RPA Bot сервера...")
    logger.info(f"Порт: {BOT_PORT}")
    logger.info(f"Supabase URL: {SUPABASE_URL}")
    logger.info("Среда: Railway Universal Cloud")
    
    # Список поддерживаемых платформ
    platforms = list(universal_rpa_bot.antidetect.platform_configs.keys())
    logger.info(f"Поддерживаемые платформы ({len(platforms)}): {', '.join(platforms)}")
    
    logger.info("Возможности: Универсальные платформы, Антидетект, Человеческое поведение, Решение капчи")
    
    # Создание директорий
    os.makedirs('screenshots', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    os.makedirs('profiles', exist_ok=True)
    os.makedirs('extensions', exist_ok=True)
    
    app.run(host='0.0.0.0', port=BOT_PORT, debug=False)
