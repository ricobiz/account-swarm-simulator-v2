
#!/usr/bin/env python3
"""
Конфигурация для продвинутого RPA бота
"""

import os

# Основные настройки
BOT_VERSION = "3.0.0-advanced"
ENVIRONMENT = "railway-cloud"

# API ключи
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://izmgzstdgoswlozinmyk.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# Vision API настройки
VISION_MODEL = os.getenv('VISION_MODEL', 'openai/gpt-4o')  # gpt-4o, anthropic/claude-3-5-sonnet, google/gemini-pro-vision
VISION_CACHE_TTL = int(os.getenv('VISION_CACHE_TTL', '86400'))  # 24 часа в секундах
VISION_CACHE_DB = os.getenv('VISION_CACHE_DB', 'vision_cache.db')

# Антидетект настройки
HEADLESS_MODE = os.getenv('HEADLESS_MODE', 'false').lower() == 'true'
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

# Проверка критичных настроек
def validate_config():
    """Проверка критичных настроек"""
    errors = []
    
    if not OPENROUTER_API_KEY:
        errors.append("OPENROUTER_API_KEY не установлен")
    
    if not SUPABASE_URL:
        errors.append("SUPABASE_URL не установлен")
    
    if VISION_CACHE_TTL < 0:
        errors.append("VISION_CACHE_TTL должен быть положительным")
    
    if MIN_ACTION_DELAY >= MAX_ACTION_DELAY:
        errors.append("MIN_ACTION_DELAY должен быть меньше MAX_ACTION_DELAY")
    
    return errors

# Получение случайного User-Agent
def get_random_user_agent():
    """Получение случайного User-Agent"""
    import random
    return random.choice(USER_AGENTS)

# Получение случайного прокси
def get_random_proxy():
    """Получение случайного прокси из списка"""
    if USE_PROXY_ROTATION and PROXY_LIST:
        import random
        return random.choice(PROXY_LIST)
    return None
