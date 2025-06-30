
#!/usr/bin/env python3
"""
Конфигурация для продвинутого RPA бота с Multilogin
"""

import os
import random

# Основные настройки
BOT_VERSION = "4.0.0-multilogin"
ENVIRONMENT = "railway-cloud"

# API ключи
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://izmgzstdgoswlozinmyk.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# Multilogin настройки
MULTILOGIN_TOKEN = os.getenv('MULTILOGIN_TOKEN', '')
MULTILOGIN_API_URL = os.getenv('MULTILOGIN_API_URL', 'https://api.multilogin.com')
MULTILOGIN_LOCAL_URL = os.getenv('MULTILOGIN_LOCAL_URL', 'http://127.0.0.1:35000')

# Vision API настройки
VISION_MODEL = os.getenv('VISION_MODEL', 'openai/gpt-4o')
VISION_CACHE_TTL = int(os.getenv('VISION_CACHE_TTL', '86400'))
VISION_CACHE_DB = os.getenv('VISION_CACHE_DB', 'vision_cache.db')

# Антидетект настройки
HEADLESS_MODE = os.getenv('HEADLESS_MODE', 'true').lower() == 'true'
USE_PROXY_ROTATION = os.getenv('USE_PROXY_ROTATION', 'false').lower() == 'true'
PROXY_LIST = os.getenv('PROXY_LIST', '').split(',') if os.getenv('PROXY_LIST') else []

# Человекоподобное поведение
MIN_ACTION_DELAY = int(os.getenv('MIN_ACTION_DELAY', '500'))      # мс
MAX_ACTION_DELAY = int(os.getenv('MAX_ACTION_DELAY', '3000'))     # мс
TYPING_SPEED_MIN = float(os.getenv('TYPING_SPEED_MIN', '0.05'))   # сек между символами
TYPING_SPEED_MAX = float(os.getenv('TYPING_SPEED_MAX', '0.15'))   # сек между символами

# Таймауты
PAGE_LOAD_TIMEOUT = int(os.getenv('PAGE_LOAD_TIMEOUT', '30'))     # секунды
ELEMENT_WAIT_TIMEOUT = int(os.getenv('ELEMENT_WAIT_TIMEOUT', '15')) # секунды
TASK_TIMEOUT = int(os.getenv('TASK_TIMEOUT', '120'))             # секунды

# Директории
SCREENSHOTS_DIR = 'screenshots'
LOGS_DIR = 'logs'
CACHE_ERRORS_DIR = 'cache_errors'

# Флаги функций
ENABLE_VISION_CACHE = os.getenv('ENABLE_VISION_CACHE', 'true').lower() == 'true'
ENABLE_AUTO_LEARNING = os.getenv('ENABLE_AUTO_LEARNING', 'true').lower() == 'true'
ENABLE_ERROR_SCREENSHOTS = os.getenv('ENABLE_ERROR_SCREENSHOTS', 'true').lower() == 'true'
ENABLE_MULTILOGIN = os.getenv('ENABLE_MULTILOGIN', 'true').lower() == 'true'

# Логирование
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# User Agents для ротации
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
]

# Платформенные настройки
PLATFORM_CONFIGS = {
    'telegram': {
        'base_url': 'https://t.me',
        'like_selectors': [
            "//button[contains(@class, 'ReactionButton') and .//*[contains(text(), '👍')]]",
            "//button[.//*[contains(text(), '👍')]]",
            "//div[contains(@class, 'reaction') and contains(text(), '👍')]",
            "//span[contains(text(), '👍')]/.."
        ],
        'wait_time': 5
    },
    'youtube': {
        'base_url': 'https://youtube.com',
        'like_selectors': [
            "//button[@aria-label='Like this video']",
            "//button[contains(@title, 'Like')]",
            "#segmented-like-button button"
        ],
        'wait_time': 10
    },
    'instagram': {
        'base_url': 'https://instagram.com',
        'like_selectors': [
            "//button/*[contains(@aria-label, 'Like')]",
            "//button[contains(@aria-label, 'Like')]",
            "svg[aria-label*='Like']/.."
        ],
        'wait_time': 8
    }
}

def validate_config():
    """Проверка критичных настроек"""
    errors = []
    
    if not SUPABASE_URL:
        errors.append("SUPABASE_URL не установлен")
    
    if MIN_ACTION_DELAY >= MAX_ACTION_DELAY:
        errors.append("MIN_ACTION_DELAY должен быть меньше MAX_ACTION_DELAY")
    
    if TYPING_SPEED_MIN >= TYPING_SPEED_MAX:
        errors.append("TYPING_SPEED_MIN должен быть меньше TYPING_SPEED_MAX")
    
    return errors

def get_random_user_agent():
    """Получение случайного User-Agent"""
    return random.choice(USER_AGENTS)

def get_random_proxy():
    """Получение случайного прокси из списка"""
    if USE_PROXY_ROTATION and PROXY_LIST:
        return random.choice(PROXY_LIST)
    return None

def get_platform_config(platform):
    """Получение конфигурации платформы"""
    return PLATFORM_CONFIGS.get(platform.lower(), {})

def is_multilogin_enabled():
    """Проверка включения Multilogin"""
    return ENABLE_MULTILOGIN and bool(MULTILOGIN_TOKEN)
