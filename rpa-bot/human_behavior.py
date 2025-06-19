
#!/usr/bin/env python3
"""
Симуляция человеческого поведения для RPA бота
"""

import time
import random
from selenium.webdriver.common.action_chains import ActionChains

class CloudHumanBehaviorSimulator:
    """Оптимизированная симуляция человеческого поведения для облачной среды"""
    
    @staticmethod
    def random_delay(min_ms=50, max_ms=500):
        """Более быстрые задержки для облачной среды"""
        delay = random.uniform(min_ms/1000, max_ms/1000)
        time.sleep(delay)
    
    @staticmethod
    def human_type(element, text, typing_speed=0.05):
        """Быстрый ввод для облачной среды"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.02, typing_speed))
    
    @staticmethod
    def human_mouse_move(driver, element):
        """Легкое перемещение мыши"""
        action = ActionChains(driver)
        action.move_to_element(element)
        action.perform()
        CloudHumanBehaviorSimulator.random_delay(100, 300)
