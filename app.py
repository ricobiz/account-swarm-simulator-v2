#!/usr/bin/env python3
"""
Простое RPA Bot приложение для Railway
"""

import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import time

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'status': 'healthy',
                'service': 'account-swarm-simulator',
                'timestamp': time.time()
            }
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Account Swarm Simulator</title>
            </head>
            <body>
                <h1>Account Swarm Simulator</h1>
                <p>RPA Bot Cloud Service is running!</p>
                <p>Status: <span style="color: green;">Active</span></p>
                <p>Version: 1.0.0</p>
                <p><a href="/health">Health Check</a></p>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

    def log_message(self, format, *args):
        # Подавляем логи HTTP сервера
        pass

def run_server():
    port = int(os.environ.get('PORT', 8080))
    server = HTTPServer(('0.0.0.0', port), HealthHandler)
    print(f"🚀 Account Swarm Simulator запущен на порту {port}")
    print(f"🌐 Доступен по адресу: http://0.0.0.0:{port}")
    print(f"💚 Health check: http://0.0.0.0:{port}/health")
    server.serve_forever()

if __name__ == '__main__':
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
    except Exception as e:
        print(f"❌ Ошибка: {e}")

