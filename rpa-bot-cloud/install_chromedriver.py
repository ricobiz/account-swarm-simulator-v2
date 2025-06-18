
#!/usr/bin/env python3
"""
Скрипт для установки ChromeDriver если автоматическая установка не сработала
"""

import os
import sys
import requests
import zipfile
import subprocess
from pathlib import Path

def get_chrome_version():
    """Получить версию Chrome"""
    try:
        result = subprocess.run(['google-chrome', '--version'], 
                              capture_output=True, text=True)
        version = result.stdout.strip().split()[-1]
        return '.'.join(version.split('.')[:3])
    except Exception as e:
        print(f"Не удалось получить версию Chrome: {e}")
        return "120.0.6099"  # Fallback версия

def download_chromedriver():
    """Скачать и установить ChromeDriver"""
    chrome_version = get_chrome_version()
    print(f"Версия Chrome: {chrome_version}")
    
    # Пробуем получить точную версию ChromeDriver
    try:
        response = requests.get(f"https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_{chrome_version}")
        chromedriver_version = response.text.strip()
    except:
        chromedriver_version = "120.0.6099.109"  # Fallback
    
    print(f"Версия ChromeDriver: {chromedriver_version}")
    
    # URL для скачивания
    url = f"https://storage.googleapis.com/chrome-for-testing-public/{chromedriver_version}/linux64/chromedriver-linux64.zip"
    
    try:
        print(f"Скачивание: {url}")
        response = requests.get(url)
        response.raise_for_status()
        
        # Сохранение и распаковка
        with open('/tmp/chromedriver.zip', 'wb') as f:
            f.write(response.content)
        
        with zipfile.ZipFile('/tmp/chromedriver.zip', 'r') as zip_ref:
            zip_ref.extractall('/tmp/')
        
        # Перемещение в /usr/local/bin/
        chromedriver_path = Path('/tmp/chromedriver-linux64/chromedriver')
        if chromedriver_path.exists():
            os.system('cp /tmp/chromedriver-linux64/chromedriver /usr/local/bin/')
            os.system('chmod +x /usr/local/bin/chromedriver')
            print("✅ ChromeDriver установлен успешно")
            return True
        else:
            print("❌ ChromeDriver не найден после распаковки")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка установки ChromeDriver: {e}")
        return False

if __name__ == "__main__":
    if download_chromedriver():
        sys.exit(0)
    else:
        sys.exit(1)
