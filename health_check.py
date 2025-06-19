
#!/usr/bin/env python3
"""
Расширенная проверка здоровья для RPA-бота
"""

import subprocess
import sys
import json
import time
import os
import requests
from pathlib import Path

def check_chrome():
    """Проверка Chrome"""
    try:
        result = subprocess.run(['google-chrome', '--version', '--no-sandbox'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return {"status": "ok", "version": result.stdout.strip()}
        else:
            return {"status": "error", "message": "Chrome не запускается"}
    except Exception as e:
        return {"status": "error", "message": f"Chrome недоступен: {str(e)}"}

def check_python_deps():
    """Проверка Python зависимостей"""
    required_packages = [
        'selenium', 'undetected_chromedriver', 'fake_useragent', 
        'flask', 'requests', 'numpy', 'pandas', 'beautifulsoup4',
        'opencv-python', 'pillow', 'psutil'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        return {"status": "error", "missing": missing}
    else:
        return {"status": "ok", "packages": len(required_packages)}

def check_display():
    """Проверка виртуального дисплея"""
    display = os.environ.get('DISPLAY', ':99')
    try:
        result = subprocess.run(['xdpyinfo', '-display', display], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            return {"status": "ok", "display": display}
        else:
            return {"status": "error", "message": "Дисплей недоступен"}
    except Exception as e:
        return {"status": "warning", "message": f"Не удалось проверить дисплей: {str(e)}"}

def check_directories():
    """Проверка необходимых директорий"""
    dirs = ['screenshots', 'logs', 'profiles', 'extensions', 'downloads', 'frontend']
    missing = []
    
    for dir_name in dirs:
        dir_path = Path(f'/app/{dir_name}')
        if not dir_path.exists():
            missing.append(dir_name)
        elif not dir_path.is_dir():
            missing.append(f"{dir_name} (не директория)")
    
    if missing:
        return {"status": "warning", "missing": missing}
    else:
        return {"status": "ok", "directories": len(dirs)}

def check_rpa_service():
    """Проверка работы RPA сервиса"""
    try:
        response = requests.get('http://localhost:8080/health', timeout=5)
        if response.status_code == 200:
            return {"status": "ok", "response": response.json()}
        else:
            return {"status": "error", "message": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": f"Сервис недоступен: {str(e)}"}

def main():
    """Основная функция проверки"""
    print("🔍 Расширенная проверка здоровья универсального RPA-бота...")
    
    health_status = {
        "timestamp": time.time(),
        "overall_status": "ok",
        "checks": {}
    }
    
    # Проверка Chrome
    print("🌐 Проверка Chrome...")
    chrome_status = check_chrome()
    health_status["checks"]["chrome"] = chrome_status
    if chrome_status["status"] == "error":
        health_status["overall_status"] = "error"
    
    # Проверка Python зависимостей
    print("🐍 Проверка Python зависимостей...")
    deps_status = check_python_deps()
    health_status["checks"]["python_dependencies"] = deps_status
    if deps_status["status"] == "error":
        health_status["overall_status"] = "error"
    
    # Проверка дисплея
    print("🖥️  Проверка дисплея...")
    display_status = check_display()
    health_status["checks"]["display"] = display_status
    
    # Проверка директорий
    print("📁 Проверка директорий...")
    dirs_status = check_directories()
    health_status["checks"]["directories"] = dirs_status
    
    # Проверка RPA сервиса
    print("🤖 Проверка RPA сервиса...")
    rpa_status = check_rpa_service()
    health_status["checks"]["rpa_service"] = rpa_status
    
    # Вывод результата
    print("\n" + "="*50)
    print("РЕЗУЛЬТАТ ПРОВЕРКИ ЗДОРОВЬЯ")
    print("="*50)
    print(json.dumps(health_status, indent=2, ensure_ascii=False))
    
    if health_status["overall_status"] == "ok":
        print("\n✅ Все проверки пройдены успешно!")
        sys.exit(0)
    else:
        print("\n❌ Обнаружены проблемы!")
        sys.exit(1)

if __name__ == "__main__":
    main()
