
#!/usr/bin/env python3
"""
Специализированный обработчик для Telegram автоматизации
"""

import time
import logging
import random
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

logger = logging.getLogger(__name__)

class TelegramHandler:
    def __init__(self, driver, wait, behavior_simulator):
        self.driver = driver
        self.wait = wait
        self.behavior = behavior_simulator
        
        # Селекторы для Telegram Web
        self.selectors = {
            'like_button': [
                'button[aria-label*="like"]',
                '.btn-reaction',
                '[data-reaction="👍"]',
                '.reaction-button',
                'button:contains("👍")'
            ],
            'message_container': [
                '.message',
                '.message-container',
                '[data-message-id]'
            ],
            'channel_post': [
                '.channel-post',
                '.post-container'
            ]
        }
    
    def telegram_like(self, action):
        """Лайк поста в Telegram с несколькими стратегиями"""
        post_id = action.get('postId', '')
        channel = action.get('channel', '')
        
        logger.info(f"Попытка лайка поста {post_id} в канале {channel}")
        
        try:
            # Стратегия 1: Поиск по ID поста
            if post_id:
                success = self._like_by_post_id(post_id)
                if success:
                    return True
            
            # Стратегия 2: Поиск последнего поста
            success = self._like_latest_post()
            if success:
                return True
            
            # Стратегия 3: Поиск любой кнопки лайка
            success = self._like_any_available()
            if success:
                return True
            
            logger.warning("Не удалось найти кнопку лайка ни одним способом")
            return False
            
        except Exception as e:
            logger.error(f"Ошибка лайка в Telegram: {e}")
            return False
    
    def _like_by_post_id(self, post_id):
        """Лайк по ID поста"""
        try:
            # Поиск контейнера поста
            post_selector = f'[data-message-id="{post_id}"], [data-post-id="{post_id}"]'
            post_element = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, post_selector))
            )
            
            # Поиск кнопки лайка в этом посте
            for like_selector in self.selectors['like_button']:
                try:
                    like_button = post_element.find_element(By.CSS_SELECTOR, like_selector)
                    if like_button.is_displayed() and like_button.is_enabled():
                        return self._perform_like_click(like_button)
                except:
                    continue
            
            return False
            
        except TimeoutException:
            logger.warning(f"Пост с ID {post_id} не найден")
            return False
    
    def _like_latest_post(self):
        """Лайк последнего поста"""
        try:
            # Поиск всех сообщений/постов
            for container_selector in self.selectors['message_container'] + self.selectors['channel_post']:
                try:
                    messages = self.driver.find_elements(By.CSS_SELECTOR, container_selector)
                    if messages:
                        # Берем последнее сообщение
                        latest_message = messages[-1]
                        
                        # Скроллим к нему
                        self.driver.execute_script("arguments[0].scrollIntoView();", latest_message)
                        self.behavior.random_delay(500, 1500)
                        
                        # Ищем кнопку лайка
                        for like_selector in self.selectors['like_button']:
                            try:
                                like_button = latest_message.find_element(By.CSS_SELECTOR, like_selector)
                                if like_button.is_displayed() and like_button.is_enabled():
                                    return self._perform_like_click(like_button)
                            except:
                                continue
                except:
                    continue
            
            return False
            
        except Exception as e:
            logger.error(f"Ошибка поиска последнего поста: {e}")
            return False
    
    def _like_any_available(self):
        """Лайк любой доступной кнопки"""
        try:
            for like_selector in self.selectors['like_button']:
                try:
                    like_buttons = self.driver.find_elements(By.CSS_SELECTOR, like_selector)
                    
                    for button in like_buttons:
                        if button.is_displayed() and button.is_enabled():
                            # Проверяем, что кнопка не уже нажата
                            if not self._is_already_liked(button):
                                return self._perform_like_click(button)
                except:
                    continue
            
            return False
            
        except Exception as e:
            logger.error(f"Ошибка поиска доступных лайков: {e}")
            return False
    
    def _is_already_liked(self, button):
        """Проверка, уже ли поставлен лайк"""
        try:
            # Проверяем классы кнопки
            classes = button.get_attribute('class') or ''
            if 'active' in classes.lower() or 'selected' in classes.lower():
                return True
            
            # Проверяем aria-pressed
            pressed = button.get_attribute('aria-pressed')
            if pressed == 'true':
                return True
            
            # Проверяем стили
            style = button.get_attribute('style') or ''
            if 'color: rgb(255' in style:  # Обычно активные кнопки красноватые
                return True
            
            return False
            
        except:
            return False
    
    def _perform_like_click(self, button):
        """Выполнение клика лайка с человекоподобным поведением"""
        try:
            # Прокрутим к кнопке
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
            self.behavior.random_delay(300, 800)
            
            # Наведем мышь
            from selenium.webdriver.common.action_chains import ActionChains
            ActionChains(self.driver).move_to_element(button).perform()
            self.behavior.random_delay(200, 600)
            
            # Кликнем
            button.click()
            
            # Подождем после клика
            self.behavior.random_delay(1000, 3000)
            
            logger.info("Лайк успешно поставлен")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка клика лайка: {e}")
            return False
    
    def scroll_to_find_post(self, post_id, max_scrolls=10):
        """Прокрутка для поиска конкретного поста"""
        for i in range(max_scrolls):
            # Проверяем, есть ли пост на экране
            try:
                post_selector = f'[data-message-id="{post_id}"], [data-post-id="{post_id}"]'
                self.driver.find_element(By.CSS_SELECTOR, post_selector)
                return True  # Пост найден
            except:
                pass
            
            # Скроллим вверх для поиска старых постов
            scroll_params = self.behavior.scroll_behavior('up', 400)
            for j, delay in enumerate(scroll_params['delays']):
                self.driver.execute_script(f"window.scrollBy(0, -{scroll_params['step_size']});")
                time.sleep(delay)
        
        return False  # Пост не найден после всех прокруток
