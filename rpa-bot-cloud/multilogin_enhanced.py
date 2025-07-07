#!/usr/bin/env python3
"""
Улучшенная интеграция с Multilogin API для RPA системы
Использует предоставленный токен для полной интеграции
"""

import requests
import json
import time
import logging
from typing import Dict, Any, Optional, List
import jwt
from datetime import datetime, timedelta
import os
import subprocess
import psutil

logger = logging.getLogger(__name__)

class MultiloginEnhanced:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.multilogin.com"
        self.local_url = "http://127.0.0.1:35000"
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        self.workspace_id = None
        self.active_profiles = {}
        self.profile_cache = {}
        self.app_running = False
        
        # Инициализация
        self.decode_token_info()
        self.ensure_app_running()
        
    def decode_token_info(self) -> Dict[str, Any]:
        """Декодирование JWT токена для получения информации о workspace"""
        try:
            decoded = jwt.decode(self.token, options={"verify_signature": False})
            self.workspace_id = decoded.get('workspaceID')
            
            logger.info(f"🔑 Multilogin Token Info:")
            logger.info(f"   Workspace ID: {self.workspace_id}")
            logger.info(f"   Plan: {decoded.get('planName', 'Unknown')}")
            logger.info(f"   Email: {decoded.get('email', 'Unknown')}")
            logger.info(f"   User ID: {decoded.get('userID', 'Unknown')}")
            logger.info(f"   Expires: {datetime.fromtimestamp(decoded.get('exp', 0))}")
            
            return decoded
        except Exception as e:
            logger.error(f"❌ Ошибка декодирования токена: {e}")
            return {}

    def ensure_app_running(self) -> bool:
        """Проверка и запуск Multilogin приложения"""
        try:
            # Проверяем, запущено ли приложение
            if self.check_local_api():
                logger.info("✅ Multilogin приложение уже запущено")
                self.app_running = True
                return True
            
            logger.info("🚀 Запуск Multilogin приложения...")
            
            # В облачной среде приложение должно быть предустановлено
            # Здесь мы просто проверяем доступность API
            for attempt in range(30):  # 30 секунд ожидания
                if self.check_local_api():
                    logger.info("✅ Multilogin приложение запущено")
                    self.app_running = True
                    return True
                time.sleep(1)
            
            logger.warning("⚠️ Multilogin приложение недоступно, работаем только с API")
            return False
            
        except Exception as e:
            logger.error(f"❌ Ошибка запуска Multilogin: {e}")
            return False

    def check_local_api(self) -> bool:
        """Проверка доступности локального API"""
        try:
            response = requests.get(f"{self.local_url}/api/v1/profile/list", timeout=5)
            return response.status_code == 200
        except:
            return False

    def check_connection(self) -> bool:
        """Проверка подключения к Multilogin API"""
        try:
            response = requests.get(
                f"{self.base_url}/user/workspaces",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                workspaces = response.json()
                logger.info(f"✅ Подключение к Multilogin API успешно. Workspaces: {len(workspaces)}")
                return True
            else:
                logger.error(f"❌ Ошибка подключения к Multilogin API: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Ошибка проверки подключения: {e}")
            return False

    def get_profiles(self, limit: int = 100) -> List[Dict]:
        """Получение списка профилей"""
        try:
            params = {
                'limit': limit,
                'skip': 0
            }
            
            response = requests.get(
                f"{self.base_url}/profile",
                headers=self.headers,
                params=params,
                timeout=15
            )
            
            if response.status_code == 200:
                profiles = response.json()
                logger.info(f"📋 Найдено профилей: {len(profiles)}")
                
                # Кэшируем профили
                for profile in profiles:
                    self.profile_cache[profile.get('uuid')] = profile
                    
                return profiles
            else:
                logger.error(f"❌ Ошибка получения профилей: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Ошибка получения профилей: {e}")
            return []

    def create_profile(self, account_data: Dict[str, Any]) -> Optional[str]:
        """Создание нового профиля для аккаунта"""
        try:
            platform = account_data.get('platform', 'web')
            username = account_data.get('username', 'user')
            proxy_config = account_data.get('proxy', {})
            
            profile_name = f"RPA_{platform}_{username}_{int(time.time())}"
            
            profile_data = {
                "name": profile_name,
                "browser": "mimic",
                "os": "win",
                "navigator": {
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "resolution": "1920x1080",
                    "language": "en-US,en;q=0.9",
                    "platform": "Win32",
                    "doNotTrack": False,
                    "hardwareConcurrency": 8,
                    "deviceMemory": 8
                },
                "storage": {
                    "local": True,
                    "extensions": True,
                    "bookmarks": True,
                    "history": True,
                    "passwords": True
                },
                "proxy": self._prepare_proxy_config(proxy_config),
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
                "notes": f"Автоматически создан для RPA аккаунта {username} на платформе {platform}",
                "tags": ["RPA", platform, "auto-created"]
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
                logger.info(f"✅ Создан профиль: {profile_id} ({profile_name})")
                
                # Добавляем в кэш
                self.profile_cache[profile_id] = profile
                return profile_id
            else:
                logger.error(f"❌ Ошибка создания профиля: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Ошибка создания профиля: {e}")
            return None

    def _prepare_proxy_config(self, proxy_config: Dict) -> Dict:
        """Подготовка конфигурации прокси"""
        if not proxy_config or not proxy_config.get('enabled', False):
            return {"type": "none"}
        
        proxy_type = proxy_config.get('type', 'http').lower()
        
        config = {
            "type": proxy_type,
            "host": proxy_config.get('host', ''),
            "port": proxy_config.get('port', 8080)
        }
        
        if proxy_config.get('username'):
            config["username"] = proxy_config.get('username')
            config["password"] = proxy_config.get('password', '')
            
        return config

    def start_profile(self, profile_id: str, automation: bool = True) -> Optional[Dict[str, Any]]:
        """Запуск профиля"""
        try:
            if not self.app_running:
                logger.error("❌ Multilogin приложение не запущено")
                return None
                
            params = {
                'automation': 'true' if automation else 'false',
                'profileId': profile_id
            }
            
            response = requests.get(
                f"{self.local_url}/api/v1/profile/start",
                params=params,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK':
                    selenium_port = data.get('value')
                    
                    self.active_profiles[profile_id] = {
                        'port': selenium_port,
                        'started_at': datetime.now(),
                        'automation': automation
                    }
                    
                    logger.info(f"✅ Профиль {profile_id} запущен на порту {selenium_port}")
                    
                    return {
                        'profile_id': profile_id,
                        'selenium_port': selenium_port,
                        'selenium_url': f"http://127.0.0.1:{selenium_port}",
                        'status': 'running'
                    }
                else:
                    logger.error(f"❌ Ошибка запуска профиля: {data.get('value')}")
                    return None
            else:
                logger.error(f"❌ Ошибка запуска профиля: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Ошибка запуска профиля: {e}")
            return None

    def stop_profile(self, profile_id: str) -> bool:
        """Остановка профиля"""
        try:
            if not self.app_running:
                logger.warning("⚠️ Multilogin приложение не запущено")
                return False
                
            params = {'profileId': profile_id}
            
            response = requests.get(
                f"{self.local_url}/api/v1/profile/stop",
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK':
                    if profile_id in self.active_profiles:
                        del self.active_profiles[profile_id]
                    logger.info(f"✅ Профиль {profile_id} остановлен")
                    return True
                    
            logger.error(f"❌ Ошибка остановки профиля: {response.status_code}")
            return False
            
        except Exception as e:
            logger.error(f"❌ Ошибка остановки профиля: {e}")
            return False

    def get_selenium_driver(self, profile_id: str):
        """Получение Selenium драйвера для профиля"""
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            
            if profile_id not in self.active_profiles:
                logger.error(f"❌ Профиль {profile_id} не запущен")
                return None
                
            profile_info = self.active_profiles[profile_id]
            selenium_port = profile_info['port']
            
            options = Options()
            options.add_experimental_option("debuggerAddress", f"127.0.0.1:{selenium_port}")
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            
            driver = webdriver.Chrome(options=options)
            logger.info(f"✅ Selenium драйвер подключен к профилю {profile_id}")
            return driver
            
        except Exception as e:
            logger.error(f"❌ Ошибка получения Selenium драйвера: {e}")
            return None

    def get_profile_for_account(self, account_data: Dict[str, Any]) -> Optional[str]:
        """Получение или создание профиля для аккаунта"""
        try:
            platform = account_data.get('platform', 'web')
            username = account_data.get('username', '')
            
            # Ищем существующий профиль
            profiles = self.get_profiles()
            
            for profile in profiles:
                profile_name = profile.get('name', '')
                if f"RPA_{platform}_{username}" in profile_name:
                    logger.info(f"🔍 Найден существующий профиль: {profile.get('uuid')}")
                    return profile.get('uuid')
            
            # Создаем новый профиль
            logger.info(f"🆕 Создание нового профиля для {username} на {platform}")
            return self.create_profile(account_data)
            
        except Exception as e:
            logger.error(f"❌ Ошибка получения профиля для аккаунта: {e}")
            return None

    def cleanup_all_profiles(self):
        """Очистка всех активных профилей"""
        logger.info("🧹 Очистка всех активных профилей...")
        
        for profile_id in list(self.active_profiles.keys()):
            self.stop_profile(profile_id)
            
        logger.info("✅ Все профили очищены")

    def get_profile_status(self, profile_id: str) -> Dict[str, Any]:
        """Получение статуса профиля"""
        try:
            if profile_id in self.active_profiles:
                profile_info = self.active_profiles[profile_id]
                return {
                    'status': 'running',
                    'port': profile_info['port'],
                    'started_at': profile_info['started_at'].isoformat(),
                    'automation': profile_info.get('automation', True)
                }
            else:
                return {'status': 'stopped'}
                
        except Exception as e:
            logger.error(f"❌ Ошибка получения статуса профиля: {e}")
            return {'status': 'error', 'error': str(e)}

    def list_active_profiles(self) -> Dict[str, Dict]:
        """Список всех активных профилей"""
        return {
            profile_id: {
                'port': info['port'],
                'started_at': info['started_at'].isoformat(),
                'automation': info.get('automation', True)
            }
            for profile_id, info in self.active_profiles.items()
        }

    def delete_profile(self, profile_id: str) -> bool:
        """Удаление профиля"""
        try:
            # Сначала останавливаем профиль
            if profile_id in self.active_profiles:
                self.stop_profile(profile_id)
            
            response = requests.delete(
                f"{self.base_url}/profile/{profile_id}",
                headers=self.headers,
                timeout=15
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Профиль {profile_id} удален")
                if profile_id in self.profile_cache:
                    del self.profile_cache[profile_id]
                return True
            else:
                logger.error(f"❌ Ошибка удаления профиля: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Ошибка удаления профиля: {e}")
            return False

