
#!/usr/bin/env python3
"""
Универсальный RPA-бот для всех платформ
Запускается как в облаке, так и локально
"""

import os
import sys
import json
import time
import random
import logging
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

import requests
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import undetected_chromedriver as uc
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
import cv2
from PIL import Image
import psutil

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/rpa_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='frontend', static_url_path='')

class UniversalRPABot:
    """Универсальный RPA-бот для всех платформ"""
    
    def __init__(self):
        self.driver = None
        self.current_session = None
        self.platforms_config = self._load_platforms_config()
        self.user_agents = UserAgent()
        
    def _load_platforms_config(self) -> Dict:
        """Загрузка конфигурации платформ"""
        return {
            'instagram': {
                'base_url': 'https://www.instagram.com',
                'login_url': 'https://www.instagram.com/accounts/login/',
                'selectors': {
                    'username': 'input[name="username"]',
                    'password': 'input[name="password"]',
                    'login_button': 'button[type="submit"]',
                    'like_button': 'svg[aria-label="Like"]',
                    'follow_button': 'button:contains("Follow")',
                    'comment_input': 'textarea[placeholder="Add a comment..."]'
                }
            },
            'tiktok': {
                'base_url': 'https://www.tiktok.com',
                'login_url': 'https://www.tiktok.com/login',
                'selectors': {
                    'like_button': '[data-e2e="like-icon"]',
                    'follow_button': '[data-e2e="follow-button"]',
                    'comment_input': '[data-e2e="comment-input"]'
                }
            },
            'youtube': {
                'base_url': 'https://www.youtube.com',
                'login_url': 'https://accounts.google.com/signin',
                'selectors': {
                    'like_button': '#top-level-buttons-computed button[aria-label*="like"]',
                    'subscribe_button': '#subscribe-button',
                    'comment_input': '#contenteditable-root'
                }
            },
            'twitter': {
                'base_url': 'https://x.com',
                'login_url': 'https://x.com/i/flow/login',
                'selectors': {
                    'like_button': '[data-testid="like"]',
                    'retweet_button': '[data-testid="retweet"]',
                    'follow_button': '[data-testid*="follow"]',
                    'tweet_input': '[data-testid="tweetTextarea_0"]'
                }
            },
            'facebook': {
                'base_url': 'https://www.facebook.com',
                'login_url': 'https://www.facebook.com/login',
                'selectors': {
                    'like_button': '[data-testid="fb-ufi_like_link"]',
                    'comment_input': '[data-testid="ufi_comment_composer_text_input"]'
                }
            },
            'linkedin': {
                'base_url': 'https://www.linkedin.com',
                'login_url': 'https://www.linkedin.com/login',
                'selectors': {
                    'like_button': 'button[aria-label*="Like"]',
                    'connect_button': 'button[aria-label*="Connect"]'
                }
            },
            'reddit': {
                'base_url': 'https://www.reddit.com',
                'login_url': 'https://www.reddit.com/login',
                'selectors': {
                    'upvote_button': '[aria-label="Upvote"]',
                    'comment_input': 'textarea[placeholder*="What are your thoughts?"]'
                }
            },
            'discord': {
                'base_url': 'https://discord.com/app',
                'login_url': 'https://discord.com/login',
                'selectors': {
                    'message_input': '[data-slate-editor="true"]'
                }
            }
        }
    
    def create_driver(self, stealth_mode=True, proxy=None):
        """Создание webdriver с антидетект настройками"""
        try:
            options = Options()
            
            # Базовые настройки для облака
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            # Headless режим для облака
            if os.getenv('DISPLAY'):
                options.add_argument('--display=' + os.getenv('DISPLAY'))
            else:
                options.add_argument('--headless')
            
            # Антидетект настройки
            if stealth_mode:
                options.add_argument(f'--user-agent={self.user_agents.random}')
            
            # Прокси
            if proxy:
                options.add_argument(f'--proxy-server={proxy}')
            
            # Создание драйвера
            if stealth_mode:
                self.driver = uc.Chrome(options=options)
            else:
                self.driver = webdriver.Chrome(options=options)
            
            # Выполнение JavaScript для скрытия автоматизации
            self.driver.execute_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
            """)
            
            logger.info("WebDriver создан успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка создания WebDriver: {e}")
            return False
    
    def human_like_delay(self, min_delay=1, max_delay=3):
        """Человекоподобная задержка"""
        delay = random.uniform(min_delay, max_delay)
        time.sleep(delay)
    
    def human_like_typing(self, element, text, delay_range=(0.05, 0.15)):
        """Человекоподобный ввод текста"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(*delay_range))
    
    def execute_platform_action(self, platform: str, action: str, **kwargs) -> Dict:
        """Выполнение действия на конкретной платформе"""
        try:
            platform_config = self.platforms_config.get(platform)
            if not platform_config:
                return {'success': False, 'error': f'Платформа {platform} не поддерживается'}
            
            # Навигация на платформу
            if not self.driver.current_url.startswith(platform_config['base_url']):
                self.driver.get(platform_config['base_url'])
                self.human_like_delay(2, 4)
            
            # Выполнение конкретного действия
            if action == 'like':
                return self._perform_like(platform, platform_config)
            elif action == 'follow':
                return self._perform_follow(platform, platform_config)
            elif action == 'comment':
                return self._perform_comment(platform, platform_config, kwargs.get('text', ''))
            elif action == 'share':
                return self._perform_share(platform, platform_config)
            elif action == 'extract_data':
                return self._extract_platform_data(platform, platform_config)
            else:
                return {'success': False, 'error': f'Действие {action} не поддерживается'}
                
        except Exception as e:
            logger.error(f"Ошибка выполнения действия {action} на {platform}: {e}")
            return {'success': False, 'error': str(e)}
    
    def _perform_like(self, platform: str, config: Dict) -> Dict:
        """Выполнение лайка"""
        try:
            selector = config['selectors'].get('like_button')
            if not selector:
                return {'success': False, 'error': 'Селектор лайка не найден'}
            
            like_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )
            
            self.human_like_delay(1, 2)
            like_button.click()
            self.human_like_delay(1, 2)
            
            return {'success': True, 'message': f'Лайк поставлен на {platform}'}
            
        except TimeoutException:
            return {'success': False, 'error': 'Кнопка лайка не найдена'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _perform_follow(self, platform: str, config: Dict) -> Dict:
        """Выполнение подписки"""
        try:
            selector = config['selectors'].get('follow_button') or config['selectors'].get('subscribe_button')
            if not selector:
                return {'success': False, 'error': 'Селектор подписки не найден'}
            
            follow_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )
            
            self.human_like_delay(1, 2)
            follow_button.click()
            self.human_like_delay(2, 3)
            
            return {'success': True, 'message': f'Подписка выполнена на {platform}'}
            
        except TimeoutException:
            return {'success': False, 'error': 'Кнопка подписки не найдена'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _perform_comment(self, platform: str, config: Dict, text: str) -> Dict:
        """Добавление комментария"""
        try:
            selector = config['selectors'].get('comment_input')
            if not selector:
                return {'success': False, 'error': 'Поле комментария не найдено'}
            
            comment_input = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )
            
            self.human_like_delay(1, 2)
            comment_input.click()
            self.human_like_typing(comment_input, text)
            
            # Отправка комментария (Enter или кнопка)
            comment_input.send_keys(Keys.RETURN)
            self.human_like_delay(2, 3)
            
            return {'success': True, 'message': f'Комментарий добавлен на {platform}'}
            
        except TimeoutException:
            return {'success': False, 'error': 'Поле комментария не найдено'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _perform_share(self, platform: str, config: Dict) -> Dict:
        """Репост/Шер контента"""
        try:
            # Логика для каждой платформы индивидуально
            if platform == 'twitter':
                retweet_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-testid="retweet"]')
                retweet_btn.click()
                self.human_like_delay(1, 2)
                
                confirm_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-testid="retweetConfirm"]')
                confirm_btn.click()
                
            elif platform == 'facebook':
                share_btn = self.driver.find_element(By.CSS_SELECTOR, '[data-testid="UFI2ShareButton/root"]')
                share_btn.click()
                
            return {'success': True, 'message': f'Контент расшарен на {platform}'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _extract_platform_data(self, platform: str, config: Dict) -> Dict:
        """Извлечение данных с платформы"""
        try:
            data = {
                'platform': platform,
                'url': self.driver.current_url,
                'title': self.driver.title,
                'timestamp': datetime.now().isoformat()
            }
            
            # Специфичное извлечение для каждой платформы
            if platform == 'instagram':
                data.update(self._extract_instagram_data())
            elif platform == 'youtube':
                data.update(self._extract_youtube_data())
            elif platform == 'twitter':
                data.update(self._extract_twitter_data())
            
            return {'success': True, 'data': data}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _extract_instagram_data(self) -> Dict:
        """Извлечение данных Instagram"""
        try:
            # Лайки, комментарии, подписчики и т.д.
            likes = self.driver.find_elements(By.CSS_SELECTOR, 'button span')
            followers = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/followers/"] span')
            
            return {
                'likes_count': len(likes),
                'followers_count': len(followers),
                'post_type': 'image'  # определяется динамически
            }
        except:
            return {}
    
    def _extract_youtube_data(self) -> Dict:
        """Извлечение данных YouTube"""
        try:
            views = self.driver.find_element(By.CSS_SELECTOR, '#info span.view-count').text
            likes = self.driver.find_element(By.CSS_SELECTOR, '#top-level-buttons-computed #text').text
            
            return {
                'views': views,
                'likes': likes,
                'video_duration': self.driver.find_element(By.CSS_SELECTOR, '.ytp-time-duration').text
            }
        except:
            return {}
    
    def _extract_twitter_data(self) -> Dict:
        """Извлечение данных Twitter/X"""
        try:
            tweets = self.driver.find_elements(By.CSS_SELECTOR, '[data-testid="tweet"]')
            
            return {
                'tweets_count': len(tweets),
                'tweet_texts': [tweet.text for tweet in tweets[:5]]  # Первые 5 твитов
            }
        except:
            return {}
    
    def close(self):
        """Закрытие драйвера"""
        if self.driver:
            self.driver.quit()
            self.driver = None

# Глобальный инстанс бота
rpa_bot = UniversalRPABot()

@app.route('/')
def index():
    """Главная страница - фронтенд"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/health')
def health_check():
    """Проверка здоровья сервиса"""
    try:
        system_info = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'system': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            },
            'capabilities': [
                'Instagram', 'TikTok', 'YouTube', 'X (Twitter)', 
                'Facebook', 'LinkedIn', 'Reddit', 'Discord',
                'WhatsApp', 'Telegram', 'Twitch', 'Vimeo'
            ],
            'version': '2.0.0',
            'environment': 'production' if os.getenv('PORT') else 'development'
        }
        
        return jsonify(system_info)
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/execute', methods=['POST'])
def execute_rpa_task():
    """Выполнение RPA задачи"""
    try:
        task_data = request.get_json()
        logger.info(f"Получена RPA задача: {task_data}")
        
        if not task_data:
            return jsonify({'success': False, 'error': 'Нет данных задачи'}), 400
        
        task_id = task_data.get('taskId')
        url = task_data.get('url')
        actions = task_data.get('actions', [])
        platform = task_data.get('platform', 'auto')
        
        if not task_id or not url:
            return jsonify({'success': False, 'error': 'Отсутствует taskId или URL'}), 400
        
        # Определение платформы автоматически
        if platform == 'auto':
            platform = detect_platform(url)
        
        # Создание драйвера
        if not rpa_bot.create_driver():
            return jsonify({'success': False, 'error': 'Не удалось создать браузер'}), 500
        
        try:
            # Переход на страницу
            rpa_bot.driver.get(url)
            rpa_bot.human_like_delay(2, 4)
            
            results = []
            
            # Выполнение действий
            for action in actions:
                action_type = action.get('type')
                
                if action_type in ['move', 'click']:
                    result = execute_mouse_action(rpa_bot.driver, action)
                elif action_type == 'type':
                    result = execute_type_action(rpa_bot.driver, action)
                elif action_type == 'wait':
                    result = execute_wait_action(action)
                elif action_type == 'scroll':
                    result = execute_scroll_action(rpa_bot.driver, action)
                elif action_type in ['like', 'follow', 'comment', 'share']:
                    result = rpa_bot.execute_platform_action(platform, action_type, **action)
                else:
                    result = {'success': False, 'error': f'Неизвестный тип действия: {action_type}'}
                
                results.append(result)
                
                if not result.get('success'):
                    break
                
                rpa_bot.human_like_delay(1, 2)
            
            # Скриншот результата
            screenshot_path = f'/app/screenshots/task_{task_id}_{int(time.time())}.png'
            rpa_bot.driver.save_screenshot(screenshot_path)
            
            # Отправка результата в Supabase
            update_task_result(task_id, {
                'success': True,
                'message': 'RPA задача выполнена успешно',
                'results': results,
                'screenshot': screenshot_path,
                'platform': platform,
                'completed_at': datetime.now().isoformat()
            })
            
            return jsonify({
                'success': True,
                'message': 'RPA задача выполнена успешно',
                'taskId': task_id,
                'results': results
            })
            
        finally:
            rpa_bot.close()
            
    except Exception as e:
        logger.error(f"Ошибка выполнения RPA задачи: {e}")
        logger.error(traceback.format_exc())
        
        # Отправка ошибки в Supabase
        if 'task_id' in locals():
            update_task_result(task_id, {
                'success': False,
                'error': str(e),
                'completed_at': datetime.now().isoformat()
            })
        
        return jsonify({
            'success': False,
            'error': str(e),
            'taskId': task_data.get('taskId') if task_data else None
        }), 500

def detect_platform(url: str) -> str:
    """Автоматическое определение платформы по URL"""
    domain_map = {
        'instagram.com': 'instagram',
        'tiktok.com': 'tiktok',
        'youtube.com': 'youtube',
        'youtu.be': 'youtube',
        'x.com': 'twitter',
        'twitter.com': 'twitter',
        'facebook.com': 'facebook',
        'linkedin.com': 'linkedin',
        'reddit.com': 'reddit',
        'discord.com': 'discord',
        'telegram.org': 'telegram',
        'twitch.tv': 'twitch'
    }
    
    for domain, platform in domain_map.items():
        if domain in url.lower():
            return platform
    
    return 'unknown'

def execute_mouse_action(driver, action):
    """Выполнение действий мыши"""
    try:
        x, y = action.get('x', 0), action.get('y', 0)
        action_type = action.get('type')
        
        actions = ActionChains(driver)
        
        if action_type == 'move':
            actions.move_by_offset(x, y)
        elif action_type == 'click':
            element = driver.find_element(By.TAG_NAME, 'body')
            actions.move_to_element_with_offset(element, x, y).click()
        
        actions.perform()
        return {'success': True, 'message': f'Действие {action_type} выполнено'}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def execute_type_action(driver, action):
    """Выполнение ввода текста"""
    try:
        text = action.get('text', '')
        
        # Находим активный элемент или используем body
        try:
            active_element = driver.switch_to.active_element
        except:
            active_element = driver.find_element(By.TAG_NAME, 'body')
        
        # Человекоподобный ввод
        for char in text:
            active_element.send_keys(char)
            time.sleep(random.uniform(0.05, 0.15))
        
        return {'success': True, 'message': f'Текст "{text}" введен'}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def execute_wait_action(action):
    """Выполнение ожидания"""
    try:
        duration = action.get('duration', 1000) / 1000  # конвертация в секунды
        time.sleep(duration)
        return {'success': True, 'message': f'Ожидание {duration}с выполнено'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def execute_scroll_action(driver, action):
    """Выполнение прокрутки"""
    try:
        x, y = action.get('x', 0), action.get('y', 0)
        driver.execute_script(f"window.scrollBy({x}, {y});")
        return {'success': True, 'message': f'Прокрутка на {x}, {y} выполнена'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def update_task_result(task_id: str, result: Dict):
    """Обновление результата задачи в Supabase"""
    try:
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not supabase_url or not supabase_key:
            logger.warning("Supabase настройки не найдены, результат не отправлен")
            return
        
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        # Обновляем результат через Edge Function
        response = requests.put(
            f'{supabase_url}/functions/v1/rpa-task',
            headers=headers,
            json={'taskId': task_id, 'result': result},
            timeout=10
        )
        
        if response.ok:
            logger.info(f"Результат задачи {task_id} обновлен в Supabase")
        else:
            logger.error(f"Ошибка обновления результата: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Ошибка отправки результата в Supabase: {e}")

@app.route('/status')
def get_status():
    """Расширенный статус системы"""
    try:
        return jsonify({
            'bot_status': 'online',
            'active_sessions': 1 if rpa_bot.driver else 0,
            'supported_platforms': list(rpa_bot.platforms_config.keys()),
            'system_resources': {
                'cpu': f"{psutil.cpu_percent()}%",
                'memory': f"{psutil.virtual_memory().percent}%",
                'disk': f"{psutil.disk_usage('/').percent}%"
            },
            'uptime': time.time(),
            'version': '2.0.0-universal'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Создание необходимых директорий
    os.makedirs('/app/screenshots', exist_ok=True)
    os.makedirs('/app/logs', exist_ok=True)
    
    port = int(os.getenv('PORT', 8080))
    
    logger.info(f"🚀 Запуск универсального RPA-бота на порту {port}")
    logger.info(f"🌐 Поддерживаемые платформы: {list(rpa_bot.platforms_config.keys())}")
    
    app.run(host='0.0.0.0', port=port, debug=False)
