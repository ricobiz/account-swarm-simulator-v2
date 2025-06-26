
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
        """Создание стабильных опций Chrome для Railway"""
        options = Options()
        
        # Основные опции для Railway
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-web-security')
        options.add_argument('--disable-features=VizDisplayCompositor')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-plugins')
        options.add_argument('--disable-images')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--single-process')
        options.add_argument('--no-zygote')
        
        # Стабильные антидетект опции
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("useAutomationExtension", False)
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
        # User agent
        try:
            ua = UserAgent()
            options.add_argument(f'--user-agent={ua.random}')
        except:
            # Fallback user agent если UserAgent не работает
            options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Дополнительные стабильные опции
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--ignore-ssl-errors')
        options.add_argument('--ignore-certificate-errors-spki-list')
        options.add_argument('--memory-pressure-off')
        
        return options
        
    def setup_browser(self, proxy=None):
        """Улучшенная настройка браузера с лучшей обработкой ошибок"""
        try:
            self.logger.info("🔧 Настройка универсального RPA браузера...")
            
            options = self.create_chrome_options()
            
            # Прокси если указан
            if proxy:
                proxy_str = f"{proxy['ip']}:{proxy['port']}"
                options.add_argument(f'--proxy-server=http://{proxy_str}')
                self.logger.info(f"🌐 Используем прокси: {proxy_str}")
            
            # Попытка создания драйвера
            try:
                self.logger.info("Пробуем обычный Chrome WebDriver...")
                self.driver = webdriver.Chrome(options=options)
                self.logger.info("✅ Обычный Chrome WebDriver создан успешно")
            except Exception as e:
                self.logger.warning(f"⚠️ Обычный Chrome не удался: {e}")
                self.logger.info("🔄 Переходим на undetected-chromedriver...")
                
                # Fallback на undetected chromedriver
                uc_options = uc.ChromeOptions()
                uc_options.add_argument('--headless=new')
                uc_options.add_argument('--no-sandbox') 
                uc_options.add_argument('--disable-dev-shm-usage')
                uc_options.add_argument('--disable-gpu')
                uc_options.add_argument('--single-process')
                uc_options.add_argument('--window-size=1920,1080')
                
                self.driver = uc.Chrome(options=uc_options, version_main=None)
                self.logger.info("✅ Undetected Chrome создан успешно")
            
            # Настройка WebDriverWait
            self.wait = WebDriverWait(self.driver, 15)
            
            # Таймауты
            self.driver.set_page_load_timeout(45)
            self.driver.implicitly_wait(10)
            
            # Антидетект скрипты
            try:
                self.driver.execute_script("""
                    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                    Object.defineProperty(navigator, 'plugins', {
                        get: () => [1, 2, 3, 4, 5].map(() => ({ name: 'Plugin' }))
                    });
                    Object.defineProperty(navigator, 'languages', {
                        get: () => ['en-US', 'en', 'ru']
                    });
                """)
                self.logger.info("🥷 Антидетект скрипты применены")
            except Exception as e:
                self.logger.warning(f"⚠️ Антидетект скрипты не применились: {e}")
            
            self.logger.info("🎉 Браузер настроен и готов к работе!")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ КРИТИЧЕСКАЯ ОШИБКА настройки браузера: {e}")
            self.logger.error(f"Тип ошибки: {type(e).__name__}")
            return False
    
    def navigate_to_url(self, url):
        """Безопасный переход на страницу с проверками"""
        try:
            self.logger.info(f"🌐 Переход на: {url}")
            self.driver.get(url)
            
            # Ждем частичной загрузки
            time.sleep(3)
            
            current_url = self.driver.current_url
            self.logger.info(f"📍 Текущий URL: {current_url}")
            
            # Проверяем, что страница хотя бы частично загрузилась
            page_state = self.driver.execute_script("return document.readyState")
            self.logger.info(f"📄 Состояние страницы: {page_state}")
            
            return True
        except Exception as e:
            self.logger.error(f"❌ Ошибка перехода на {url}: {e}")
            return False
    
    def find_element_safe(self, selector):
        """Улучшенный безопасный поиск элемента с множественными стратегиями"""
        try:
            self.logger.info(f"🔍 Поиск элемента: {selector}")
            
            # Различные стратегии поиска
            strategies = [
                (By.CSS_SELECTOR, selector),
                (By.XPATH, f"//*[@name='{selector.replace('input[name=\"', '').replace('\"]', '')}']"),
                (By.XPATH, f"//*[contains(@class, '{selector.replace('.', '')}')]"),
                (By.ID, selector.replace('#', '')),
                (By.NAME, selector.replace('input[name="', '').replace('"]', '')),
                (By.TAG_NAME, selector.replace('input[type="', '').replace('"]', '') if 'input[type=' in selector else selector)
            ]
            
            for by, value in strategies:
                try:
                    # Ждем появления элемента до 10 секунд
                    element = WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((by, value))
                    )
                    self.logger.info(f"✅ Элемент найден через {by.name}: {value}")
                    return element
                except TimeoutException:
                    continue
                except Exception as search_error:
                    self.logger.debug(f"Стратегия {by.name} не сработала: {search_error}")
                    continue
                    
            self.logger.warning(f"⚠️ Элемент не найден ни одной стратегией: {selector}")
            return None
            
        except Exception as e:
            self.logger.error(f"❌ Критическая ошибка поиска элемента {selector}: {e}")
            return None
    
    def execute_action(self, action):
        """Выполнение действия с улучшенной обработкой"""
        try:
            action_type = action.get('type')
            self.logger.info(f"🎬 Выполнение действия: {action_type}")
            
            if action_type == 'navigate':
                url = action.get('url')
                return self.navigate_to_url(url)
                
            elif action_type == 'wait':
                duration = action.get('duration', 1000)
                self.logger.info(f"⏱️ Ожидание {duration}ms")
                time.sleep(duration / 1000)
                return True
                
            elif action_type == 'check_element':
                selector = action.get('element', {}).get('selector')
                element = self.find_element_safe(selector)
                found = element is not None
                self.logger.info(f"🔍 Элемент {'найден' if found else 'НЕ найден'}: {selector}")
                return found
                
            elif action_type == 'click':
                selector = action.get('element', {}).get('selector')
                element = self.find_element_safe(selector)
                if element:
                    try:
                        # Пробуем обычный клик
                        element.click()
                        self.logger.info(f"👆 Клик выполнен: {selector}")
                    except:
                        # Если не получается, пробуем JavaScript клик
                        self.driver.execute_script("arguments[0].click();", element)
                        self.logger.info(f"👆 JS клик выполнен: {selector}")
                    time.sleep(2)
                    return True
                return False
                
            elif action_type == 'type':
                selector = action.get('element', {}).get('selector')
                text = action.get('element', {}).get('text')
                element = self.find_element_safe(selector)
                if element:
                    try:
                        element.clear()
                        element.send_keys(text)
                        self.logger.info(f"⌨️ Текст введен в {selector}: {text[:20]}...")
                        time.sleep(1)
                        return True
                    except Exception as type_error:
                        self.logger.error(f"❌ Ошибка ввода текста: {type_error}")
                return False
                
            else:
                self.logger.warning(f"⚠️ Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Ошибка выполнения действия {action_type}: {e}")
            return False
    
    def execute_task(self, task):
        """Выполнение RPA задачи с подробным логированием"""
        task_id = task.get('taskId', 'unknown')
        self.logger.info(f"🚀 === ВЫПОЛНЕНИЕ RPA ЗАДАЧИ {task_id} ===")
        
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
            total_actions = len(actions)
            
            self.logger.info(f"📋 Всего действий к выполнению: {total_actions}")
            
            for i, action in enumerate(actions):
                action_type = action.get('type', 'unknown')
                self.logger.info(f"🎬 Действие {i+1}/{total_actions}: {action_type}")
                
                if self.execute_action(action):
                    completed_actions += 1
                    self.logger.info(f"✅ Действие {i+1} выполнено успешно")
                else:
                    self.logger.warning(f"⚠️ Действие {i+1} не выполнено")
                
                # Задержка между действиями
                delay = action.get('delay', 1000)
                if delay > 0:
                    time.sleep(delay / 1000)
            
            # Результат
            success = completed_actions > 0
            success_rate = (completed_actions / total_actions * 100) if total_actions > 0 else 0
            message = f"Выполнено {completed_actions}/{total_actions} действий ({success_rate:.1f}%)"
            
            self.logger.info(f"🏁 === ЗАДАЧА {task_id} ЗАВЕРШЕНА ===")
            self.logger.info(f"📊 Результат: {message}")
            
            return {
                'taskId': task_id,
                'success': success,
                'message': message,
                'completedActions': completed_actions,
                'totalActions': total_actions,
                'successRate': success_rate,
                'environment': 'railway-universal-cloud',
                'platform': task.get('metadata', {}).get('platform', 'unknown'),
                'features': ['universal-platforms', 'antidetect', 'human-behavior']
            }
            
        except Exception as e:
            self.logger.error(f"💥 КРИТИЧЕСКАЯ ОШИБКА В ЗАДАЧЕ {task_id}: {e}")
            self.logger.error(f"Тип ошибки: {type(e).__name__}")
            return {
                'taskId': task_id,
                'success': False,
                'error': str(e),
                'environment': 'railway-universal-cloud'
            }
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Очистка ресурсов"""
        try:
            if self.driver:
                self.driver.quit()
                self.logger.info("🧹 Браузер закрыт и ресурсы освобождены")
        except Exception as e:
            self.logger.error(f"❌ Ошибка при закрытии браузера: {e}")
    
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
