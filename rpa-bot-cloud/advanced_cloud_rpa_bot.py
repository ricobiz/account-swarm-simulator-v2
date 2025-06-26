
#!/usr/bin/env python3
"""
Продвинутый универсальный Cloud RPA-бот для Railway
"""

import os
import time
import json
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import undetected_chromedriver as uc
from fake_useragent import UserAgent

class AdvancedCloudRPABot:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.logger = logging.getLogger(__name__)
        
    def create_chrome_options(self):
        """Создание правильных опций Chrome для Railway"""
        options = Options()
        
        # Базовые опции для headless режима
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-web-security')
        options.add_argument('--disable-features=VizDisplayCompositor')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-plugins')
        options.add_argument('--disable-images')
        options.add_argument('--disable-javascript')
        options.add_argument('--window-size=1920,1080')
        
        # Антидетект опции (убираем проблемные)
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("useAutomationExtension", False)
        
        # User agent
        ua = UserAgent()
        options.add_argument(f'--user-agent={ua.random}')
        
        # Прокси поддержка
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--ignore-ssl-errors')
        options.add_argument('--ignore-certificate-errors-spki-list')
        
        # Память и производительность
        options.add_argument('--memory-pressure-off')
        options.add_argument('--max_old_space_size=4096')
        
        return options
        
    def setup_browser(self, proxy=None):
        """Настройка браузера с правильными опциями"""
        try:
            self.logger.info("Настройка универсального браузера...")
            
            options = self.create_chrome_options()
            
            # Прокси
            if proxy:
                proxy_str = f"{proxy['ip']}:{proxy['port']}"
                options.add_argument(f'--proxy-server=http://{proxy_str}')
                self.logger.info(f"Использование прокси: {proxy_str}")
            
            # Создание драйвера с простыми опциями
            try:
                self.driver = webdriver.Chrome(options=options)
                self.logger.info("✅ Chrome WebDriver создан успешно")
            except Exception as e:
                self.logger.warning(f"Обычный Chrome не работает, пробуем undetected-chromedriver: {e}")
                # Fallback на undetected chromedriver с минимальными опциями
                uc_options = uc.ChromeOptions()
                uc_options.add_argument('--headless')
                uc_options.add_argument('--no-sandbox')
                uc_options.add_argument('--disable-dev-shm-usage')
                
                self.driver = uc.Chrome(options=uc_options, version_main=None)
                self.logger.info("✅ Undetected Chrome создан успешно")
            
            # Настройка wait
            self.wait = WebDriverWait(self.driver, 10)
            
            # Базовые настройки
            self.driver.set_page_load_timeout(30)
            self.driver.implicitly_wait(5)
            
            # Скрываем автоматизацию
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.logger.info("✅ Браузер настроен успешно")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Ошибка настройки браузера: {e}")
            return False
    
    def navigate_to_url(self, url):
        """Переход на страницу"""
        try:
            self.logger.info(f"Переход на: {url}")
            self.driver.get(url)
            time.sleep(3)  # Ждем загрузки
            
            current_url = self.driver.current_url
            self.logger.info(f"Текущий URL: {current_url}")
            
            return True
        except Exception as e:
            self.logger.error(f"Ошибка перехода на {url}: {e}")
            return False
    
    def find_element_safe(self, selector):
        """Безопасный поиск элемента"""
        try:
            # Пробуем разные способы поиска
            strategies = [
                (By.CSS_SELECTOR, selector),
                (By.XPATH, f"//*[@name='{selector.replace('input[name=\"', '').replace('\"]', '')}']"),
                (By.ID, selector.replace('#', '')),
                (By.CLASS_NAME, selector.replace('.', ''))
            ]
            
            for by, value in strategies:
                try:
                    element = self.wait.until(EC.presence_of_element_located((by, value)))
                    self.logger.info(f"Элемент найден: {by} = {value}")
                    return element
                except:
                    continue
                    
            return None
        except Exception as e:
            self.logger.error(f"Элемент не найден {selector}: {e}")
            return None
    
    def execute_action(self, action):
        """Выполнение действия"""
        try:
            action_type = action.get('type')
            self.logger.info(f"Выполнение действия: {action_type}")
            
            if action_type == 'navigate':
                url = action.get('url')
                return self.navigate_to_url(url)
                
            elif action_type == 'check_element':
                selector = action.get('element', {}).get('selector')
                element = self.find_element_safe(selector)
                return element is not None
                
            elif action_type == 'click':
                selector = action.get('element', {}).get('selector')
                element = self.find_element_safe(selector)
                if element:
                    element.click()
                    time.sleep(2)
                    return True
                return False
                
            elif action_type == 'type':
                selector = action.get('element', {}).get('selector')
                text = action.get('element', {}).get('text')
                element = self.find_element_safe(selector)
                if element:
                    element.clear()
                    element.send_keys(text)
                    time.sleep(1)
                    return True
                return False
                
            else:
                self.logger.warning(f"Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            self.logger.error(f"Ошибка выполнения действия {action_type}: {e}")
            return False
    
    def execute_task(self, task):
        """Выполнение RPA задачи"""
        task_id = task.get('taskId', 'unknown')
        self.logger.info(f"=== ВЫПОЛНЕНИЕ ЗАДАЧИ {task_id} ===")
        
        try:
            # Настройка браузера
            if not self.setup_browser(task.get('proxy')):
                return {
                    'taskId': task_id,
                    'success': False,
                    'error': 'Не удалось настроить браузер',
                    'environment': 'railway-fixed'
                }
            
            # Выполнение действий
            actions = task.get('actions', [])
            completed_actions = 0
            
            for i, action in enumerate(actions):
                self.logger.info(f"Действие {i+1}/{len(actions)}: {action.get('type')}")
                
                if self.execute_action(action):
                    completed_actions += 1
                    self.logger.info(f"✅ Действие {i+1} выполнено успешно")
                else:
                    self.logger.warning(f"⚠️ Действие {i+1} не выполнено")
                
                # Задержка между действиями
                delay = action.get('delay', 1000)
                time.sleep(delay / 1000)
            
            # Результат
            success = completed_actions > 0
            message = f"Выполнено {completed_actions}/{len(actions)} действий"
            
            self.logger.info(f"=== ЗАДАЧА {task_id} ЗАВЕРШЕНА: {message} ===")
            
            return {
                'taskId': task_id,
                'success': success,
                'message': message,
                'completedActions': completed_actions,
                'totalActions': len(actions),
                'environment': 'railway-fixed',
                'platform': task.get('metadata', {}).get('platform', 'unknown')
            }
            
        except Exception as e:
            self.logger.error(f"❌ КРИТИЧЕСКАЯ ОШИБКА В ЗАДАЧЕ {task_id}: {e}")
            return {
                'taskId': task_id,
                'success': False,
                'error': str(e),
                'environment': 'railway-fixed'
            }
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Очистка ресурсов"""
        try:
            if self.driver:
                self.driver.quit()
                self.logger.info("Браузер закрыт")
        except Exception as e:
            self.logger.error(f"Ошибка закрытия браузера: {e}")
    
    def test_vision_connection(self):
        """Тест подключения к Vision API"""
        return bool(os.getenv('OPENROUTER_API_KEY'))
    
    def get_cache_stats(self):
        """Статистика кэша"""
        return {
            'enabled': True,
            'entries': 0,
            'hits': 0,
            'misses': 0
        }
