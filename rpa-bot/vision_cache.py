
#!/usr/bin/env python3
"""
Система кэширования для Vision API распознавания
"""

import json
import sqlite3
import hashlib
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class VisionCache:
    def __init__(self, db_path: str = "vision_cache.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Инициализация базы данных кэша"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Таблица кэша координат
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS vision_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url_hash TEXT NOT NULL,
                element_description TEXT NOT NULL,
                coordinates TEXT,
                selector TEXT,
                success_count INTEGER DEFAULT 0,
                fail_count INTEGER DEFAULT 0,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                screenshot_hash TEXT,
                UNIQUE(url_hash, element_description)
            )
        ''')
        
        # Таблица логов операций
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS operation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                action_type TEXT NOT NULL,
                element_description TEXT,
                success BOOLEAN NOT NULL,
                error_message TEXT,
                screenshot_path TEXT,
                coordinates TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                execution_time REAL
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_url_hash(self, url: str) -> str:
        """Создание хэша URL для кэширования"""
        return hashlib.md5(url.encode()).hexdigest()
    
    def get_screenshot_hash(self, screenshot_data: bytes) -> str:
        """Создание хэша скриншота"""
        return hashlib.md5(screenshot_data).hexdigest()
    
    def get_cached_element(self, url: str, element_description: str) -> Optional[Dict]:
        """Получение кэшированного элемента"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        url_hash = self.get_url_hash(url)
        
        cursor.execute('''
            SELECT coordinates, selector, success_count, fail_count, last_used
            FROM vision_cache 
            WHERE url_hash = ? AND element_description = ?
            ORDER BY success_count DESC, last_used DESC
            LIMIT 1
        ''', (url_hash, element_description))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            coordinates, selector, success_count, fail_count, last_used = result
            return {
                'coordinates': json.loads(coordinates) if coordinates else None,
                'selector': selector,
                'success_count': success_count,
                'fail_count': fail_count,
                'last_used': last_used,
                'confidence': success_count / max(success_count + fail_count, 1)
            }
        
        return None
    
    def save_element_cache(self, url: str, element_description: str, 
                          coordinates: Optional[Dict] = None, 
                          selector: Optional[str] = None,
                          screenshot_hash: Optional[str] = None):
        """Сохранение элемента в кэш"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        url_hash = self.get_url_hash(url)
        coordinates_json = json.dumps(coordinates) if coordinates else None
        
        cursor.execute('''
            INSERT OR REPLACE INTO vision_cache 
            (url_hash, element_description, coordinates, selector, screenshot_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (url_hash, element_description, coordinates_json, selector, screenshot_hash, datetime.now()))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Элемент сохранен в кэш: {element_description} для {url}")
    
    def update_element_success(self, url: str, element_description: str, success: bool):
        """Обновление статистики успеха элемента"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        url_hash = self.get_url_hash(url)
        
        if success:
            cursor.execute('''
                UPDATE vision_cache 
                SET success_count = success_count + 1, last_used = ?
                WHERE url_hash = ? AND element_description = ?
            ''', (datetime.now(), url_hash, element_description))
        else:
            cursor.execute('''
                UPDATE vision_cache 
                SET fail_count = fail_count + 1
                WHERE url_hash = ? AND element_description = ?
            ''', (url_hash, element_description))
        
        conn.commit()
        conn.close()
    
    def log_operation(self, url: str, action_type: str, element_description: str,
                     success: bool, error_message: str = None, 
                     screenshot_path: str = None, coordinates: Dict = None,
                     execution_time: float = None):
        """Логирование операции"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        coordinates_json = json.dumps(coordinates) if coordinates else None
        
        cursor.execute('''
            INSERT INTO operation_logs 
            (url, action_type, element_description, success, error_message, 
             screenshot_path, coordinates, execution_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (url, action_type, element_description, success, error_message,
              screenshot_path, coordinates_json, execution_time))
        
        conn.commit()
        conn.close()
    
    def clear_cache_for_url(self, url: str):
        """Очистка кэша для конкретного URL"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        url_hash = self.get_url_hash(url)
        cursor.execute('DELETE FROM vision_cache WHERE url_hash = ?', (url_hash,))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Кэш очищен для URL: {url}")
    
    def get_cache_stats(self) -> Dict:
        """Получение статистики кэша"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM vision_cache')
        cache_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM operation_logs WHERE success = 1')
        success_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM operation_logs WHERE success = 0')
        fail_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'cached_elements': cache_count,
            'successful_operations': success_count,
            'failed_operations': fail_count,
            'success_rate': success_count / max(success_count + fail_count, 1)
        }
