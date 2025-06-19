
#!/usr/bin/env python3
"""
Обработчики действий для RPA бота
"""

import time
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException, TimeoutException, ElementNotInteractableException

logger = logging.getLogger(__name__)

class ActionHandlers:
    def __init__(self, driver, wait, behavior):
        self.driver = driver
        self.wait = wait
        self.behavior = behavior
    
    def navigate(self, action):
        """Переход по URL"""
        try:
            url = action.get('url')
            if not url:
                logger.error("URL не предоставлен для навигации")
                return False
            
            logger.info(f"Переход к: {url}")
            self.driver.get(url)
            time.sleep(2)
            return True
        except Exception as e:
            logger.error(f"Навигация не удалась: {e}")
            return False
    
    def click(self, action):
        """Клик по элементу"""
        try:
            selector = action.get('selector')
            if not selector:
                logger.error("Селектор не предоставлен для клика")
                return False
            
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            self.behavior.human_mouse_move(self.driver, element)
            element.click()
            self.behavior.random_delay(500, 1500)
            return True
        except Exception as e:
            logger.error(f"Клик не удался: {e}")
            return False
    
    def type_text(self, action):
        """Ввод текста в элемент"""
        try:
            selector = action.get('selector')
            text = action.get('text', '')
            
            if not selector:
                logger.error("Селектор не предоставлен для ввода")
                return False
            
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            self.behavior.human_type(element, text)
            return True
        except Exception as e:
            logger.error(f"Ввод текста не удался: {e}")
            return False
    
    def wait(self, action):
        """Ожидание указанного времени"""
        try:
            duration = action.get('duration', 1000) / 1000  # Конвертация в секунды
            time.sleep(duration)
            return True
        except Exception as e:
            logger.error(f"Ожидание не удалось: {e}")
            return False
    
    def scroll(self, action):
        """Прокрутка страницы"""
        try:
            direction = action.get('direction', 'down')
            amount = action.get('amount', 300)
            
            if direction == 'down':
                self.driver.execute_script(f"window.scrollBy(0, {amount});")
            elif direction == 'up':
                self.driver.execute_script(f"window.scrollBy(0, -{amount});")
            
            self.behavior.random_delay(500, 1000)
            return True
        except Exception as e:
            logger.error(f"Прокрутка не удалась: {e}")
            return False
    
    def key_press(self, action):
        """Нажатие клавиши клавиатуры"""
        try:
            key = action.get('key', 'ENTER')
            
            # Карта имен клавиш к клавишам Selenium
            key_map = {
                'ENTER': Keys.ENTER,
                'TAB': Keys.TAB,
                'ESCAPE': Keys.ESCAPE,
                'SPACE': Keys.SPACE,
                'ARROW_DOWN': Keys.ARROW_DOWN,
                'ARROW_UP': Keys.ARROW_UP
            }
            
            selenium_key = key_map.get(key, Keys.ENTER)
            ActionChains(self.driver).send_keys(selenium_key).perform()
            self.behavior.random_delay(200, 500)
            return True
        except Exception as e:
            logger.error(f"Нажатие клавиши не удалось: {e}")
            return False
    
    def move_mouse(self, action):
        """Перемещение мыши к элементу"""
        try:
            selector = action.get('selector')
            if not selector:
                logger.error("Селектор не предоставлен для перемещения мыши")
                return False
            
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            self.behavior.human_mouse_move(self.driver, element)
            return True
        except Exception as e:
            logger.error(f"Перемещение мыши не удалось: {e}")
            return False
    
    def check_element(self, action):
        """Проверка существования элемента"""
        try:
            selector = action.get('selector')
            if not selector:
                logger.error("Селектор не предоставлен для проверки элемента")
                return False
            
            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
            exists = len(elements) > 0
            logger.info(f"Элемент {selector} существует: {exists}")
            return exists
        except Exception as e:
            logger.error(f"Проверка элемента не удалась: {e}")
            return False
