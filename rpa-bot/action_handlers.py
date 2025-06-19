
#!/usr/bin/env python3
"""
Action handlers for RPA bot
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
        """Navigate to URL"""
        try:
            url = action.get('url')
            if not url:
                logger.error("No URL provided for navigation")
                return False
            
            logger.info(f"Navigating to: {url}")
            self.driver.get(url)
            time.sleep(2)
            return True
        except Exception as e:
            logger.error(f"Navigation failed: {e}")
            return False
    
    def click(self, action):
        """Click element"""
        try:
            selector = action.get('selector')
            if not selector:
                logger.error("No selector provided for click")
                return False
            
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            self.behavior.human_mouse_move(self.driver, element)
            element.click()
            self.behavior.random_delay(500, 1500)
            return True
        except Exception as e:
            logger.error(f"Click failed: {e}")
            return False
    
    def type_text(self, action):
        """Type text in element"""
        try:
            selector = action.get('selector')
            text = action.get('text', '')
            
            if not selector:
                logger.error("No selector provided for typing")
                return False
            
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            self.behavior.human_type(element, text)
            return True
        except Exception as e:
            logger.error(f"Typing failed: {e}")
            return False
    
    def wait(self, action):
        """Wait for specified time"""
        try:
            duration = action.get('duration', 1000) / 1000  # Convert to seconds
            time.sleep(duration)
            return True
        except Exception as e:
            logger.error(f"Wait failed: {e}")
            return False
    
    def scroll(self, action):
        """Scroll page"""
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
            logger.error(f"Scroll failed: {e}")
            return False
    
    def key_press(self, action):
        """Press keyboard key"""
        try:
            key = action.get('key', 'ENTER')
            
            # Map key names to Selenium keys
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
            logger.error(f"Key press failed: {e}")
            return False
    
    def move_mouse(self, action):
        """Move mouse to element"""
        try:
            selector = action.get('selector')
            if not selector:
                logger.error("No selector provided for mouse move")
                return False
            
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            self.behavior.human_mouse_move(self.driver, element)
            return True
        except Exception as e:
            logger.error(f"Mouse move failed: {e}")
            return False
    
    def check_element(self, action):
        """Check if element exists"""
        try:
            selector = action.get('selector')
            if not selector:
                logger.error("No selector provided for element check")
                return False
            
            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
            exists = len(elements) > 0
            logger.info(f"Element {selector} exists: {exists}")
            return exists
        except Exception as e:
            logger.error(f"Element check failed: {e}")
            return False
