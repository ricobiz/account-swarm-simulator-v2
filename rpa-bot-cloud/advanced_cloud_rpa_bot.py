
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
        """Создание максимально стабильных опций Chrome для Railway"""
        options = Options()
        
        # Основные опции для контейнерной среды
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
        options.add_argument('--disable-background-timer-throttling')
        options.add_argument('--disable-backgrounding-occluded-windows')
        options.add_argument('--disable-renderer-backgrounding')
        
        # Улучшенные антидетект опции
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("useAutomationExtension", False)
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
        # Настройки памяти для Railway
        options.add_argument('--memory-pressure-off')
        options.add_argument('--max_old_space_size=4096')
        options.add_argument('--disable-background-networking')
        
        # User agent
        try:
            ua = UserAgent()
            user_agent = ua.random
            self.logger.info(f"Используем User-Agent: {user_agent}")
            options.add_argument(f'--user-agent={user_agent}')
        except Exception as e:
            self.logger.warning(f"Не удалось получить случайный User-Agent: {e}")
            options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Дополнительные стабильные опции
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--ignore-ssl-errors')
        options.add_argument('--ignore-certificate-errors-spki-list')
        options.add_argument('--disable-logging')
        options.add_argument('--disable-default-apps')
        options.add_argument('--disable-sync')
        
        return options
        
    def setup_browser(self, proxy=None):
        """Улучшенная настройка браузера с множественными fallback стратегиями"""
        try:
            self.logger.info("🔧 === НАЧАЛО НАСТРОЙКИ УНИВЕРСАЛЬНОГО RPA БРАУЗЕРА ===")
            
            options = self.create_chrome_options()
            
            # Прокси если указан
            if proxy:
                proxy_str = f"{proxy['ip']}:{proxy['port']}"
                options.add_argument(f'--proxy-server=http://{proxy_str}')
                self.logger.info(f"🌐 Используем прокси: {proxy_str}")
            
            # Стратегия 1: Обычный Chrome WebDriver
            try:
                self.logger.info("📍 Попытка 1: Обычный Chrome WebDriver...")
                
                # Проверяем переменные окружения
                chrome_bin = os.environ.get('GOOGLE_CHROME_BIN')
                if chrome_bin:
                    options.binary_location = chrome_bin
                    self.logger.info(f"🔍 Найден Chrome Binary: {chrome_bin}")
                
                chromedriver_path = os.environ.get('CHROMEDRIVER_PATH')
                if chromedriver_path:
                    self.driver = webdriver.Chrome(executable_path=chromedriver_path, options=options)
                    self.logger.info(f"✅ Chrome с кастомным драйвером: {chromedriver_path}")
                else:
                    self.driver = webdriver.Chrome(options=options)
                    self.logger.info("✅ Chrome с системным драйвером")
                    
            except Exception as e1:
                self.logger.warning(f"⚠️ Обычный Chrome не удался: {e1}")
                
                # Стратегия 2: Undetected Chrome
                try:
                    self.logger.info("📍 Попытка 2: Undetected Chrome...")
                    
                    uc_options = uc.ChromeOptions()
                    uc_options.add_argument('--headless=new')
                    uc_options.add_argument('--no-sandbox') 
                    uc_options.add_argument('--disable-dev-shm-usage')
                    uc_options.add_argument('--disable-gpu')
                    uc_options.add_argument('--single-process')
                    uc_options.add_argument('--window-size=1920,1080')
                    uc_options.add_argument('--disable-blink-features=AutomationControlled')
                    
                    if proxy:
                        uc_options.add_argument(f'--proxy-server=http://{proxy_str}')
                    
                    self.driver = uc.Chrome(options=uc_options, version_main=None)
                    self.logger.info("✅ Undetected Chrome создан успешно")
                    
                except Exception as e2:
                    self.logger.error(f"❌ Undetected Chrome тоже не удался: {e2}")
                    
                    # Стратегия 3: Минимальные опции
                    try:
                        self.logger.info("📍 Попытка 3: Минимальная конфигурация Chrome...")
                        
                        minimal_options = Options()
                        minimal_options.add_argument('--headless')
                        minimal_options.add_argument('--no-sandbox')
                        minimal_options.add_argument('--disable-dev-shm-usage')
                        
                        self.driver = webdriver.Chrome(options=minimal_options)
                        self.logger.info("✅ Минимальный Chrome создан")
                        
                    except Exception as e3:
                        self.logger.error(f"❌ Все стратегии создания Chrome провалились!")
                        self.logger.error(f"Ошибка 1 (обычный): {e1}")
                        self.logger.error(f"Ошибка 2 (undetected): {e2}")
                        self.logger.error(f"Ошибка 3 (минимальный): {e3}")
                        return False
            
            # Настройка WebDriverWait
            self.wait = WebDriverWait(self.driver, 15)
            
            # Таймауты
            self.driver.set_page_load_timeout(45)
            self.driver.implicitly_wait(10)
            
            # Применяем антидетект скрипты
            try:
                self.driver.execute_script("""
                    // Скрываем webdriver
                    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                    
                    // Модифицируем navigator
                    Object.defineProperty(navigator, 'plugins', {
                        get: () => [1, 2, 3, 4, 5].map((i) => ({ name: `Plugin ${i}` }))
                    });
                    
                    Object.defineProperty(navigator, 'languages', {
                        get: () => ['en-US', 'en', 'ru']
                    });
                    
                    // Убираем chrome.runtime
                    if (window.chrome) {
                        delete window.chrome.runtime;
                    }
                    
                    // Добавляем случайность в navigator.platform
                    Object.defineProperty(navigator, 'platform', {
                        get: () => 'Win32'
                    });
                """)
                self.logger.info("🥷 Антидетект скрипты успешно применены")
            except Exception as e:
                self.logger.warning(f"⚠️ Некоторые антидетект скрипты не применились: {e}")
            
            # Тестируем браузер
            try:
                self.logger.info("🧪 Тестируем браузер...")
                self.driver.get("data:text/html,<html><body><h1>RPA Bot Test</h1></body></html>")
                time.sleep(1)
                self.logger.info("✅ Браузер успешно протестирован")
            except Exception as e:
                self.logger.error(f"❌ Тест браузера провалился: {e}")
                return False
            
            self.logger.info("🎉 === БРАУЗЕР НАСТРОЕН И ГОТОВ К РАБОТЕ! ===")
            return True
            
        except Exception as e:
            self.logger.error(f"💥 КРИТИЧЕСКАЯ ОШИБКА настройки браузера: {e}")
            self.logger.error(f"Тип ошибки: {type(e).__name__}")
            return False
    
    def navigate_to_url(self, url):
        """Безопасный переход на страницу с улучшенными проверками"""
        try:
            self.logger.info(f"🌐 Переход на: {url}")
            
            # Проверяем, что браузер еще работает
            if not self.driver:
                self.logger.error("❌ Драйвер не инициализирован")
                return False
            
            self.driver.get(url)
            
            # Ждем частичной загрузки
            time.sleep(3)
            
            current_url = self.driver.current_url
            self.logger.info(f"📍 Текущий URL: {current_url}")
            
            # Проверяем состояние страницы
            try:
                page_state = self.driver.execute_script("return document.readyState")
                self.logger.info(f"📄 Состояние страницы: {page_state}")
                
                # Проверяем title
                title = self.driver.title or "Без заголовка"
                self.logger.info(f"📝 Заголовок страницы: {title[:50]}...")
                
            except Exception as e:
                self.logger.warning(f"⚠️ Не удалось получить информацию о странице: {e}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Ошибка перехода на {url}: {e}")
            return False
    
    def find_element_safe(self, selector):
        """Улучшенный поиск элемента с Google-специфичными селекторами"""
        try:
            self.logger.info(f"🔍 Поиск элемента: {selector}")
            
            # Специальные селекторы для Google/YouTube
            google_selectors = [
                'input[type="email"]',
                'input[id="identifierId"]',
                'input[name="identifier"]',
                'input[autocomplete="username"]',
                'input[aria-label*="email" i]',
                'input[placeholder*="email" i]'
            ]
            
            # Если это email селектор, пробуем специальные Google селекторы
            if 'email' in selector.lower() or 'identifierId' in selector:
                selectors_to_try = google_selectors + [selector]
            else:
                selectors_to_try = [selector]
            
            # Пробуем найти элемент разными способами
            for sel in selectors_to_try:
                try:
                    # CSS селектор
                    element = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, sel))
                    )
                    self.logger.info(f"✅ Элемент найден через CSS: {sel}")
                    return element
                except:
                    continue
            
            # Пробуем XPath селекторы
            xpath_selectors = [
                "//input[@type='email']",
                "//input[@id='identifierId']",
                "//input[contains(@placeholder, 'email')]",
                "//input[contains(@aria-label, 'email')]"
            ]
            
            for xpath in xpath_selectors:
                try:
                    element = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.XPATH, xpath))
                    )
                    self.logger.info(f"✅ Элемент найден через XPath: {xpath}")
                    return element
                except:
                    continue
                    
            self.logger.warning(f"⚠️ Элемент не найден: {selector}")
            return None
            
        except Exception as e:
            self.logger.error(f"❌ Критическая ошибка поиска элемента {selector}: {e}")
            return None
    
    def execute_action(self, action):
        """Выполнение действия с улучшенной обработкой"""
        try:
            action_type = action.get('type')
            self.logger.info(f"🎬 === ВЫПОЛНЕНИЕ ДЕЙСТВИЯ: {action_type} ===")
            
            if action_type == 'navigate':
                url = action.get('url')
                result = self.navigate_to_url(url)
                self.logger.info(f"🌐 Результат навигации: {'✅' if result else '❌'}")
                return result
                
            elif action_type == 'wait':
                duration = action.get('duration', 1000)
                self.logger.info(f"⏱️ Ожидание {duration}ms")
                time.sleep(duration / 1000)
                return True
                
            elif action_type == 'check_element':
                selector = action.get('element', {}).get('selector')
                element = self.find_element_safe(selector)
                found = element is not None
                self.logger.info(f"🔍 Проверка элемента {selector}: {'✅ найден' if found else '❌ НЕ найден'}")
                
                if found:
                    try:
                        # Дополнительная информация об элементе
                        tag_name = element.tag_name
                        is_displayed = element.is_displayed()
                        is_enabled = element.is_enabled()
                        self.logger.info(f"📋 Элемент: {tag_name}, видимый: {is_displayed}, активный: {is_enabled}")
                    except:
                        pass
                        
                return found
                
            elif action_type == 'click':
                selector = action.get('element', {}).get('selector')
                element = self.find_element_safe(selector)
                if element:
                    try:
                        # Прокручиваем к элементу
                        self.driver.execute_script(
                            "arguments[0].scrollIntoView({block: 'center'});", element
                        )
                        time.sleep(1)
                        
                        # Пробуем обычный клик
                        element.click()
                        self.logger.info(f"👆 Клик выполнен: {selector}")
                    except:
                        try:
                            # JavaScript клик как fallback
                            self.driver.execute_script("arguments[0].click();", element)
                            self.logger.info(f"👆 JS клик выполнен: {selector}")
                        except Exception as e:
                            self.logger.error(f"❌ Клик не удался: {e}")
                            return False
                    time.sleep(2)
                    return True
                return False
                
            elif action_type == 'type':
                selector = action.get('element', {}).get('selector')
                text = action.get('element', {}).get('text')
                element = self.find_element_safe(selector)
                if element:
                    try:
                        # Фокусируемся на элементе
                        element.click()
                        time.sleep(0.5)
                        
                        # Очищаем поле
                        element.clear()
                        time.sleep(0.5)
                        
                        # Вводим текст
                        element.send_keys(text)
                        self.logger.info(f"⌨️ Текст введен в {selector}: {text}")
                        time.sleep(1)
                        return True
                    except Exception as type_error:
                        self.logger.error(f"❌ Ошибка ввода текста: {type_error}")
                return False
                
            else:
                self.logger.warning(f"⚠️ Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            self.logger.error(f"💥 Критическая ошибка действия {action_type}: {e}")
            return False
    
    def execute_task(self, task):
        """Выполнение RPA задачи с подробным логированием"""
        task_id = task.get('taskId', 'unknown')
        self.logger.info(f"🚀 === НАЧАЛО ВЫПОЛНЕНИЯ RPA ЗАДАЧИ {task_id} ===")
        
        try:
            # Настройка браузера
            setup_success = self.setup_browser(task.get('proxy'))
            if not setup_success:
                error_msg = 'Не удалось настроить универсальный браузер'
                self.logger.error(f"❌ {error_msg}")
                return {
                    'taskId': task_id,
                    'success': False,
                    'error': error_msg,
                    'environment': 'railway-universal-cloud',
                    'browser_setup': 'failed'
                }
            
            # Выполнение действий
            actions = task.get('actions', [])
            completed_actions = 0
            total_actions = len(actions)
            failed_actions = []
            
            self.logger.info(f"📋 Всего действий к выполнению: {total_actions}")
            
            for i, action in enumerate(actions):
                action_type = action.get('type', 'unknown')
                action_id = action.get('id', f'action_{i}')
                self.logger.info(f"🎬 Действие {i+1}/{total_actions} ({action_id}): {action_type}")
                
                if self.execute_action(action):
                    completed_actions += 1
                    self.logger.info(f"✅ Действие {i+1} выполнено успешно")
                else:
                    failed_actions.append(f"{action_id}:{action_type}")
                    self.logger.warning(f"⚠️ Действие {i+1} не выполнено")
                
                # Задержка между действиями
                delay = action.get('delay', 1000)
                if delay > 0:
                    time.sleep(delay / 1000)
            
            # Результат
            success = completed_actions > 0
            success_rate = (completed_actions / total_actions * 100) if total_actions > 0 else 0
            
            result_message = f"Выполнено {completed_actions}/{total_actions} действий ({success_rate:.1f}%)"
            if failed_actions:
                result_message += f". Не удались: {', '.join(failed_actions)}"
            
            self.logger.info(f"🏁 === ЗАДАЧА {task_id} ЗАВЕРШЕНА ===")
            self.logger.info(f"📊 Результат: {result_message}")
            
            return {
                'taskId': task_id,
                'success': success,
                'message': result_message,
                'completedActions': completed_actions,
                'totalActions': total_actions,
                'successRate': success_rate,
                'failedActions': failed_actions,
                'environment': 'railway-universal-cloud-v2',
                'platform': task.get('metadata', {}).get('platform', 'unknown'),
                'features': ['universal-platforms', 'antidetect', 'human-behavior', 'multi-fallback']
            }
            
        except Exception as e:
            error_msg = f"Критическая ошибка в задаче: {str(e)}"
            self.logger.error(f"💥 {error_msg}")
            self.logger.error(f"Тип ошибки: {type(e).__name__}")
            return {
                'taskId': task_id,
                'success': False,
                'error': error_msg,
                'environment': 'railway-universal-cloud-v2'
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
