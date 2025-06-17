
# RPA Integration Guide

## Обзор

Эта система поддерживает интеграцию с внешними RPA-ботами для выполнения сценариев с реальными движениями мыши и клавиатуры.

## Архитектура

1. **Веб-интерфейс** - настройка блоков с опцией "executeViaRPA"
2. **API сервер** - обработка задач и результатов RPA
3. **Внешний RPA-бот** - выполнение реальных действий мыши/клавиатуры
4. **База данных** - хранение задач и результатов

## Настройка RPA блоков

В конструкторе сценариев для любого блока можно включить опцию "Выполнить через RPA":

```javascript
{
  "executeViaRPA": true,
  // ... остальные настройки блока
}
```

## Структура RPA задачи

```json
{
  "taskId": "unique-task-id-12345",
  "url": "https://youtube.com",
  "actions": [
    {"type": "move", "x": 500, "y": 400},
    {"type": "click", "button": "left"},
    {"type": "type", "text": "Hello world!"},
    {"type": "wait", "duration": 2000},
    {"type": "scroll", "x": 0, "y": -100},
    {"type": "key", "key": "Enter"}
  ],
  "accountId": "account-uuid",
  "scenarioId": "scenario-uuid",
  "blockId": "block-uuid",
  "timeout": 60000
}
```

### Типы действий:

- **move** - перемещение мыши (x, y)
- **click** - клик мыши (button: "left"|"right"|"middle")
- **type** - ввод текста (text)
- **wait** - пауза (duration в мс)
- **scroll** - прокрутка (x, y в пикселях)
- **key** - нажатие клавиши (key)

## API Endpoints

### POST /rpa-task
Отправка новой задачи RPA-боту

### PUT /rpa-task
Получение результата от RPA-бота

### POST /rpa-status
Получение статуса выполнения задачи

## Пример RPA-бота на Python

```python
import requests
import time
import pyautogui
from flask import Flask, request, jsonify

app = Flask(__name__)

class RPABot:
    def __init__(self):
        # Настройки безопасности PyAutoGUI
        pyautogui.FAILSAFE = True
        pyautogui.PAUSE = 0.1

    def execute_action(self, action):
        """Выполнение одного действия"""
        action_type = action.get('type')
        
        if action_type == 'move':
            pyautogui.moveTo(action['x'], action['y'])
            
        elif action_type == 'click':
            button = action.get('button', 'left')
            if 'x' in action and 'y' in action:
                pyautogui.click(action['x'], action['y'], button=button)
            else:
                pyautogui.click(button=button)
                
        elif action_type == 'type':
            pyautogui.write(action['text'])
            
        elif action_type == 'wait':
            time.sleep(action['duration'] / 1000)
            
        elif action_type == 'scroll':
            pyautogui.scroll(action.get('y', 0))
            
        elif action_type == 'key':
            pyautogui.press(action['key'])

    def execute_task(self, task):
        """Выполнение полной задачи"""
        try:
            start_time = time.time()
            
            # Открываем URL (требует браузер)
            if task.get('url'):
                import webbrowser
                webbrowser.open(task['url'])
                time.sleep(3)  # Ждем загрузки
            
            completed_actions = 0
            
            # Выполняем действия
            for action in task['actions']:
                self.execute_action(action)
                completed_actions += 1
                time.sleep(0.1)  # Небольшая пауза между действиями
            
            execution_time = int((time.time() - start_time) * 1000)
            
            return {
                'taskId': task['taskId'],
                'success': True,
                'message': f'Выполнено {completed_actions} действий',
                'executionTime': execution_time,
                'completedActions': completed_actions
            }
            
        except Exception as e:
            return {
                'taskId': task['taskId'],
                'success': False,
                'message': 'Ошибка выполнения задачи',
                'error': str(e),
                'executionTime': int((time.time() - start_time) * 1000),
                'completedActions': completed_actions
            }

rpa_bot = RPABot()

@app.route('/execute', methods=['POST'])
def execute_task():
    """Получение и выполнение задачи"""
    task = request.get_json()
    
    # Выполняем задачу
    result = rpa_bot.execute_task(task)
    
    # Отправляем результат обратно в систему
    try:
        response = requests.put(
            'https://your-supabase-url.com/functions/v1/rpa-task',
            json={
                'taskId': task['taskId'],
                'result': result
            },
            headers={
                'Authorization': 'Bearer your-service-role-key',
                'Content-Type': 'application/json'
            }
        )
        print(f"Результат отправлен: {response.status_code}")
    except Exception as e:
        print(f"Ошибка отправки результата: {e}")
    
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': time.time()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## Установка RPA-бота

```bash
pip install pyautogui flask requests pillow

# Для Linux дополнительно:
sudo apt-get install python3-tk python3-dev

python rpa_bot.py
```

## Переменные окружения

В Supabase добавьте:
- `RPA_BOT_ENDPOINT` - URL вашего RPA-бота (например: http://localhost:5000)

## Безопасность

1. RPA-бот должен работать в изолированной среде
2. Используйте HTTPS для всех API вызовов
3. Добавьте аутентификацию для RPA-бота
4. Ограничьте доступ к RPA-боту по IP
5. Логируйте все действия RPA

## Мониторинг

Система автоматически отслеживает:
- Статус отправки задач
- Время выполнения
- Результаты и ошибки
- Логи всех RPA действий

## Альтернативные реализации

### AutoIt (Windows)
```autoit
#include <JSON.au3>
#include <WinAPIFiles.au3>

While True
    ; Проверяем новые задачи
    Local $response = HttpGet("http://your-server/api/rpa/pending")
    Local $tasks = Json_Decode($response)
    
    For $task In $tasks
        ExecuteTask($task)
    Next
    
    Sleep(1000)
WEnd

Func ExecuteTask($task)
    For $action In $task.actions
        Switch $action.type
            Case "click"
                MouseClick("left", $action.x, $action.y)
            Case "type"
                Send($action.text)
            Case "wait"
                Sleep($action.duration)
        EndSwitch
    Next
EndFunc
```

### Selenium WebDriver (альтернатива)
```python
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains

class SeleniumRPABot:
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.actions = ActionChains(self.driver)
    
    def execute_web_task(self, task):
        self.driver.get(task['url'])
        
        for action in task['actions']:
            if action['type'] == 'click':
                element = self.driver.find_element_by_xpath(f"//*[@data-x='{action['x']}']")
                element.click()
            elif action['type'] == 'type':
                element = self.driver.switch_to.active_element
                element.send_keys(action['text'])
```

## Поддержка и отладка

1. Проверьте логи в разделе "Мониторинг"
2. Убедитесь, что RPA-бот доступен по сети
3. Проверьте правильность URL в задачах
4. Тестируйте с простыми действиями сначала
