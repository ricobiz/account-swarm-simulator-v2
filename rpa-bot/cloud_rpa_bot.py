
#!/usr/bin/env python3
"""
Главный класс облачного RPA бота
"""

import time
import logging
import os
from browser_manager import CloudBrowserManager
from action_handlers import ActionHandlers
from telegram_handler import TelegramHandler
from human_behavior import CloudHumanBehaviorSimulator
from selenium.common.exceptions import TimeoutException

logger = logging.getLogger(__name__)

class CloudRPABot:
    def __init__(self):
        self.browser_manager = CloudBrowserManager()
        self.behavior = CloudHumanBehaviorSimulator()
        self.action_handlers = None
        self.telegram_handler = None
        
        logger.info("Облачный RPA бот инициализирован")
    
    def setup_browser(self, headless=True, proxy=None):
        """Настройка браузера для облака"""
        success = self.browser_manager.setup_browser(headless, proxy)
        if success:
            self.action_handlers = ActionHandlers(
                self.browser_manager.driver, 
                self.browser_manager.wait, 
                self.behavior
            )
            self.telegram_handler = TelegramHandler(
                self.browser_manager.driver,
                self.browser_manager.wait,
                self.behavior
            )
        return success
    
    def execute_action(self, action):
        """Выполнение действия с облачными оптимизациями"""
        action_type = action.get('type')
        logger.info(f"Выполнение облачного действия: {action_type}")
        
        try:
            if action_type == 'navigate':
                return self.action_handlers.navigate(action)
            elif action_type == 'click':
                return self.action_handlers.click(action)
            elif action_type == 'type':
                return self.action_handlers.type_text(action)
            elif action_type == 'wait':
                return self.action_handlers.wait(action)
            elif action_type == 'scroll':
                return self.action_handlers.scroll(action)
            elif action_type == 'key':
                return self.action_handlers.key_press(action)
            elif action_type == 'move':
                return self.action_handlers.move_mouse(action)
            elif action_type == 'check_element':
                return self.action_handlers.check_element(action)
            elif action_type == 'telegram_like':
                return self.telegram_handler.telegram_like(action)
            else:
                logger.warning(f"Неизвестный тип действия: {action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Ошибка выполнения облачного действия {action_type}: {e}")
            return False
    
    def execute_task(self, task):
        """Выполнение полной задачи в облаке"""
        start_time = time.time()
        task_id = task.get('taskId', 'unknown')
        completed_actions = 0
        
        logger.info(f"Начало выполнения облачной задачи: {task_id}")
        
        try:
            # Настройка браузера
            if not self.setup_browser():
                raise Exception("Не удалось настроить облачный браузер")
            
            # Переход на стартовую страницу
            if task.get('url'):
                self.browser_manager.driver.get(task['url'])
                self.behavior.random_delay(1000, 2000)
            
            actions = task.get('actions', [])
            
            # Выполнение действий
            for i, action in enumerate(actions):
                logger.info(f"Выполнение действия {i+1}/{len(actions)}: {action.get('type')}")
                
                if self.execute_action(action):
                    completed_actions += 1
                else:
                    logger.warning(f"Действие {i+1} не выполнено: {action}")
                
                # Проверка таймаута
                if time.time() - start_time > task.get('timeout', 60000) / 1000:
                    raise TimeoutException("Превышен таймаут выполнения задачи")
            
            execution_time = int((time.time() - start_time) * 1000)
            
            # Создание скриншота результата
            screenshot_path = f"screenshots/cloud_task_{task_id}_{int(time.time())}.png"
            os.makedirs('screenshots', exist_ok=True)
            
            try:
                self.browser_manager.driver.save_screenshot(screenshot_path)
            except Exception as e:
                logger.warning(f"Не удалось сохранить скриншот: {e}")
                screenshot_path = None
            
            # Успешный результат
            result = {
                'taskId': task_id,
                'success': True,
                'message': f'Облачная задача выполнена успешно. Завершено {completed_actions}/{len(actions)} действий',
                'executionTime': execution_time,
                'completedActions': completed_actions,
                'screenshot': screenshot_path,
                'data': {
                    'url': self.browser_manager.driver.current_url,
                    'title': self.browser_manager.driver.title
                },
                'environment': 'railway-cloud'
            }
            
            logger.info(f"Облачная задача {task_id} выполнена успешно за {execution_time}мс")
            return result
            
        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            
            # Результат с ошибкой
            result = {
                'taskId': task_id,
                'success': False,
                'message': 'Ошибка выполнения облачной задачи',
                'error': str(e),
                'executionTime': execution_time,
                'completedActions': completed_actions,
                'environment': 'railway-cloud'
            }
            
            logger.error(f"Ошибка выполнения облачной задачи {task_id}: {e}")
            return result
            
        finally:
            # Очистка ресурсов
            try:
                self.browser_manager.close()
            except Exception as e:
                logger.warning(f"Ошибка закрытия браузера: {e}")
