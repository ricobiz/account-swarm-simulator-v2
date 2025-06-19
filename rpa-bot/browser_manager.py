
#!/usr/bin/env python3
"""
Менеджер браузера для облачного RPA бота
"""

import logging
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import WebDriverException

logger = logging.getLogger(__name__)

class CloudBrowserManager:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.chrome_options = None
        
    def setup_browser(self, headless=True, proxy=None):
        """Настройка Chrome браузера для облачной среды"""
        try:
            logger.info("Настройка Chrome браузера для облака...")
            
            # Опции Chrome для облачной среды
            self.chrome_options = Options()
            
            # Основные облачные опции
            self.chrome_options.add_argument('--headless=new')
            self.chrome_options.add_argument('--no-sandbox')
            self.chrome_options.add_argument('--disable-dev-shm-usage')
            self.chrome_options.add_argument('--disable-gpu')
            self.chrome_options.add_argument('--disable-web-security')
            self.chrome_options.add_argument('--disable-features=VizDisplayCompositor')
            self.chrome_options.add_argument('--disable-extensions')
            self.chrome_options.add_argument('--disable-plugins')
            self.chrome_options.add_argument('--disable-images')
            self.chrome_options.add_argument('--window-size=1920,1080')
            self.chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            
            # Оптимизации памяти
            self.chrome_options.add_argument('--memory-pressure-off')
            self.chrome_options.add_argument('--max_old_space_size=4096')
            
            # Конфигурация прокси
            if proxy:
                proxy_arg = f"--proxy-server={proxy}"
                self.chrome_options.add_argument(proxy_arg)
                logger.info(f"Использование прокси: {proxy}")
            
            # Дополнительные настройки
            prefs = {
                "profile.default_content_setting_values": {
                    "notifications": 2,
                    "media_stream": 2,
                },
                "profile.managed_default_content_settings": {
                    "images": 2
                }
            }
            self.chrome_options.add_experimental_option("prefs", prefs)
            
            # Попытка создания драйвера
            try:
                self.driver = webdriver.Chrome(options=self.chrome_options)
            except Exception as e:
                logger.warning(f"Не удалось создать Chrome драйвер: {e}")
                # Запасной вариант с сервисом
                service = Service('/usr/local/bin/chromedriver')
                self.driver = webdriver.Chrome(service=service, options=self.chrome_options)
            
            # Установка таймаутов
            self.driver.implicitly_wait(10)
            self.driver.set_page_load_timeout(30)
            
            # Создание объекта ожидания
            self.wait = WebDriverWait(self.driver, 10)
            
            logger.info("Настройка браузера завершена успешно")
            return True
            
        except Exception as e:
            logger.error(f"Настройка браузера не удалась: {e}")
            return False
    
    def close(self):
        """Закрытие браузера и очистка"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Браузер закрыт успешно")
            except Exception as e:
                logger.warning(f"Ошибка закрытия браузера: {e}")
