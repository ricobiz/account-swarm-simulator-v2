
#!/usr/bin/env python3
"""
Обработчик серверных скриншотов для Railway
"""

import os
import time
import json
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import undetected_chromedriver as uc

class ServerScreenshotHandler:
    def __init__(self):
        self.sessions = {}
        self.logger = logging.getLogger(__name__)
    
    def create_browser_session(self, device_type='desktop'):
        """Создание нового сеанса браузера"""
        try:
            session_id = f"session_{int(time.time())}"
            
            options = Options()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            
            try:
                driver = webdriver.Chrome(options=options)
            except:
                # Fallback на undetected chromedriver
                uc_options = uc.ChromeOptions()
                uc_options.add_argument('--headless')
                uc_options.add_argument('--no-sandbox')
                uc_options.add_argument('--disable-dev-shm-usage')
                driver = uc.Chrome(options=uc_options, version_main=None)
            
            self.sessions[session_id] = {
                'driver': driver,
                'created_at': time.time(),
                'device_type': device_type
            }
            
            self.logger.info(f"Создан сеанс браузера: {session_id}")
            return session_id
            
        except Exception as e:
            self.logger.error(f"Ошибка создания сеанса: {e}")
            return None
    
    def get_screenshot(self, session_id, url):
        """Получение скриншота"""
        try:
            if session_id not in self.sessions:
                session_id = self.create_browser_session()
                if not session_id:
                    return {'error': 'Не удалось создать сеанс'}
            
            driver = self.sessions[session_id]['driver']
            driver.get(url)
            time.sleep(3)
            
            screenshot_path = f'/app/screenshots/screenshot_{session_id}_{int(time.time())}.png'
            driver.save_screenshot(screenshot_path)
            
            return {
                'success': True,
                'sessionId': session_id,
                'screenshotPath': screenshot_path,
                'url': url
            }
            
        except Exception as e:
            self.logger.error(f"Ошибка скриншота: {e}")
            return {'error': str(e)}
    
    def test_macro(self, session_id, actions, url):
        """Тестирование макроса"""
        try:
            if session_id not in self.sessions:
                session_id = self.create_browser_session()
                if not session_id:
                    return {'error': 'Не удалось создать сеанс'}
            
            driver = self.sessions[session_id]['driver']
            driver.get(url)
            time.sleep(2)
            
            completed_actions = 0
            for action in actions:
                try:
                    action_type = action.get('type')
                    if action_type == 'click':
                        selector = action.get('element', {}).get('selector')
                        element = driver.find_element(By.CSS_SELECTOR, selector)
                        element.click()
                        completed_actions += 1
                    elif action_type == 'type':
                        selector = action.get('element', {}).get('selector')
                        text = action.get('element', {}).get('text')
                        element = driver.find_element(By.CSS_SELECTOR, selector)
                        element.clear()
                        element.send_keys(text)
                        completed_actions += 1
                    time.sleep(1)
                except:
                    continue
            
            return {
                'success': True,
                'completedActions': completed_actions,
                'totalActions': len(actions),
                'sessionId': session_id
            }
            
        except Exception as e:
            self.logger.error(f"Ошибка тестирования макроса: {e}")
            return {'error': str(e)}
    
    def get_session_info(self, session_id):
        """Информация о сеансе"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            return {
                'sessionId': session_id,
                'deviceType': session['device_type'],
                'createdAt': session['created_at'],
                'active': True
            }
        return None
    
    def close_session(self, session_id):
        """Закрытие сеанса"""
        if session_id in self.sessions:
            try:
                self.sessions[session_id]['driver'].quit()
                del self.sessions[session_id]
                self.logger.info(f"Сеанс {session_id} закрыт")
            except Exception as e:
                self.logger.error(f"Ошибка закрытия сеанса: {e}")
    
    def list_active_sessions(self):
        """Список активных сеансов"""
        return list(self.sessions.keys())
    
    def cleanup_old_sessions(self):
        """Очистка старых сеансов"""
        current_time = time.time()
        old_sessions = []
        
        for session_id, session in self.sessions.items():
            if current_time - session['created_at'] > 3600:  # 1 час
                old_sessions.append(session_id)
        
        for session_id in old_sessions:
            self.close_session(session_id)

# Глобальный экземпляр
screenshot_handler = ServerScreenshotHandler()
