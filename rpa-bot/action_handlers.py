
#!/usr/bin/env python3
"""
Action handlers for RPA bot
"""

import time
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException

logger = logging.getLogger(__name__)


class ActionHandlers:
    """Handles all RPA actions"""
    
    def __init__(self, driver, wait, behavior):
        self.driver = driver
        self.wait = wait
        self.behavior = behavior
    
    def navigate(self, action):
        """Navigate to URL"""
        url = action.get('url')
        if not url:
            return False
            
        self.driver.get(url)
        self.behavior.random_delay(500, 1500)
        return True
    
    def click(self, action):
        """Click element (Selenium only for cloud)"""
        if 'selector' in action:
            element = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, action['selector'])))
            self.behavior.human_mouse_move(self.driver, element)
            element.click()
        elif 'x' in action and 'y' in action:
            # Use JavaScript for coordinate clicks in cloud
            self.driver.execute_script(f"document.elementFromPoint({action['x']}, {action['y']}).click();")
        else:
            return False
            
        self.behavior.random_delay(100, 400)
        return True
    
    def type_text(self, action):
        """Type text"""
        text = action.get('text', '')
        
        if 'selector' in action:
            element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, action['selector'])))
            self.behavior.human_type(element, text)
        else:
            # Send text to active element in cloud
            active_element = self.driver.switch_to.active_element
            self.behavior.human_type(active_element, text)
            
        return True
    
    def wait(self, action):
        """Wait"""
        duration = action.get('duration', 1000)
        time.sleep(duration / 1000)
        return True
    
    def scroll(self, action):
        """Scroll"""
        x = action.get('x', 0)
        y = action.get('y', 0)
        
        if 'selector' in action:
            element = self.driver.find_element(By.CSS_SELECTOR, action['selector'])
            self.driver.execute_script("arguments[0].scrollIntoView();", element)
        else:
            self.driver.execute_script(f"window.scrollBy({x}, {y});")
            
        self.behavior.random_delay(200, 600)
        return True
    
    def key_press(self, action):
        """Press key"""
        key = action.get('key')
        if not key:
            return False
            
        key_mapping = {
            'Enter': Keys.RETURN,
            'Tab': Keys.TAB,
            'Escape': Keys.ESCAPE,
            'Space': Keys.SPACE,
            'Backspace': Keys.BACKSPACE,
            'Delete': Keys.DELETE,
            'ArrowUp': Keys.ARROW_UP,
            'ArrowDown': Keys.ARROW_DOWN,
            'ArrowLeft': Keys.ARROW_LEFT,
            'ArrowRight': Keys.ARROW_RIGHT
        }
        
        selenium_key = key_mapping.get(key, key)
        active_element = self.driver.switch_to.active_element
        active_element.send_keys(selenium_key)
        
        return True
    
    def move_mouse(self, action):
        """Move mouse via JavaScript"""
        x = action.get('x')
        y = action.get('y')
        
        if x is not None and y is not None:
            # Simulate movement via JavaScript in cloud
            self.driver.execute_script(f"""
                var event = new MouseEvent('mousemove', {{
                    clientX: {x},
                    clientY: {y},
                    bubbles: true
                }});
                document.dispatchEvent(event);
            """)
            
        return True
    
    def check_element(self, action):
        """Check element presence"""
        selector = action.get('selector')
        if not selector:
            return False
            
        try:
            element = self.driver.find_element(By.CSS_SELECTOR, selector)
            return element is not None
        except NoSuchElementException:
            return False
