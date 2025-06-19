
#!/usr/bin/env python3
"""
Cloud browser manager for RPA bot
"""

import logging
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, TimeoutException

logger = logging.getLogger(__name__)

class CloudBrowserManager:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.chrome_options = None
        
    def setup_browser(self, headless=True, proxy=None):
        """Setup Chrome browser for cloud environment"""
        try:
            logger.info("Setting up Chrome browser for cloud...")
            
            # Chrome options for cloud environment
            self.chrome_options = Options()
            
            # Essential cloud options
            self.chrome_options.add_argument('--headless=new')
            self.chrome_options.add_argument('--no-sandbox')
            self.chrome_options.add_argument('--disable-dev-shm-usage')
            self.chrome_options.add_argument('--disable-gpu')
            self.chrome_options.add_argument('--disable-web-security')
            self.chrome_options.add_argument('--disable-features=VizDisplayCompositor')
            self.chrome_options.add_argument('--disable-extensions')
            self.chrome_options.add_argument('--disable-plugins')
            self.chrome_options.add_argument('--disable-images')
            self.chrome_options.add_argument('--disable-javascript')
            self.chrome_options.add_argument('--window-size=1920,1080')
            self.chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            
            # Memory optimizations
            self.chrome_options.add_argument('--memory-pressure-off')
            self.chrome_options.add_argument('--max_old_space_size=4096')
            
            # Proxy configuration
            if proxy:
                proxy_arg = f"--proxy-server={proxy}"
                self.chrome_options.add_argument(proxy_arg)
                logger.info(f"Using proxy: {proxy}")
            
            # Additional preferences
            prefs = {
                "profile.default_content_setting_values": {
                    "notifications": 2,
                    "media_stream": 2,
                },
                "profile.managed_default_content_settings": {
                    "images": 2
                }
            }
            self.chrome_options.add_experimental_option("prefs", prefs)
            
            # Try to create driver
            try:
                self.driver = webdriver.Chrome(options=self.chrome_options)
            except Exception as e:
                logger.warning(f"Failed to create Chrome driver: {e}")
                # Fallback with service
                service = Service('/usr/local/bin/chromedriver')
                self.driver = webdriver.Chrome(service=service, options=self.chrome_options)
            
            # Set timeouts
            self.driver.implicitly_wait(10)
            self.driver.set_page_load_timeout(30)
            
            # Create wait object
            self.wait = WebDriverWait(self.driver, 10)
            
            logger.info("Browser setup completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Browser setup failed: {e}")
            return False
    
    def close(self):
        """Close browser and cleanup"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Browser closed successfully")
            except Exception as e:
                logger.warning(f"Error closing browser: {e}")
