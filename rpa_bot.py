
#!/usr/bin/env python3
"""
Универсальный RPA-бот для всех платформ
Запускается как в облаке, так и локально
"""

import os
import sys
import json
import time
import random
import logging
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

import requests
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import undetected_chromedriver as uc
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
from PIL import Image
import psutil

# Создание необходимых директорий
os.makedirs('/app/screenshots', exist_ok=True)
os.makedirs('/app/logs', exist_ok=True)
os.makedirs('/app/frontend', exist_ok=True)

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='frontend', static_url_path='')

class UniversalRPABot:
    """Универсальный RPA-бот для всех платформ"""
    
    def __init__(self):
        self.driver = None
        self.current_session = None
        self.platforms_config = self._load_platforms_config()
        self.user_agents = UserAgent()
        
    def _load_platforms_config(self) -> Dict:
        """Загрузка конфигурации платформ"""
        return {
            'instagram': {
                'base_url': 'https://www.instagram.com',
                'login_url': 'https://www.instagram.com/accounts/login/',
                'selectors': {
                    'username': 'input[name="username"]',
                    'password': 'input[name="password"]',
                    'login_button': 'button[type="submit"]',
                    'like_button': 'svg[aria-label="Like"]',
                    'follow_button': 'button:contains("Follow")',
                    'comment_input': 'textarea[placeholder="Add a comment..."]'
                }
            },
            'youtube': {
                'base_url': 'https://www.youtube.com',
                'login_url': 'https://accounts.google.com/signin',
                'selectors': {
                    'like_button': '#top-level-buttons-computed button[aria-label*="like"]',
                    'subscribe_button': '#subscribe-button',
                    'comment_input': '#contenteditable-root'
                }
            },
            'twitter': {
                'base_url': 'https://x.com',
                'login_url': 'https://x.com/i/flow/login',
                'selectors': {
                    'like_button': '[data-testid="like"]',
                    'retweet_button': '[data-testid="retweet"]',
                    'follow_button': '[data-testid*="follow"]',
                    'tweet_input': '[data-testid="tweetTextarea_0"]'
                }
            }
        }
    
    def create_driver(self, stealth_mode=True, proxy=None):
        """Создание webdriver с антидетект настройками"""
        try:
            options = Options()
            
            # Базовые настройки для облака
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            options.add_argument('--headless')
            
            # Антидетект настройки
            if stealth_mode:
                options.add_argument(f'--user-agent={self.user_agents.random}')
            
            # Прокси
            if proxy:
                options.add_argument(f'--proxy-server={proxy}')
            
            # Создание драйвера
            if stealth_mode:
                self.driver = uc.Chrome(options=options)
            else:
                self.driver = webdriver.Chrome(options=options)
            
            logger.info("WebDriver создан успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка создания WebDriver: {e}")
            return False
    
    def close(self):
        """Закрытие драйвера"""
        if self.driver:
            self.driver.quit()
            self.driver = None

# Глобальный инстанс бота
rpa_bot = UniversalRPABot()

@app.route('/')
def index():
    """Главная страница"""
    return jsonify({
        'status': 'online',
        'message': 'Universal RPA Bot is running',
        'version': '2.0.0',
        'capabilities': list(rpa_bot.platforms_config.keys())
    })

@app.route('/health')
def health_check():
    """Проверка здоровья сервиса"""
    try:
        system_info = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'system': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            },
            'capabilities': list(rpa_bot.platforms_config.keys()),
            'version': '2.0.0',
            'environment': 'production' if os.getenv('PORT') else 'development'
        }
        
        return jsonify(system_info), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/execute', methods=['POST'])
def execute_rpa_task():
    """Выполнение RPA задачи"""
    try:
        task_data = request.get_json()
        logger.info(f"Получена RPA задача: {task_data}")
        
        if not task_data:
            return jsonify({'success': False, 'error': 'Нет данных задачи'}), 400
        
        task_id = task_data.get('taskId', f'task_{int(time.time())}')
        url = task_data.get('url', 'https://example.com')
        
        # Создание драйвера
        if not rpa_bot.create_driver():
            return jsonify({'success': False, 'error': 'Не удалось создать браузер'}), 500
        
        try:
            # Переход на страницу
            rpa_bot.driver.get(url)
            time.sleep(3)
            
            # Скриншот результата
            screenshot_path = f'/app/screenshots/task_{task_id}_{int(time.time())}.png'
            rpa_bot.driver.save_screenshot(screenshot_path)
            
            return jsonify({
                'success': True,
                'message': 'RPA задача выполнена успешно',
                'taskId': task_id,
                'screenshot': screenshot_path
            })
            
        finally:
            rpa_bot.close()
            
    except Exception as e:
        logger.error(f"Ошибка выполнения RPA задачи: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/status')
def get_status():
    """Расширенный статус системы"""
    try:
        return jsonify({
            'bot_status': 'online',
            'active_sessions': 1 if rpa_bot.driver else 0,
            'supported_platforms': list(rpa_bot.platforms_config.keys()),
            'system_resources': {
                'cpu': f"{psutil.cpu_percent()}%",
                'memory': f"{psutil.virtual_memory().percent}%",
                'disk': f"{psutil.disk_usage('/').percent}%"
            },
            'uptime': time.time(),
            'version': '2.0.0-universal'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    
    logger.info(f"🚀 Запуск универсального RPA-бота на порту {port}")
    logger.info(f"🌐 Поддерживаемые платформы: {list(rpa_bot.platforms_config.keys())}")
    
    app.run(host='0.0.0.0', port=port, debug=False)
