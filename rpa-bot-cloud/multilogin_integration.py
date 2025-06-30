
#!/usr/bin/env python3
"""
Интеграция с Multilogin для RPA бота
"""

import requests
import json
import time
import logging
from typing import Dict, Any, Optional
import jwt
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class MultiloginManager:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.multilogin.com"
        self.local_url = "http://127.0.0.1:35000"
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        self.workspace_id = None
        self.active_profiles = {}
        
    def decode_token_info(self) -> Dict[str, Any]:
        """Декодирование JWT токена для получения информации"""
        try:
            # Декодируем без верификации для получения информации
            decoded = jwt.decode(self.token, options={"verify_signature": False})
            self.workspace_id = decoded.get('workspaceID')
            logger.info(f"Multilogin workspace: {self.workspace_id}")
            logger.info(f"Plan: {decoded.get('planName', 'Unknown')}")
            logger.info(f"Email: {decoded.get('email', 'Unknown')}")
            return decoded
        except Exception as e:
            logger.error(f"Ошибка декодирования токена: {e}")
            return {}

    def check_connection(self) -> bool:
        """Проверка подключения к Multilogin"""
        try:
            response = requests.get(
                f"{self.base_url}/user/workspaces",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                workspaces = response.json()
                logger.info(f"Подключение к Multilogin успешно. Workspaces: {len(workspaces)}")
                return True
            else:
                logger.error(f"Ошибка подключения к Multilogin: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка проверки подключения: {e}")
            return False

    def get_profiles(self) -> list:
        """Получение списка профилей"""
        try:
            if not self.workspace_id:
                self.decode_token_info()
                
            response = requests.get(
                f"{self.base_url}/profile",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                profiles = response.json()
                logger.info(f"Найдено профилей: {len(profiles)}")
                return profiles
            else:
                logger.error(f"Ошибка получения профилей: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Ошибка получения профилей: {e}")
            return []

    def create_profile(self, account_data: Dict[str, Any]) -> Optional[str]:
        """Создание нового профиля для аккаунта"""
        try:
            profile_data = {
                "name": f"RPA_{account_data.get('platform', 'web')}_{account_data.get('username', 'user')}",
                "browser": "mimic",
                "os": "win",
                "navigator": {
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "resolution": "1920x1080",
                    "language": "en-US,en;q=0.9",
                    "platform": "Win32",
                    "doNotTrack": False,
                    "hardwareConcurrency": 8
                },
                "storage": {
                    "local": True,
                    "extensions": True,
                    "bookmarks": True,
                    "history": True,
                    "passwords": True
                },
                "proxy": {
                    "type": "none"
                },
                "dns": [],
                "plugins": {
                    "flash": False,
                    "pdf": True
                },
                "timezone": {
                    "mode": "auto"
                },
                "geolocation": {
                    "mode": "auto"
                },
                "audioContext": {
                    "mode": "noise"
                },
                "canvas": {
                    "mode": "noise"
                },
                "webgl": {
                    "mode": "noise"
                },
                "webglInfo": {
                    "mode": "mask"
                },
                "clientRects": {
                    "mode": "noise"
                },
                "notes": f"Автоматически создан для RPA аккаунта {account_data.get('username')}"
            }
            
            response = requests.post(
                f"{self.base_url}/profile",
                headers=self.headers,
                json=profile_data,
                timeout=30
            )
            
            if response.status_code == 201:
                profile = response.json()
                profile_id = profile.get('uuid')
                logger.info(f"Создан профиль: {profile_id}")
                return profile_id
            else:
                logger.error(f"Ошибка создания профиля: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Ошибка создания профиля: {e}")
            return None

    def start_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """Запуск профиля"""
        try:
            response = requests.get(
                f"{self.local_url}/api/v1/profile/start?automation=true&profileId={profile_id}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK':
                    selenium_port = data.get('value')
                    self.active_profiles[profile_id] = {
                        'port': selenium_port,
                        'started_at': datetime.now()
                    }
                    logger.info(f"Профиль {profile_id} запущен на порту {selenium_port}")
                    return {
                        'profile_id': profile_id,
                        'selenium_port': selenium_port,
                        'selenium_url': f"http://127.0.0.1:{selenium_port}"
                    }
                else:
                    logger.error(f"Ошибка запуска профиля: {data.get('value')}")
                    return None
            else:
                logger.error(f"Ошибка запуска профиля: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Ошибка запуска профиля: {e}")
            return None

    def stop_profile(self, profile_id: str) -> bool:
        """Остановка профиля"""
        try:
            response = requests.get(
                f"{self.local_url}/api/v1/profile/stop?profileId={profile_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK':
                    if profile_id in self.active_profiles:
                        del self.active_profiles[profile_id]
                    logger.info(f"Профиль {profile_id} остановлен")
                    return True
                    
            logger.error(f"Ошибка остановки профиля: {response.status_code}")
            return False
            
        except Exception as e:
            logger.error(f"Ошибка остановки профиля: {e}")
            return False

    def get_selenium_driver(self, profile_id: str):
        """Получение Selenium драйвера для профиля"""
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            
            if profile_id not in self.active_profiles:
                logger.error(f"Профиль {profile_id} не запущен")
                return None
                
            profile_info = self.active_profiles[profile_id]
            selenium_port = profile_info['port']
            
            options = Options()
            options.add_experimental_option("debuggerAddress", f"127.0.0.1:{selenium_port}")
            
            driver = webdriver.Chrome(options=options)
            logger.info(f"Selenium драйвер подключен к профилю {profile_id}")
            return driver
            
        except Exception as e:
            logger.error(f"Ошибка получения Selenium драйвера: {e}")
            return None

    def cleanup_all_profiles(self):
        """Очистка всех активных профилей"""
        for profile_id in list(self.active_profiles.keys()):
            self.stop_profile(profile_id)
            
        logger.info("Все профили очищены")

    def get_profile_for_account(self, account_data: Dict[str, Any]) -> Optional[str]:
        """Получение или создание профиля для аккаунта"""
        try:
            # Ищем существующий профиль
            profiles = self.get_profiles()
            account_username = account_data.get('username', '')
            
            for profile in profiles:
                if account_username in profile.get('name', ''):
                    return profile.get('uuid')
            
            # Создаем новый профиль
            return self.create_profile(account_data)
            
        except Exception as e:
            logger.error(f"Ошибка получения профиля для аккаунта: {e}")
            return None
