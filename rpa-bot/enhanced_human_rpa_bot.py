
#!/usr/bin/env python3
"""
Расширенный RPA бот с полной эмуляцией человеческого поведения
"""

import os
import json
import time
import random
import logging
from typing import Dict, List, Any, Optional
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from browser_manager import AdvancedBrowserManager
from human_behavior import CloudHumanBehaviorSimulator
from action_handlers import ActionHandlers

logger = logging.getLogger(__name__)

class EnhancedHumanRPABot:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.browser_manager = AdvancedBrowserManager(config)
        self.human_behavior = CloudHumanBehaviorSimulator()
        self.driver = None
        self.wait = None
        self.action_handlers = None
        
        # Настройки человекоподобного поведения
        self.behavior_settings = {
            'mouse_movement': {
                'enabled': True,
                'natural_path': True,
                'speed': 75,
                'randomness': 50
            },
            'typing': {
                'enabled': True,
                'human_speed': True,
                'mistakes': False,
                'pauses_between_words': True
            },
            'delays': {
                'enabled': True,
                'random_range': [100, 500],
                'reading_pauses': True,
                'thinking_pauses': True
            },
            'anti_detection': {
                'enabled': True,
                'user_agent_rotation': True,
                'viewport_variation': True,
                'canvas_fingerprint': True
            },
            'advanced': {
                'scroll_behavior': True,
                'focus_simulation': True,
                'page_interaction': False,
                'background_activity': False
            }
        }
        
        # Статистика выполнения
        self.execution_stats = {
            'mouse_paths': 0,
            'random_delays': 0,
            'natural_clicks': 0,
            'typing_corrections': 0,
            'scroll_events': 0,
            'focus_changes': 0
        }

    def setup_browser(self, platform: str = 'universal', proxy: str = None) -> bool:
        """Настройка браузера для конкретной платформы"""
        try:
            self.driver, self.wait = self.browser_manager.create_browser(platform, proxy)
            self.action_handlers = ActionHandlers(self.driver, self.wait, self.human_behavior)
            
            # Применяем дополнительные настройки человекоподобности
            self._apply_human_behavior_settings()
            
            logger.info(f"Браузер настроен для платформы: {platform}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка настройки браузера: {e}")
            return False

    def _apply_human_behavior_settings(self):
        """Применение настроек человекоподобного поведения"""
        try:
            # Инъекция скриптов для дополнительной маскировки
            self.driver.execute_script("""
                // Эмуляция естественного поведения пользователя
                
                // Случайные события мыши
                setInterval(() => {
                    if (Math.random() < 0.1) {
                        const event = new MouseEvent('mousemove', {
                            clientX: Math.random() * window.innerWidth,
                            clientY: Math.random() * window.innerHeight
                        });
                        document.dispatchEvent(event);
                    }
                }, 2000 + Math.random() * 3000);
                
                // Эмуляция активности пользователя
                let lastActivity = Date.now();
                
                ['click', 'keydown', 'scroll'].forEach(eventType => {
                    document.addEventListener(eventType, () => {
                        lastActivity = Date.now();
                    });
                });
                
                // Периодические "микродвижения" мыши
                setInterval(() => {
                    if (Math.random() < 0.3) {
                        const event = new MouseEvent('mousemove', {
                            clientX: Math.random() * 10,
                            clientY: Math.random() * 10
                        });
                        document.dispatchEvent(event);
                    }
                }, 5000 + Math.random() * 10000);
            """)
            
            logger.info("Настройки человекоподобного поведения применены")
            
        except Exception as e:
            logger.warning(f"Не удалось применить настройки поведения: {e}")

    def execute_scenario(self, scenario: Dict[str, Any], behavior_level: str = 'normal') -> Dict[str, Any]:
        """Выполнение сценария с заданным уровнем человекоподобности"""
        try:
            scenario_name = scenario.get('name', 'Unnamed Scenario')
            actions = scenario.get('actions', [])
            platform = scenario.get('platform', 'universal')
            
            logger.info(f"Начинаем выполнение сценария: {scenario_name}")
            logger.info(f"Платформа: {platform}, Уровень поведения: {behavior_level}")
            
            # Настройка поведения в зависимости от уровня
            self._configure_behavior_level(behavior_level)
            
            # Настройка браузера
            if not self.setup_browser(platform):
                return {'success': False, 'error': 'Не удалось настроить браузер'}
            
            # Выполнение действий
            results = []
            for i, action in enumerate(actions):
                try:
                    logger.info(f"Выполняем действие {i+1}/{len(actions)}: {action.get('type', 'unknown')}")
                    
                    # Предварительная пауза с человекоподобным поведением
                    await self._pre_action_behavior(action)
                    
                    # Выполнение основного действия
                    result = await self._execute_action(action)
                    results.append(result)
                    
                    # Постобработка с человекоподобным поведением
                    await self._post_action_behavior(action, result)
                    
                    # Обновление статистики
                    self._update_execution_stats(action)
                    
                except Exception as e:
                    logger.error(f"Ошибка выполнения действия {i+1}: {e}")
                    results.append({'success': False, 'error': str(e)})
            
            # Финальная статистика
            success_count = sum(1 for r in results if r.get('success', False))
            
            return {
                'success': success_count == len(actions),
                'total_actions': len(actions),
                'successful_actions': success_count,
                'failed_actions': len(actions) - success_count,
                'execution_stats': self.execution_stats.copy(),
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Критическая ошибка выполнения сценария: {e}")
            return {'success': False, 'error': str(e)}
        
        finally:
            if self.driver:
                self.browser_manager.close_browser()

    def _configure_behavior_level(self, level: str):
        """Настройка уровня человекоподобного поведения"""
        if level == 'minimal':
            self.behavior_settings.update({
                'mouse_movement': {'enabled': True, 'natural_path': False, 'speed': 90, 'randomness': 20},
                'typing': {'enabled': True, 'human_speed': False, 'mistakes': False, 'pauses_between_words': False},
                'delays': {'enabled': True, 'random_range': [50, 200], 'reading_pauses': False, 'thinking_pauses': False},
                'advanced': {'scroll_behavior': False, 'focus_simulation': False, 'page_interaction': False, 'background_activity': False}
            })
        elif level == 'normal':
            # Используем стандартные настройки
            pass
        elif level == 'advanced':
            self.behavior_settings.update({
                'mouse_movement': {'enabled': True, 'natural_path': True, 'speed': 60, 'randomness': 80},
                'typing': {'enabled': True, 'human_speed': True, 'mistakes': True, 'pauses_between_words': True},
                'delays': {'enabled': True, 'random_range': [200, 1000], 'reading_pauses': True, 'thinking_pauses': True},
                'advanced': {'scroll_behavior': True, 'focus_simulation': True, 'page_interaction': True, 'background_activity': True}
            })

    async def _pre_action_behavior(self, action: Dict[str, Any]):
        """Поведение перед выполнением действия"""
        if not self.behavior_settings['delays']['enabled']:
            return
        
        # Случайная задержка
        delay_range = self.behavior_settings['delays']['random_range']
        delay = random.uniform(delay_range[0], delay_range[1]) / 1000
        time.sleep(delay)
        self.execution_stats['random_delays'] += 1
        
        # Случайные движения мыши
        if self.behavior_settings['mouse_movement']['enabled'] and random.random() < 0.3:
            self._random_mouse_movement()
        
        # Эмуляция чтения для некоторых действий
        if (self.behavior_settings['delays']['reading_pauses'] and 
            action.get('type') in ['click', 'type'] and 
            random.random() < 0.4):
            reading_delay = random.uniform(0.5, 2.0)
            time.sleep(reading_delay)

    async def _execute_action(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Выполнение основного действия"""
        action_type = action.get('type', 'unknown')
        
        try:
            if action_type == 'click':
                return await self._execute_human_click(action)
            elif action_type == 'type':
                return await self._execute_human_type(action)
            elif action_type == 'wait':
                return await self._execute_human_wait(action)
            elif action_type == 'scroll':
                return await self._execute_human_scroll(action)
            elif action_type == 'hover':
                return await self._execute_human_hover(action)
            else:
                return {'success': False, 'error': f'Неизвестный тип действия: {action_type}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _execute_human_click(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Человекоподобный клик"""
        try:
            element_info = action.get('element', {})
            x, y = element_info.get('x', 0), element_info.get('y', 0)
            
            # Добавляем случайное смещение для естественности
            if self.behavior_settings['mouse_movement']['randomness'] > 0:
                offset_range = self.behavior_settings['mouse_movement']['randomness'] / 10
                x += random.uniform(-offset_range, offset_range)
                y += random.uniform(-offset_range, offset_range)
            
            # Плавное движение мыши к цели
            if self.behavior_settings['mouse_movement']['natural_path']:
                await self._move_mouse_naturally(x, y)
            
            # Человекоподобная пауза перед кликом
            pre_click_delay = random.uniform(0.1, 0.5)
            time.sleep(pre_click_delay)
            
            # Выполнение клика
            ActionChains(self.driver).move_by_offset(int(x), int(y)).click().perform()
            
            # Пауза после клика
            post_click_delay = random.uniform(0.2, 0.8)
            time.sleep(post_click_delay)
            
            self.execution_stats['natural_clicks'] += 1
            
            return {'success': True, 'action': 'click', 'coordinates': (x, y)}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _execute_human_type(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Человекоподобная печать"""
        try:
            text = action.get('value', '')
            element_info = action.get('element', {})
            
            # Находим элемент для ввода (если есть селектор)
            if 'selector' in element_info:
                element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, element_info['selector'])))
                element.clear()
                target_element = element
            else:
                target_element = self.driver.switch_to.active_element
            
            # Человекоподобная печать
            if self.behavior_settings['typing']['human_speed']:
                for i, char in enumerate(text):
                    # Случайные опечатки
                    if (self.behavior_settings['typing']['mistakes'] and 
                        random.random() < 0.05 and i > 0):
                        # Вводим неправильный символ
                        wrong_char = random.choice('qwertyuiopasdfghjklzxcvbnm')
                        target_element.send_keys(wrong_char)
                        time.sleep(random.uniform(0.1, 0.3))
                        # Исправляем
                        target_element.send_keys('\b')
                        time.sleep(random.uniform(0.2, 0.5))
                        self.execution_stats['typing_corrections'] += 1
                    
                    # Вводим правильный символ
                    target_element.send_keys(char)
                    
                    # Человекоподобная задержка между символами
                    if char == ' ' and self.behavior_settings['typing']['pauses_between_words']:
                        delay = random.uniform(0.1, 0.4)
                    else:
                        delay = random.uniform(0.05, 0.2)
                    
                    time.sleep(delay)
            else:
                target_element.send_keys(text)
            
            return {'success': True, 'action': 'type', 'text': text}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _execute_human_scroll(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Человекоподобный скролл"""
        try:
            direction = action.get('direction', 'down')
            amount = action.get('amount', 300)
            
            if self.behavior_settings['advanced']['scroll_behavior']:
                # Естественный скролл небольшими порциями
                steps = random.randint(3, 6)
                step_size = amount // steps
                
                for i in range(steps):
                    scroll_amount = step_size * (1 if direction == 'down' else -1)
                    self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
                    
                    # Пауза между шагами скролла
                    delay = random.uniform(0.1, 0.4)
                    time.sleep(delay)
                    
                # Иногда останавливаемся и "читаем"
                if random.random() < 0.3:
                    reading_pause = random.uniform(1.0, 3.0)
                    time.sleep(reading_pause)
            else:
                # Обычный скролл
                scroll_amount = amount * (1 if direction == 'down' else -1)
                self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
            
            self.execution_stats['scroll_events'] += 1
            
            return {'success': True, 'action': 'scroll', 'direction': direction, 'amount': amount}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _execute_human_wait(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Человекоподобное ожидание"""
        try:
            base_duration = action.get('duration', 1000) / 1000  # Конвертируем в секунды
            
            # Добавляем случайную вариацию ±20%
            if self.behavior_settings['delays']['enabled']:
                variation = base_duration * 0.2
                actual_duration = base_duration + random.uniform(-variation, variation)
            else:
                actual_duration = base_duration
            
            # Во время ожидания можем имитировать активность
            if (self.behavior_settings['advanced']['background_activity'] and 
                actual_duration > 2.0):
                # Разбиваем ожидание на части с активностью
                parts = int(actual_duration // 2)
                part_duration = actual_duration / parts
                
                for _ in range(parts):
                    time.sleep(part_duration)
                    if random.random() < 0.3:
                        self._random_mouse_movement()
            else:
                time.sleep(actual_duration)
            
            return {'success': True, 'action': 'wait', 'duration': actual_duration}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _execute_human_hover(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Человекоподобное наведение"""
        try:
            element_info = action.get('element', {})
            x, y = element_info.get('x', 0), element_info.get('y', 0)
            
            # Плавное движение к элементу
            if self.behavior_settings['mouse_movement']['natural_path']:
                await self._move_mouse_naturally(x, y)
            
            # Наведение
            ActionChains(self.driver).move_by_offset(int(x), int(y)).perform()
            
            # Пауза наведения
            hover_duration = random.uniform(0.5, 2.0)
            time.sleep(hover_duration)
            
            return {'success': True, 'action': 'hover', 'coordinates': (x, y)}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def _move_mouse_naturally(self, target_x: float, target_y: float):
        """Естественное движение мыши"""
        try:
            # Генерируем естественный путь
            current_pos = self.driver.execute_script("return [window.mouseX || 0, window.mouseY || 0];")
            start_x, start_y = current_pos[0], current_pos[1]
            
            # Количество шагов зависит от расстояния
            distance = ((target_x - start_x) ** 2 + (target_y - start_y) ** 2) ** 0.5
            steps = max(3, min(15, int(distance / 50)))
            
            for i in range(1, steps + 1):
                progress = i / steps
                
                # Базовая интерполяция
                x = start_x + (target_x - start_x) * progress
                y = start_y + (target_y - start_y) * progress
                
                # Добавляем естественные отклонения
                if self.behavior_settings['mouse_movement']['randomness'] > 0:
                    noise_factor = self.behavior_settings['mouse_movement']['randomness'] / 100
                    noise_x = random.uniform(-20, 20) * noise_factor * (1 - abs(progress - 0.5) * 2)
                    noise_y = random.uniform(-15, 15) * noise_factor * (1 - abs(progress - 0.5) * 2)
                    x += noise_x
                    y += noise_y
                
                # Движение мыши
                ActionChains(self.driver).move_by_offset(int(x), int(y)).perform()
                
                # Задержка между движениями
                speed_factor = self.behavior_settings['mouse_movement']['speed'] / 100
                delay = (1 - speed_factor) * random.uniform(0.01, 0.03)
                time.sleep(delay)
            
            self.execution_stats['mouse_paths'] += 1
            
        except Exception as e:
            logger.warning(f"Ошибка естественного движения мыши: {e}")

    def _random_mouse_movement(self):
        """Случайное движение мыши для имитации активности"""
        try:
            # Небольшое случайное движение
            offset_x = random.randint(-50, 50)
            offset_y = random.randint(-30, 30)
            
            ActionChains(self.driver).move_by_offset(offset_x, offset_y).perform()
            
        except Exception as e:
            logger.warning(f"Ошибка случайного движения мыши: {e}")

    async def _post_action_behavior(self, action: Dict[str, Any], result: Dict[str, Any]):
        """Поведение после выполнения действия"""
        if not result.get('success', False):
            return
        
        # Случайная пауза после успешного действия
        if self.behavior_settings['delays']['thinking_pauses'] and random.random() < 0.2:
            thinking_delay = random.uniform(0.5, 1.5)
            time.sleep(thinking_delay)
        
        # Имитация фокуса страницы
        if self.behavior_settings['advanced']['focus_simulation'] and random.random() < 0.1:
            self.driver.execute_script("""
                window.dispatchEvent(new Event('focus'));
                document.dispatchEvent(new Event('visibilitychange'));
            """)
            self.execution_stats['focus_changes'] += 1
        
        # Случайные взаимодействия со страницей
        if self.behavior_settings['advanced']['page_interaction'] and random.random() < 0.05:
            await self._random_page_interaction()

    async def _random_page_interaction(self):
        """Случайные взаимодействия со страницей"""
        try:
            interactions = [
                lambda: self.driver.execute_script("window.scrollBy(0, Math.random() * 100 - 50);"),
                lambda: ActionChains(self.driver).move_by_offset(random.randint(-10, 10), random.randint(-10, 10)).perform(),
                lambda: self.driver.execute_script("document.title; // Чтение заголовка")
            ]
            
            interaction = random.choice(interactions)
            interaction()
            
        except Exception as e:
            logger.warning(f"Ошибка случайного взаимодействия: {e}")

    def _update_execution_stats(self, action: Dict[str, Any]):
        """Обновление статистики выполнения"""
        # Статистика обновляется в соответствующих методах выполнения действий
        pass

    def get_execution_stats(self) -> Dict[str, Any]:
        """Получение статистики выполнения"""
        return self.execution_stats.copy()

    def update_behavior_settings(self, new_settings: Dict[str, Any]):
        """Обновление настроек поведения"""
        self.behavior_settings.update(new_settings)
        logger.info("Настройки человекоподобного поведения обновлены")

# Пример использования
if __name__ == "__main__":
    # Настройка логирования
    logging.basicConfig(level=logging.INFO)
    
    # Создание бота
    bot = EnhancedHumanRPABot()
    
    # Пример сценария
    example_scenario = {
        'name': 'Тестовый сценарий',
        'platform': 'instagram',
        'actions': [
            {
                'type': 'click',
                'element': {'x': 100, 'y': 200, 'description': 'Кнопка входа'}
            },
            {
                'type': 'type',
                'element': {'selector': 'input[name="username"]'},
                'value': 'test_user'
            },
            {
                'type': 'wait',
                'duration': 2000
            },
            {
                'type': 'scroll',
                'direction': 'down',
                'amount': 300
            }
        ]
    }
    
    # Выполнение с продвинутым уровнем человекоподобности
    result = bot.execute_scenario(example_scenario, 'advanced')
    print(json.dumps(result, indent=2, ensure_ascii=False))
