
#!/usr/bin/env python3
"""
Антидетект браузер для имитации живого пользователя
"""

import random
import time
import logging
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import WebDriverException
import undetected_chromedriver as uc

logger = logging.getLogger(__name__)

class AntiDetectBrowser:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    
    def setup_browser(self, headless: bool = False, proxy: str = None) -> bool:
        """Настройка антидетект браузера"""
        try:
            logger.info("Настройка антидетект браузера...")
            
            # Используем undetected-chromedriver
            options = uc.ChromeOptions()
            
            # Антидетект настройки
            if headless:
                options.add_argument('--headless=new')
            else:
                # Реальное окно с случайными размерами
                width = random.randint(1200, 1920)
                height = random.randint(800, 1080)
                options.add_argument(f'--window-size={width},{height}')
            
            # Основные антидетект флаги
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            # Случайный User-Agent
            user_agent = random.choice(self.user_agents)
            options.add_argument(f'--user-agent={user_agent}')
            
            # Дополнительные антидетект настройки
            options.add_argument('--disable-web-security')
            options.add_argument('--allow-running-insecure-content')
            options.add_argument('--disable-extensions')
            options.add_argument('--disable-plugins')
            options.add_argument('--disable-images')  # Ускорение загрузки
            options.add_argument('--disable-javascript')  # Отключаем для начала
            
            # Настройки прокси
            if proxy:
                options.add_argument(f'--proxy-server={proxy}')
                logger.info(f"Использование прокси: {proxy}")
            
            # Настройки производительности
            options.add_argument('--memory-pressure-off')
            options.add_argument('--max_old_space_size=4096')
            
            # Прefs для дополнительной маскировки
            prefs = {
                "profile.default_content_setting_values": {
                    "notifications": 2,
                    "media_stream": 2,
                },
                "profile.managed_default_content_settings": {
                    "images": 2
                },
                # Эмуляция настроек языка
                "intl.accept_languages": "en-US,en;q=0.9,ru;q=0.8",
                # Отключение автозаполнения
                "profile.password_manager_enabled": False,
                "credentials_enable_service": False,
            }
            options.add_experimental_option("prefs", prefs)
            
            # Создание драйвера
            try:
                self.driver = uc.Chrome(options=options, version_main=None)
            except Exception as e:
                logger.warning(f"Ошибка создания uc.Chrome: {e}")
                # Fallback на обычный Chrome
                service = Service()
                self.driver = webdriver.Chrome(service=service, options=options)
            
            # Дополнительные антидетект меры
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                "userAgent": user_agent,
                "acceptLanguage": "en-US,en;q=0.9",
                "platform": "Win32"
            })
            
            # Настройка таймаутов
            self.driver.implicitly_wait(10)
            self.driver.set_page_load_timeout(30)
            self.wait = WebDriverWait(self.driver, 15)
            
            # Имитация человеческого поведения при запуске
            self.human_startup_behavior()
            
            logger.info("Антидетект браузер настроен успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки антидетект браузера: {e}")
            return False
    
    def human_startup_behavior(self):
        """Имитация человеческого поведения при запуске"""
        try:
            # Переход на нейтральную страницу
            self.driver.get("https://www.google.com")
            self.random_delay(2000, 4000)
            
            # Случайные движения мыши
            self.random_mouse_movements()
            
            # Имитация чтения страницы
            self.random_delay(1000, 3000)
            
        except Exception as e:
            logger.warning(f"Ошибка имитации стартового поведения: {e}")
    
    def human_navigate(self, url: str):
        """Человекоподобная навигация"""
        try:
            logger.info(f"Переход к: {url}")
            
            # Предварительная задержка
            self.random_delay(1000, 3000)
            
            # Переход на страницу
            self.driver.get(url)
            
            # Имитация загрузки страницы
            self.random_delay(2000, 5000)
            
            # Случайный скролл для имитации чтения
            self.human_page_scan()
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка навигации: {e}")
            return False
    
    def human_click(self, coordinates: dict):
        """Человекоподобный клик по координатам"""
        try:
            x, y = coordinates['x'], coordinates['y']
            
            # Движение мыши к цели с небольшой случайностью
            offset_x = random.randint(-5, 5)
            offset_y = random.randint(-5, 5)
            target_x = x + offset_x
            target_y = y + offset_y
            
            # Плавное движение мыши
            action = ActionChains(self.driver)
            action.move_by_offset(target_x, target_y)
            
            # Случайная задержка перед кликом
            self.random_delay(200, 800)
            
            # Клик
            action.click()
            action.perform()
            
            # Задержка после клика
            self.random_delay(500, 1500)
            
            logger.info(f"Клик выполнен по координатам: ({target_x}, {target_y})")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка клика: {e}")
            return False
    
    def human_page_scan(self):
        """Имитация сканирования страницы человеком"""
        try:
            # Случайный скролл вниз
            scroll_amount = random.randint(100, 400)
            self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
            self.random_delay(800, 2000)
            
            # Иногда скролл обратно
            if random.random() < 0.3:
                scroll_back = random.randint(50, scroll_amount//2)
                self.driver.execute_script(f"window.scrollBy(0, -{scroll_back});")
                self.random_delay(500, 1500)
            
            # Случайные движения мыши
            self.random_mouse_movements()
            
        except Exception as e:
            logger.warning(f"Ошибка сканирования страницы: {e}")
    
    def random_mouse_movements(self):
        """Случайные движения мыши"""
        try:
            action = ActionChains(self.driver)
            
            # 3-5 случайных движений
            movements = random.randint(3, 5)
            for _ in range(movements):
                x_offset = random.randint(-200, 200)
                y_offset = random.randint(-100, 100)
                action.move_by_offset(x_offset, y_offset)
                
            action.perform()
            self.random_delay(300, 800)
            
        except Exception as e:
            logger.warning(f"Ошибка движений мыши: {e}")
    
    def random_delay(self, min_ms: int = 100, max_ms: int = 1000):
        """Случайная задержка"""
        delay = random.uniform(min_ms/1000, max_ms/1000)
        time.sleep(delay)
    
    def take_screenshot(self, path: str) -> bool:
        """Создание скриншота"""
        try:
            self.driver.save_screenshot(path)
            return True
        except Exception as e:
            logger.error(f"Ошибка создания скриншота: {e}")
            return False
    
    def close(self):
        """Закрытие браузера"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Антидетект браузер закрыт")
            except Exception as e:
                logger.warning(f"Ошибка закрытия браузера: {e}")
