
#!/usr/bin/env python3
"""
Расширенный браузер-менеджер с антидетектом для всех платформ
"""

import os
import json
import random
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
import undetected_chromedriver as uc

logger = logging.getLogger(__name__)

class AdvancedBrowserManager:
    def __init__(self, config=None):
        self.config = config or {}
        self.driver = None
        self.wait = None
        
        # Расширенный список User Agents для разных платформ
        self.user_agents = {
            'windows': [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36'
            ],
            'mac': [
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
            ],
            'linux': [
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
            ]
        }
        
        # Настройки браузера для разных платформ
        self.platform_configs = {
            'instagram': {
                'viewport': [(1920, 1080), (1366, 768), (1440, 900)],
                'mobile_chance': 0.3,
                'user_agent_os': ['windows', 'mac', 'linux']
            },
            'youtube': {
                'viewport': [(1920, 1080), (1366, 768), (1536, 864)],
                'mobile_chance': 0.2,
                'user_agent_os': ['windows', 'mac']
            },
            'tiktok': {
                'viewport': [(1920, 1080), (1366, 768)],
                'mobile_chance': 0.6,
                'user_agent_os': ['windows', 'mac', 'linux']
            },
            'twitter': {
                'viewport': [(1920, 1080), (1366, 768), (1440, 900)],
                'mobile_chance': 0.4,
                'user_agent_os': ['windows', 'mac']
            }
        }
    
    def create_browser(self, platform='universal', proxy=None):
        """Создание браузера с антидетектом под конкретную платформу"""
        try:
            options = self._get_chrome_options(platform, proxy)
            
            # Используем undetected-chromedriver для лучшей скрытности
            self.driver = uc.Chrome(
                options=options,
                version_main=None,  # Автоопределение версии
                driver_executable_path=None
            )
            
            # Настройка окна и viewport
            self._setup_viewport(platform)
            
            # Инъекция антидетект скриптов
            self._inject_stealth_scripts()
            
            # Настройка WebDriverWait
            self.wait = WebDriverWait(self.driver, 15)
            
            logger.info(f"Браузер создан для платформы: {platform}")
            return self.driver, self.wait
            
        except Exception as e:
            logger.error(f"Ошибка создания браузера: {e}")
            raise
    
    def _get_chrome_options(self, platform, proxy=None):
        """Получение настроек Chrome с антидетектом"""
        options = Options()
        
        # Базовые антидетект настройки
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Отключение уведомлений и попапов
        prefs = {
            "profile.default_content_setting_values": {
                "notifications": 2,
                "geolocation": 2,
                "media_stream": 2,
                "camera": 2,
                "microphone": 2
            },
            "profile.managed_default_content_settings": {
                "images": 1  # Загружаем картинки для лучшей имитации
            }
        }
        options.add_experimental_option("prefs", prefs)
        
        # User Agent для платформы
        user_agent = self._get_platform_user_agent(platform)
        options.add_argument(f'--user-agent={user_agent}')
        
        # Прокси если указан
        if proxy:
            options.add_argument(f'--proxy-server={proxy}')
        
        # Языковые настройки (случайные)
        languages = ['en-US,en', 'ru-RU,ru', 'de-DE,de', 'fr-FR,fr']
        options.add_argument(f'--accept-lang={random.choice(languages)}')
        
        # Настройки для облачного окружения
        if os.getenv('RAILWAY_ENVIRONMENT'):
            options.add_argument('--headless=new')
            options.add_argument('--disable-gpu')
            options.add_argument('--remote-debugging-port=9222')
        else:
            # В локальной разработке можем показывать окно браузера
            if self.config.get('headless', True):
                options.add_argument('--headless=new')
        
        return options
    
    def _get_platform_user_agent(self, platform):
        """Получение User Agent для конкретной платформы"""
        platform_config = self.platform_configs.get(platform, {})
        allowed_os = platform_config.get('user_agent_os', ['windows', 'mac', 'linux'])
        
        # Выбираем случайную ОС из разрешенных
        os_choice = random.choice(allowed_os)
        available_agents = self.user_agents.get(os_choice, self.user_agents['windows'])
        
        return random.choice(available_agents)
    
    def _setup_viewport(self, platform):
        """Настройка размера окна под платформу"""
        platform_config = self.platform_configs.get(platform, {})
        viewports = platform_config.get('viewport', [(1920, 1080), (1366, 768)])
        mobile_chance = platform_config.get('mobile_chance', 0.3)
        
        # Иногда используем мобильный размер
        if random.random() < mobile_chance:
            width, height = random.choice([(375, 667), (414, 896), (360, 640)])
        else:
            width, height = random.choice(viewports)
        
        self.driver.set_window_size(width, height)
        
        # Случайная позиция окна (если не headless)
        if not os.getenv('RAILWAY_ENVIRONMENT'):
            x = random.randint(0, 100)
            y = random.randint(0, 100)
            self.driver.set_window_position(x, y)
    
    def _inject_stealth_scripts(self):
        """Инъекция скриптов для скрытия автоматизации"""
        stealth_scripts = [
            # Скрываем webdriver
            """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            """,
            
            # Скрываем automation
            """
            window.chrome = {
                runtime: {},
            };
            """,
            
            # Модифицируем navigator.permissions
            """
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
            );
            """,
            
            # Модифицируем navigator.plugins
            """
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            """,
            
            # Добавляем случайный noise в canvas
            """
            const getContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type) {
                if (type === '2d') {
                    const context = getContext.call(this, type);
                    const originalFillText = context.fillText;
                    context.fillText = function(text, x, y, maxWidth) {
                        const noise = Math.random() * 0.1;
                        return originalFillText.call(this, text, x + noise, y + noise, maxWidth);
                    };
                    return context;
                }
                return getContext.call(this, type);
            };
            """
        ]
        
        for script in stealth_scripts:
            try:
                self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                    'source': script
                })
            except:
                # Если CDP недоступен, используем обычный execute_script
                try:
                    self.driver.execute_script(script)
                except:
                    pass
    
    def rotate_identity(self, platform='universal'):
        """Смена идентичности браузера"""
        try:
            # Очищаем cookies
            self.driver.delete_all_cookies()
            
            # Меняем User Agent через CDP
            new_user_agent = self._get_platform_user_agent(platform)
            self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                "userAgent": new_user_agent
            })
            
            # Меняем viewport
            self._setup_viewport(platform)
            
            logger.info("Идентичность браузера изменена")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка смены идентичности: {e}")
            return False
    
    def close_browser(self):
        """Закрытие браузера"""
        try:
            if self.driver:
                self.driver.quit()
                self.driver = None
                self.wait = None
            logger.info("Браузер закрыт")
        except Exception as e:
            logger.error(f"Ошибка закрытия браузера: {e}")
    
    def get_browser_fingerprint(self):
        """Получение отпечатка браузера"""
        try:
            fingerprint = self.driver.execute_script("""
                return {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform,
                    cookieEnabled: navigator.cookieEnabled,
                    screenWidth: screen.width,
                    screenHeight: screen.height,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    webdriver: navigator.webdriver
                };
            """)
            return fingerprint
        except:
            return None
