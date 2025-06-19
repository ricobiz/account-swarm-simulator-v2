
#!/usr/bin/env python3
"""
Симулятор человеческого поведения для облачного RPA бота
"""

import random
import time
import logging
from typing import Tuple, List

logger = logging.getLogger(__name__)

class CloudHumanBehaviorSimulator:
    def __init__(self):
        self.typing_speeds = [0.05, 0.15]  # секунды между символами
        self.mouse_speeds = [0.8, 1.5]    # секунды на движение
        self.scroll_patterns = ['smooth', 'natural', 'reading']
        
    def random_delay(self, min_ms: int = 100, max_ms: int = 1000):
        """Случайная задержка в миллисекундах"""
        delay = random.uniform(min_ms/1000, max_ms/1000)
        time.sleep(delay)
    
    def typing_delay(self):
        """Задержка между печатью символов"""
        delay = random.uniform(*self.typing_speeds)
        time.sleep(delay)
    
    def mouse_movement_delay(self):
        """Задержка для движения мыши"""
        delay = random.uniform(*self.mouse_speeds)
        time.sleep(delay)
    
    def reading_pause(self, text_length: int = 100):
        """Пауза для имитации чтения"""
        # Базовая пауза + время на чтение
        base_pause = random.uniform(0.5, 2.0)
        reading_time = text_length * random.uniform(0.01, 0.05)  # ~10-50мс на символ
        total_pause = base_pause + reading_time
        time.sleep(total_pause)
    
    def generate_mouse_path(self, start: Tuple[int, int], end: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Генерация естественного пути мыши"""
        steps = random.randint(3, 8)
        path = [start]
        
        start_x, start_y = start
        end_x, end_y = end
        
        for i in range(1, steps):
            progress = i / steps
            
            # Базовая интерполяция
            x = start_x + (end_x - start_x) * progress
            y = start_y + (end_y - start_y) * progress
            
            # Добавляем естественные отклонения
            noise_x = random.uniform(-20, 20) * (1 - abs(progress - 0.5) * 2)
            noise_y = random.uniform(-15, 15) * (1 - abs(progress - 0.5) * 2)
            
            x += noise_x
            y += noise_y
            
            path.append((int(x), int(y)))
        
        path.append(end)
        return path
    
    def scroll_behavior(self, direction: str = 'down', amount: int = 300) -> dict:
        """Генерация параметров естественного скролла"""
        pattern = random.choice(self.scroll_patterns)
        
        if pattern == 'smooth':
            # Плавный скролл небольшими шагами
            steps = random.randint(3, 6)
            step_size = amount // steps
            delays = [random.uniform(0.1, 0.3) for _ in range(steps)]
            
        elif pattern == 'natural':
            # Естественный скролл с паузами
            steps = random.randint(2, 4)
            step_size = amount // steps
            delays = [random.uniform(0.2, 0.8) for _ in range(steps)]
            
        else:  # reading
            # Скролл с паузами для чтения
            steps = 2
            step_size = amount // steps
            delays = [random.uniform(1.0, 3.0), random.uniform(0.5, 1.5)]
        
        return {
            'pattern': pattern,
            'steps': steps,
            'step_size': step_size,
            'delays': delays,
            'direction': direction
        }
    
    def click_behavior(self) -> dict:
        """Параметры естественного клика"""
        return {
            'pre_click_delay': random.uniform(0.1, 0.5),
            'click_duration': random.uniform(0.05, 0.15),
            'post_click_delay': random.uniform(0.2, 0.8),
            'double_click_chance': 0.05,  # 5% шанс случайного двойного клика
            'offset_x': random.randint(-3, 3),  # Небольшое смещение
            'offset_y': random.randint(-3, 3)
        }
