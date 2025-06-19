
#!/usr/bin/env python3
"""
Human behavior simulation for RPA bot
"""

import time
import random
from selenium.webdriver.common.action_chains import ActionChains


class CloudHumanBehaviorSimulator:
    """Optimized human behavior simulation for cloud environment"""
    
    @staticmethod
    def random_delay(min_ms=50, max_ms=500):
        """Faster delays for cloud environment"""
        delay = random.uniform(min_ms/1000, max_ms/1000)
        time.sleep(delay)
    
    @staticmethod
    def human_type(element, text, typing_speed=0.05):
        """Fast typing for cloud environment"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.02, typing_speed))
    
    @staticmethod
    def human_mouse_move(driver, element):
        """Lightweight mouse movement"""
        action = ActionChains(driver)
        action.move_to_element(element)
        action.perform()
        CloudHumanBehaviorSimulator.random_delay(100, 300)
