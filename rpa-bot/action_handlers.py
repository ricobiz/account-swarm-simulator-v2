
#!/usr/bin/env python3
"""
Обработчики действий для продвинутого RPA бота
"""

import time
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logger = logging.getLogger(__name__)

class ActionHandlers:
    def __init__(self, driver, wait, behavior_simulator):
        self.driver = driver
        self.wait = wait
        self.behavior = behavior_simulator
    
    def navigate(self, action):
        """Навигация с человекоподобным поведением"""
        url = action.get('url', '')
        try:
            logger.info(f"Навигация к: {url}")
            
            # Предварительная задержка
            self.behavior.random_delay(500, 2000)
            
            self.driver.get(url)
            
            # Ожидание загрузки + имитация чтения
            self.behavior.random_delay(2000, 5000)
            
            # Случайный скролл для имитации осмотра страницы
            scroll_params = self.behavior.scroll_behavior('down', 200)
            self.driver.execute_script(f"window.scrollBy(0, {scroll_params['step_size']});")
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка навигации: {e}")
            return False
    
    def click(self, action):
        """Клик с поиском элемента"""
        selector = action.get('selector', '')
        try:
            # Попытка найти элемент
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
            
            # Человекоподобный клик
            click_params = self.behavior.click_behavior()
            
            # Задержка перед кликом
            time.sleep(click_params['pre_click_delay'])
            
            # Движение мыши к элементу
            ActionChains(self.driver).move_to_element(element).perform()
            self.behavior.random_delay(100, 300)
            
            # Клик
            element.click()
            
            # Задержка после клика
            time.sleep(click_params['post_click_delay'])
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка клика: {e}")
            return False
    
    def type_text(self, action):
        """Печать текста с человекоподобной скоростью"""
        selector = action.get('selector', '')
        text = action.get('text', '')
        
        try:
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
            
            # Очистка поля
            element.clear()
            self.behavior.random_delay(200, 500)
            
            # Печать по символам
            for char in text:
                element.send_keys(char)
                self.behavior.typing_delay()
            
            # Случайная пауза после печати
            self.behavior.random_delay(500, 1500)
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка печати: {e}")
            return False
    
    def wait(self, action):
        """Ожидание с случайными вариациями"""
        duration = action.get('duration', 1000)
        
        # Добавляем случайную вариацию ±20%
        variation = duration * 0.2
        actual_duration = duration + random.uniform(-variation, variation)
        
        time.sleep(actual_duration / 1000)
        return True
    
    def scroll(self, action):
        """Естественный скролл"""
        direction = action.get('direction', 'down')
        amount = action.get('amount', 300)
        
        scroll_params = self.behavior.scroll_behavior(direction, amount)
        
        for i, delay in enumerate(scroll_params['delays']):
            scroll_amount = scroll_params['step_size']
            if direction == 'up':
                scroll_amount = -scroll_amount
            
            self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
            time.sleep(delay)
        
        return True
    
    def key_press(self, action):
        """Нажатие клавиш"""
        key = action.get('key', '')
        
        try:
            # Получение активного элемента
            active_element = self.driver.switch_to.active_element
            
            # Конвертация названий клавиш
            key_mapping = {
                'enter': Keys.RETURN,
                'tab': Keys.TAB,
                'escape': Keys.ESCAPE,
                'space': Keys.SPACE,
                'backspace': Keys.BACKSPACE
            }
            
            key_to_send = key_mapping.get(key.lower(), key)
            active_element.send_keys(key_to_send)
            
            self.behavior.random_delay(200, 800)
            return True
            
        except Exception as e:
            logger.error(f"Ошибка нажатия клавиши: {e}")
            return False
    
    def move_mouse(self, action):
        """Движение мыши"""
        x = action.get('x', 0)
        y = action.get('y', 0)
        
        try:
            ActionChains(self.driver).move_by_offset(x, y).perform()
            self.behavior.mouse_movement_delay()
            return True
            
        except Exception as e:
            logger.error(f"Ошибка движения мыши: {e}")
            return False
    
    def check_element(self, action):
        """Проверка существования элемента"""
        selector = action.get('selector', '')
        
        try:
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            return element is not None
            
        except NoSuchElementException:
            return False
        except Exception as e:
            logger.error(f"Ошибка проверки элемента: {e}")
            return False
