
#!/usr/bin/env python3
"""
Cloud version of RPA-bot optimized for Railway
"""

import json
import time
import logging
import requests
import os
import threading
from flask import Flask, request, jsonify
from datetime import datetime
from cloud_rpa_bot import CloudRPABot

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('rpa_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Cloud configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://izmgzstdgoswlozinmyk.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
BOT_PORT = int(os.getenv('PORT', 5000))  # Railway uses PORT variable

app = Flask(__name__)

# Global cloud RPA bot instance
cloud_rpa_bot = CloudRPABot()

def send_result_to_supabase(task_id, result):
    """Send result back to Supabase"""
    try:
        url = f"{SUPABASE_URL}/functions/v1/rpa-task"
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'taskId': task_id,
            'result': result
        }
        
        response = requests.put(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            logger.info(f"Cloud task result {task_id} successfully sent to Supabase")
        else:
            logger.error(f"Error sending result to Supabase: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Error sending result to Supabase: {e}")

@app.route('/health', methods=['GET'])
def health():
    """Cloud service health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0-cloud',
        'environment': 'railway'
    })

@app.route('/execute', methods=['POST'])
def execute_task():
    """Execute RPA task in cloud"""
    try:
        task = request.get_json()
        
        if not task:
            return jsonify({'error': 'Empty task'}), 400
        
        task_id = task.get('taskId')
        if not task_id:
            return jsonify({'error': 'Missing taskId'}), 400
        
        logger.info(f"Received cloud task for execution: {task_id}")
        
        def execute_and_send():
            result = cloud_rpa_bot.execute_task(task)
            send_result_to_supabase(task_id, result)
        
        thread = threading.Thread(target=execute_and_send)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': f'Cloud task {task_id} accepted for execution',
            'taskId': task_id,
            'environment': 'cloud'
        })
        
    except Exception as e:
        logger.error(f"Error receiving cloud task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    """Get cloud bot status"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'capabilities': [
            'navigate', 'click', 'type', 'wait', 
            'scroll', 'key', 'move', 'check_element'
        ],
        'environment': 'railway-cloud',
        'optimizations': [
            'headless-browser', 'fast-execution', 
            'cloud-optimized', 'selenium-only'
        ]
    })

if __name__ == '__main__':
    logger.info("Starting cloud RPA Bot server...")
    logger.info(f"Port: {BOT_PORT}")
    logger.info(f"Supabase URL: {SUPABASE_URL}")
    logger.info("Environment: Railway Cloud")
    
    os.makedirs('screenshots', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    app.run(host='0.0.0.0', port=BOT_PORT, debug=False)
