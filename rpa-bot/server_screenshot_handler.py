
#!/usr/bin/env python3
"""
Серверный обработчик скриншотов для RPA-мэппинга
"""

import base64
import time
import logging
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, WebDriverException
import undetected_chromedriver as uc

logger = logging.getLogger(__name__)

class ServerScreenshotHandler:
    def __init__(self):
        self.active_sessions: Dict[str, webdriver.Chrome] = {}
        self.session_info: Dict[str, Dict] = {}
        
    def create_browser_session(self, device_type: str = 'desktop') -> str:
        """Создание нового сеанса браузера"""
        session_id = f"session_{int(time.time() * 1000)}"
        
        try:
            options = uc.ChromeOptions()
            
            # Настройки для облака
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--remote-debugging-port=9222')
            
            # Антидетект настройки
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            # Настройки разрешения в зависимости от типа устройства
            if device_type == 'mobile':
                options.add_argument('--window-size=375,812')  # iPhone X
                user_agent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
                resolution = {'width': 375, 'height': 812}
            elif device_type == 'tablet':
                options.add_argument('--window-size=768,1024')  # iPad
                user_agent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
                resolution = {'width': 768, 'height': 1024}
            else:  # desktop
                options.add_argument('--window-size=1920,1080')
                user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                resolution = {'width': 1920, 'height': 1080}
            
            options.add_argument(f'--user-agent={user_agent}')
            
            # Создание драйвера
            driver = uc.Chrome(options=options)
            
            # Выполнение JavaScript для скрытия автоматизации
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.active_sessions[session_id] = driver
            self.session_info[session_id] = {
                'created_at': datetime.now().isoformat(),
                'device_type': device_type,
                'resolution': resolution,
                'user_agent': user_agent,
                'last_activity': time.time()
            }
            
            logger.info(f"Создан новый сеанс браузера: {session_id} ({device_type})")
            return session_id
            
        except Exception as e:
            logger.error(f"Ошибка создания сеанса браузера: {e}")
            raise
    
    def get_screenshot(self, session_id: str, url: str) -> Dict:
        """Получение скриншота с сервера"""
        if session_id not in self.active_sessions:
            # Создаем новый сеанс, если не существует
            session_id = self.create_browser_session()
        
        driver = self.active_sessions[session_id]
        session_info = self.session_info[session_id]
        
        try:
            # Переходим на страницу
            driver.get(url)
            
            # Ждем загрузки страницы
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Дополнительная пауза для полной загрузки
            time.sleep(2)
            
            # Получаем скриншот
            screenshot_base64 = driver.get_screenshot_as_base64()
            
            # Обновляем информацию о сеансе
            session_info['last_activity'] = time.time()
            session_info['current_url'] = driver.current_url
            session_info['page_title'] = driver.title
            
            browser_info = {
                'resolution': session_info['resolution'],
                'userAgent': session_info['user_agent'],
                'deviceType': session_info['device_type'],
                'timestamp': datetime.now().isoformat()
            }
            
            return {
                'sessionId': session_id,
                'imageBase64': screenshot_base64,
                'browserInfo': browser_info,
                'currentUrl': driver.current_url,
                'pageTitle': driver.title
            }
            
        except Exception as e:
            logger.error(f"Ошибка получения скриншота: {e}")
            raise
    
    def execute_action(self, session_id: str, action: Dict) -> bool:
        """Выполнение действия в браузере"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Сеанс {session_id} не найден")
        
        driver = self.active_sessions[session_id]
        action_chains = ActionChains(driver)
        
        try:
            action_type = action['type']
            coordinates = action['coordinates']
            
            if action_type == 'click':
                # Клик по координатам
                element = driver.find_element(By.TAG_NAME, "body")
                action_chains.move_to_element_with_offset(element, coordinates['x'], coordinates['y'])
                action_chains.click()
                action_chains.perform()
                
            elif action_type == 'type':
                # Клик по координатам и ввод текста
                element = driver.find_element(By.TAG_NAME, "body")
                action_chains.move_to_element_with_offset(element, coordinates['x'], coordinates['y'])
                action_chains.click()
                action_chains.perform()
                time.sleep(0.5)
                
                if 'value' in action:
                    # Имитация человеческого ввода
                    text = action['value']
                    for char in text:
                        action_chains.send_keys(char)
                        action_chains.perform()
                        time.sleep(0.05 + (time.time() % 0.1))  # Случайная задержка
                        
            elif action_type == 'hover':
                # Наведение мыши
                element = driver.find_element(By.TAG_NAME, "body")
                action_chains.move_to_element_with_offset(element, coordinates['x'], coordinates['y'])
                action_chains.perform()
                
            elif action_type == 'scroll':
                # Прокрутка
                driver.execute_script(f"window.scrollTo({coordinates['x']}, {coordinates['y']})")
                
            # Пауза после действия
            time.sleep(0.5 + (time.time() % 1.0))
            
            # Обновляем последнюю активность
            self.session_info[session_id]['last_activity'] = time.time()
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка выполнения действия {action_type}: {e}")
            return False
    
    def test_macro(self, session_id: str, actions: List[Dict], url: str) -> Dict:
        """Тестирование макроса на сервере"""
        if session_id not in self.active_sessions:
            session_id = self.create_browser_session()
        
        start_time = time.time()
        completed_actions = 0
        
        try:
            # Получаем скриншот "до"
            before_screenshot = self.get_screenshot(session_id, url)['imageBase64']
            
            # Выполняем действия
            for i, action in enumerate(actions):
                logger.info(f"Выполнение действия {i+1}/{len(actions)}: {action['type']}")
                
                if self.execute_action(session_id, action):
                    completed_actions += 1
                else:
                    logger.warning(f"Действие {i+1} не выполнено")
                
                # Пауза между действиями
                time.sleep(1.0 + (time.time() % 0.5))
            
            # Получаем скриншот "после"
            after_screenshot = self.get_screenshot(session_id, url)['imageBase64']
            
            execution_time = int((time.time() - start_time) * 1000)
            
            return {
                'success': completed_actions == len(actions),
                'completedActions': completed_actions,
                'totalActions': len(actions),
                'executionTime': execution_time,
                'beforeScreenshot': before_screenshot,
                'afterScreenshot': after_screenshot,
                'sessionId': session_id
            }
            
        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            logger.error(f"Ошибка тестирования макроса: {e}")
            
            return {
                'success': False,
                'completedActions': completed_actions,
                'totalActions': len(actions),
                'executionTime': execution_time,
                'error': str(e),
                'sessionId': session_id
            }
    
    def close_session(self, session_id: str):
        """Закрытие сеанса браузера"""
        if session_id in self.active_sessions:
            try:
                self.active_sessions[session_id].quit()
                del self.active_sessions[session_id]
                del self.session_info[session_id]
                logger.info(f"Сеанс {session_id} закрыт")
            except Exception as e:
                logger.error(f"Ошибка закрытия сеанса {session_id}: {e}")
    
    def cleanup_old_sessions(self, max_age_hours: int = 2):
        """Очистка старых сеансов"""
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        sessions_to_close = []
        for session_id, info in self.session_info.items():
            if current_time - info['last_activity'] > max_age_seconds:
                sessions_to_close.append(session_id)
        
        for session_id in sessions_to_close:
            logger.info(f"Закрытие старого сеанса: {session_id}")
            self.close_session(session_id)
    
    def get_session_info(self, session_id: str) -> Optional[Dict]:
        """Получение информации о сеансе"""
        return self.session_info.get(session_id)
    
    def list_active_sessions(self) -> List[str]:
        """Получение списка активных сеансов"""
        return list(self.active_sessions.keys())

# Глобальный экземпляр
screenshot_handler = ServerScreenshotHandler()
