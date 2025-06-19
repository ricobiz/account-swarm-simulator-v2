
#!/usr/bin/env python3
"""
Browser management for cloud RPA bot
"""

import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait

logger = logging.getLogger(__name__)


class CloudBrowserManager:
    """Browser setup and management for cloud environment"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
    
    def setup_browser(self, headless=True, proxy=None):
        """Setup browser for cloud environment"""
        try:
            chrome_options = Options()
            
            # Mandatory headless for cloud
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--remote-debugging-port=9222')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Cloud optimizations
            chrome_options.add_argument('--memory-pressure-off')
            chrome_options.add_argument('--max_old_space_size=4096')
            chrome_options.add_argument('--disable-background-timer-throttling')
            chrome_options.add_argument('--disable-backgrounding-occluded-windows')
            chrome_options.add_argument('--disable-renderer-backgrounding')
            
            # Proxy if specified
            if proxy:
                chrome_options.add_argument(f'--proxy-server={proxy}')
            
            # Cloud user agent
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            # ChromeDriver path in container
            service = Service('/usr/local/bin/chromedriver')
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.wait = WebDriverWait(self.driver, 15)
            
            logger.info("Cloud browser setup successful")
            return True
            
        except Exception as e:
            logger.error(f"Cloud browser setup error: {e}")
            return False
    
    def close(self):
        """Close browser"""
        if self.driver:
            self.driver.quit()
            self.driver = None
