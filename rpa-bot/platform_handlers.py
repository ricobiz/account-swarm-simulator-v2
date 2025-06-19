
#!/usr/bin/env python3
"""
Универсальные обработчики для всех популярных платформ
Поддерживает: Instagram, YouTube, TikTok, Twitter/X, Facebook, LinkedIn, Reddit, Discord и другие
"""

import time
import logging
import random
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logger = logging.getLogger(__name__)

class UniversalPlatformHandler:
    def __init__(self, driver, wait, behavior_simulator):
        self.driver = driver
        self.wait = wait
        self.behavior = behavior_simulator
        
        # Универсальные селекторы для разных платформ
        self.platform_selectors = {
            'instagram': {
                'like_button': [
                    'button[aria-label*="Like"]', 'button[aria-label*="like"]',
                    'svg[aria-label*="Like"]', '[data-testid="like"]',
                    '.fr66n button', '._8-yf5'
                ],
                'follow_button': [
                    'button:contains("Follow")', 'button:contains("Подписаться")',
                    '[data-testid="follow"]', '._acan._acap._acas._aj1-'
                ],
                'comment_field': [
                    'textarea[placeholder*="comment"]', 'textarea[aria-label*="comment"]',
                    '.Ypffh', '[data-testid="comment-field"]'
                ]
            },
            'youtube': {
                'like_button': [
                    '#segmented-like-button button', 'button[aria-label*="like"]',
                    'ytd-toggle-button-renderer:first-child button'
                ],
                'subscribe_button': [
                    '#subscribe-button button', 'button[aria-label*="Subscribe"]',
                    'ytd-subscribe-button-renderer button'
                ],
                'comment_field': [
                    '#placeholder-area', '#contenteditable-root',
                    'div[contenteditable="true"]'
                ]
            },
            'tiktok': {
                'like_button': [
                    '[data-e2e="like-icon"]', '[data-e2e="video-like-icon"]',
                    'button[data-e2e="like"]'
                ],
                'follow_button': [
                    '[data-e2e="follow-button"]', 'button[data-e2e="follow"]'
                ],
                'comment_field': [
                    '[data-e2e="comment-input"]', 'div[contenteditable="true"]'
                ]
            },
            'twitter': {
                'like_button': [
                    '[data-testid="like"]', '[aria-label*="Like"]',
                    '[data-testid="heart"]'
                ],
                'retweet_button': [
                    '[data-testid="retweet"]', '[aria-label*="Retweet"]'
                ],
                'follow_button': [
                    '[data-testid*="follow"]', 'button:contains("Follow")'
                ]
            },
            'facebook': {
                'like_button': [
                    '[aria-label*="Like"]', '[data-testid="fb-ufi_likelink"]',
                    'button[name="reaction"]'
                ],
                'comment_field': [
                    '[data-testid="fb-composer-input"]', 'div[contenteditable="true"]'
                ]
            },
            'linkedin': {
                'like_button': [
                    'button[aria-label*="React"]', '.react-button',
                    '[data-control-name="like"]'
                ],
                'connect_button': [
                    'button[aria-label*="Connect"]', '[data-control-name="connect"]'
                ]
            },
            'reddit': {
                'upvote_button': [
                    '[aria-label*="upvote"]', 'button[name="upvote"]',
                    '.arrow.up'
                ],
                'comment_field': [
                    'textarea[name="text"]', '.usertext-edit textarea'
                ]
            },
            'discord': {
                'message_field': [
                    '[data-slate-editor="true"]', 'div[role="textbox"]',
                    '.slateTextArea-1Mkdgw'
                ]
            }
        }
    
    def detect_platform(self, url):
        """Автоматическое определение платформы по URL"""
        url = url.lower()
        if 'instagram.com' in url:
            return 'instagram'
        elif 'youtube.com' in url or 'youtu.be' in url:
            return 'youtube'
        elif 'tiktok.com' in url:
            return 'tiktok'
        elif 'twitter.com' in url or 'x.com' in url:
            return 'twitter'
        elif 'facebook.com' in url:
            return 'facebook'
        elif 'linkedin.com' in url:
            return 'linkedin'
        elif 'reddit.com' in url:
            return 'reddit'
        elif 'discord.com' in url:
            return 'discord'
        elif 't.me' in url or 'telegram.org' in url:
            return 'telegram'
        else:
            return 'universal'
    
    def universal_like(self, action):
        """Универсальный лайк для любой платформы"""
        current_url = self.driver.current_url
        platform = self.detect_platform(current_url)
        
        logger.info(f"Выполнение лайка на платформе: {platform}")
        
        # Получаем селекторы для платформы
        selectors = self.platform_selectors.get(platform, {}).get('like_button', [])
        
        # Если платформа не определена, используем универсальные селекторы
        if not selectors:
            selectors = [
                'button[aria-label*="like" i]', 'button[aria-label*="Like"]',
                '[data-testid*="like"]', '.like-button', '.btn-like',
                'button:contains("👍")', 'button:contains("♥")', 'button:contains("❤")',
                '[title*="like" i]', '[alt*="like" i]'
            ]
        
        return self._perform_action(selectors, 'like')
    
    def universal_follow(self, action):
        """Универсальная подписка для любой платформы"""
        current_url = self.driver.current_url
        platform = self.detect_platform(current_url)
        
        logger.info(f"Выполнение подписки на платформе: {platform}")
        
        selectors = self.platform_selectors.get(platform, {}).get('follow_button', [])
        
        if not selectors:
            selectors = [
                'button:contains("Follow")', 'button:contains("Подписаться")',
                'button:contains("Subscribe")', 'button:contains("Connect")',
                '[data-testid*="follow"]', '.follow-button', '.btn-follow',
                '[aria-label*="Follow"]', '[aria-label*="Subscribe"]'
            ]
        
        return self._perform_action(selectors, 'follow')
    
    def universal_comment(self, action):
        """Универсальный комментарий для любой платформы"""
        text = action.get('text', self._get_random_comment())
        current_url = self.driver.current_url
        platform = self.detect_platform(current_url)
        
        logger.info(f"Написание комментария на платформе: {platform}")
        
        selectors = self.platform_selectors.get(platform, {}).get('comment_field', [])
        
        if not selectors:
            selectors = [
                'textarea[placeholder*="comment" i]', 'div[contenteditable="true"]',
                'input[placeholder*="comment" i]', '.comment-input',
                '[data-testid*="comment"]', '[aria-label*="comment" i]'
            ]
        
        return self._write_comment(selectors, text)
    
    def universal_share(self, action):
        """Универсальный репост/share для любой платформы"""
        current_url = self.driver.current_url
        platform = self.detect_platform(current_url)
        
        logger.info(f"Выполнение репоста на платформе: {platform}")
        
        selectors = [
            'button[aria-label*="Share"]', 'button[aria-label*="Retweet"]',
            '[data-testid*="share"]', '[data-testid*="retweet"]',
            '.share-button', '.btn-share', 'button:contains("Share")',
            'button:contains("Поделиться")', 'button:contains("Repost")'
        ]
        
        return self._perform_action(selectors, 'share')
    
    def _perform_action(self, selectors, action_type):
        """Выполнение действия с множественными селекторами"""
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                
                for element in elements:
                    if element.is_displayed() and element.is_enabled():
                        # Проверяем, не выполнено ли уже действие
                        if not self._is_action_already_done(element, action_type):
                            return self._click_element(element, action_type)
                
            except Exception as e:
                logger.debug(f"Селектор {selector} не сработал: {e}")
                continue
        
        logger.warning(f"Не удалось найти элемент для действия: {action_type}")
        return False
    
    def _write_comment(self, selectors, text):
        """Написание комментария"""
        for selector in selectors:
            try:
                element = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
                
                # Кликаем на поле
                element.click()
                self.behavior.random_delay(500, 1500)
                
                # Очищаем поле
                element.clear()
                self.behavior.random_delay(200, 500)
                
                # Печатаем текст по символам
                for char in text:
                    element.send_keys(char)
                    self.behavior.typing_delay()
                
                # Отправляем комментарий (Enter или кнопка)
                element.send_keys(Keys.RETURN)
                self.behavior.random_delay(1000, 3000)
                
                logger.info(f"Комментарий отправлен: {text}")
                return True
                
            except Exception as e:
                logger.debug(f"Селектор комментария {selector} не сработал: {e}")
                continue
        
        return False
    
    def _is_action_already_done(self, element, action_type):
        """Проверка, выполнено ли уже действие"""
        try:
            classes = element.get_attribute('class') or ''
            aria_pressed = element.get_attribute('aria-pressed')
            style = element.get_attribute('style') or ''
            
            # Проверяем признаки активного состояния
            active_indicators = ['active', 'selected', 'pressed', 'liked', 'followed']
            
            if any(indicator in classes.lower() for indicator in active_indicators):
                return True
            
            if aria_pressed == 'true':
                return True
            
            # Проверяем цвет (красный/синий часто означает активность)
            if 'color: rgb(255' in style or 'color: rgb(29, 161, 242)' in style:
                return True
            
            return False
            
        except:
            return False
    
    def _click_element(self, element, action_type):
        """Клик по элементу с человекоподобным поведением"""
        try:
            # Прокручиваем к элементу
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block: 'center'});", element
            )
            self.behavior.random_delay(300, 800)
            
            # Наводим мышь
            ActionChains(self.driver).move_to_element(element).perform()
            self.behavior.random_delay(200, 600)
            
            # Кликаем
            element.click()
            
            # Задержка после клика
            self.behavior.random_delay(1000, 3000)
            
            logger.info(f"Действие '{action_type}' выполнено успешно")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка клика для действия '{action_type}': {e}")
            return False
    
    def _get_random_comment(self):
        """Получение случайного комментария"""
        comments = [
            "Отличный контент! 👍",
            "Спасибо за информацию!",
            "Очень интересно!",
            "Классно! 😊",
            "Хорошая работа!",
            "Полезно, спасибо!",
            "Круто! 🔥",
            "Мне нравится!",
            "Супер! 👏",
            "Продолжайте в том же духе!"
        ]
        return random.choice(comments)
    
    def scroll_and_interact(self, action):
        """Прокрутка и взаимодействие с контентом"""
        scroll_count = action.get('count', 3)
        interaction_chance = action.get('interaction_chance', 0.3)
        
        for i in range(scroll_count):
            # Прокручиваем
            scroll_params = self.behavior.scroll_behavior('down', 
                                                        random.randint(300, 800))
            
            for j, delay in enumerate(scroll_params['delays']):
                self.driver.execute_script(
                    f"window.scrollBy(0, {scroll_params['step_size']});"
                )
                time.sleep(delay)
            
            # Случайно взаимодействуем с контентом
            if random.random() < interaction_chance:
                self.universal_like({'type': 'like'})
            
            # Пауза между прокрутками
            self.behavior.random_delay(2000, 5000)
        
        return True
