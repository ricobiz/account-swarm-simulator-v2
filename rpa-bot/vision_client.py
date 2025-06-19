
#!/usr/bin/env python3
"""
OpenRouter Vision API клиент для распознавания элементов
"""

import base64
import json
import logging
import os
import requests
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class VisionClient:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY', '')
        self.base_url = 'https://openrouter.ai/api/v1/chat/completions'
        self.model = os.getenv('VISION_MODEL', 'openai/gpt-4o')  # gpt-4o, anthropic/claude-3-5-sonnet, google/gemini-pro-vision
        
        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY не установлен")
    
    def encode_image(self, image_path: str) -> str:
        """Кодирование изображения в base64"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Ошибка кодирования изображения: {e}")
            return ""
    
    def analyze_screenshot(self, screenshot_path: str, task_description: str) -> Dict:
        """Анализ скриншота с помощью Vision API"""
        if not self.api_key:
            return {'error': 'API ключ не настроен', 'coordinates': None, 'selector': None}
        
        try:
            # Кодируем изображение
            base64_image = self.encode_image(screenshot_path)
            if not base64_image:
                return {'error': 'Не удалось кодировать изображение', 'coordinates': None, 'selector': None}
            
            # Создаем промпт для анализа
            prompt = self._create_analysis_prompt(task_description)
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://rpa-bot.railway.app',
                'X-Title': 'RPA Bot Vision'
            }
            
            payload = {
                'model': self.model,
                'messages': [
                    {
                        'role': 'user',
                        'content': [
                            {
                                'type': 'text',
                                'text': prompt
                            },
                            {
                                'type': 'image_url',
                                'image_url': {
                                    'url': f'data:image/png;base64,{base64_image}'
                                }
                            }
                        ]
                    }
                ],
                'max_tokens': 1000,
                'temperature': 0.1
            }
            
            response = requests.post(self.base_url, headers=headers, 
                                   json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                return self._parse_vision_response(content)
            else:
                logger.error(f"Vision API ошибка: {response.status_code} - {response.text}")
                return {'error': f'API ошибка: {response.status_code}', 'coordinates': None, 'selector': None}
                
        except Exception as e:
            logger.error(f"Ошибка анализа скриншота: {e}")
            return {'error': str(e), 'coordinates': None, 'selector': None}
    
    def _create_analysis_prompt(self, task_description: str) -> str:
        """Создание промпта для анализа"""
        return f"""
Analyze this screenshot and find the element for: {task_description}

Please respond in this exact JSON format:
{{
    "found": true/false,
    "coordinates": {{"x": pixel_x, "y": pixel_y}},
    "selector": "css_selector_if_possible",
    "confidence": 0.0-1.0,
    "description": "detailed description of what was found",
    "reasoning": "explanation of how you identified the element"
}}

Task: {task_description}

Requirements:
- Look for buttons, links, input fields, or interactive elements
- Provide pixel coordinates (x, y) from top-left corner
- Try to suggest a CSS selector if possible
- Be precise with coordinates - they will be used for clicking
- If multiple similar elements exist, choose the most prominent one
- Consider common UI patterns (like like buttons, share buttons, etc.)
"""
    
    def _parse_vision_response(self, content: str) -> Dict:
        """Парсинг ответа от Vision API"""
        try:
            # Попытка извлечь JSON из ответа
            if '```json' in content:
                json_start = content.find('```json') + 7
                json_end = content.find('```', json_start)
                json_content = content[json_start:json_end].strip()
            elif '{' in content and '}' in content:
                json_start = content.find('{')
                json_end = content.rfind('}') + 1
                json_content = content[json_start:json_end]
            else:
                json_content = content
            
            parsed = json.loads(json_content)
            
            return {
                'found': parsed.get('found', False),
                'coordinates': parsed.get('coordinates'),
                'selector': parsed.get('selector'),
                'confidence': parsed.get('confidence', 0.0),
                'description': parsed.get('description', ''),
                'reasoning': parsed.get('reasoning', ''),
                'error': None
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга JSON ответа: {e}")
            logger.error(f"Содержимое ответа: {content}")
            
            # Fallback: попытка извлечь координаты из текста
            coordinates = self._extract_coordinates_from_text(content)
            return {
                'found': coordinates is not None,
                'coordinates': coordinates,
                'selector': None,
                'confidence': 0.5 if coordinates else 0.0,
                'description': content[:200],
                'reasoning': 'Extracted from text response',
                'error': f'JSON parse error: {str(e)}'
            }
    
    def _extract_coordinates_from_text(self, text: str) -> Optional[Dict]:
        """Извлечение координат из текстового ответа"""
        import re
        
        # Поиск паттернов координат
        patterns = [
            r'x[:\s]*(\d+).*y[:\s]*(\d+)',
            r'(\d+)[,\s]+(\d+)',
            r'\((\d+),\s*(\d+)\)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    x, y = int(match.group(1)), int(match.group(2))
                    return {'x': x, 'y': y}
                except (ValueError, IndexError):
                    continue
        
        return None

    def test_connection(self) -> bool:
        """Тест подключения к Vision API"""
        if not self.api_key:
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': self.model,
                'messages': [{'role': 'user', 'content': 'Test connection'}],
                'max_tokens': 10
            }
            
            response = requests.post(self.base_url, headers=headers, 
                                   json=payload, timeout=10)
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Ошибка тестирования Vision API: {e}")
            return False
