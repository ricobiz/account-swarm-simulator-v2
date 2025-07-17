// Content script для AI Orchestra
class AIOrchestraContent {
    constructor() {
        this.setupMessageListener();
        this.setupPageIntegration();
        this.detectAIService();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch(request.type) {
                case 'AI_ORCHESTRA_MESSAGE':
                    this.handleIncomingMessage(request.message);
                    break;
                
                case 'AI_ORCHESTRA_BROADCAST':
                    this.handleBroadcastMessage(request.message);
                    break;
                
                case 'GET_PAGE_TEXT':
                    sendResponse({ text: this.getPageText() });
                    break;
                
                case 'INJECT_TEXT':
                    this.injectText(request.text);
                    sendResponse({ success: true });
                    break;
                
                case 'SIMULATE_INPUT':
                    this.simulateUserInput(request.text);
                    sendResponse({ success: true });
                    break;
                
                case 'AUTO_INJECT_AND_SEND':
                    this.autoInjectAndSend(request.message, request.source);
                    sendResponse({ success: true });
                    break;
            }
        });
    }

    autoInjectAndSend(message, source) {
        // Показываем уведомление о входящем сообщении
        this.showNotification(`📨 Автосообщение от ${source}: ${message.substring(0, 50)}...`);
        
        // Добавляем небольшую задержку для имитации человеческого поведения
        setTimeout(() => {
            // Вставляем текст в поле ввода
            this.injectText(message);
            
            // Еще одна задержка перед отправкой
            setTimeout(() => {
                // Автоматически отправляем сообщение
                const sendButton = document.querySelector(this.sendButtonSelector);
                if (sendButton && !sendButton.disabled) {
                    sendButton.click();
                    console.log(`🚀 Автоотправка в ${this.getServiceName()}: ${message.substring(0, 50)}...`);
                } else {
                    console.log(`❌ Кнопка отправки не найдена в ${this.getServiceName()}`);
                }
            }, 1000 + Math.random() * 2000); // Случайная задержка 1-3 секунды
        }, 500 + Math.random() * 1000); // Случайная задержка 0.5-1.5 секунды
    }

    setupPageIntegration() {
        // Добавляем индикатор AI Orchestra на страницу
        this.addOrchestraIndicator();
        
        // Наблюдаем за изменениями в DOM
        this.observePageChanges();
        
        // Добавляем горячие клавиши
        this.setupHotkeys();
    }

    detectAIService() {
        const url = window.location.hostname;
        let serviceType = 'unknown';
        
        if (url.includes('openai.com') || url.includes('chat.openai.com')) {
            serviceType = 'chatgpt';
        } else if (url.includes('claude.ai')) {
            serviceType = 'claude';
        } else if (url.includes('bard.google.com')) {
            serviceType = 'bard';
        } else if (url.includes('bing.com')) {
            serviceType = 'bing';
        } else if (url.includes('perplexity.ai')) {
            serviceType = 'perplexity';
        }
        
        this.serviceType = serviceType;
        this.setupServiceSpecificIntegration();
    }

    setupServiceSpecificIntegration() {
        switch(this.serviceType) {
            case 'chatgpt':
                this.setupChatGPTIntegration();
                break;
            case 'claude':
                this.setupClaudeIntegration();
                break;
            case 'bard':
                this.setupBardIntegration();
                break;
            case 'bing':
                this.setupBingIntegration();
                break;
            case 'perplexity':
                this.setupPerplexityIntegration();
                break;
        }
    }

    setupChatGPTIntegration() {
        this.inputSelector = 'textarea[data-id]';
        this.sendButtonSelector = 'button[data-testid="send-button"]';
        this.messagesSelector = '[data-message-author-role]';
    }

    setupClaudeIntegration() {
        this.inputSelector = 'div[contenteditable="true"]';
        this.sendButtonSelector = 'button[aria-label="Send Message"]';
        this.messagesSelector = '.font-claude-message';
    }

    setupBardIntegration() {
        this.inputSelector = 'rich-textarea textarea';
        this.sendButtonSelector = 'button[aria-label="Send message"]';
        this.messagesSelector = '.model-response-text';
    }

    setupBingIntegration() {
        this.inputSelector = '#searchbox';
        this.sendButtonSelector = '#search_icon';
        this.messagesSelector = '.ac-textBlock';
    }

    setupPerplexityIntegration() {
        this.inputSelector = 'textarea[placeholder*="Ask"]';
        this.sendButtonSelector = 'button[aria-label="Submit"]';
        this.messagesSelector = '.prose';
    }

    addOrchestraIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'ai-orchestra-indicator';
        indicator.innerHTML = '🎼';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            z-index: 10000;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        indicator.addEventListener('click', () => {
            this.showOrchestraPanel();
        });
        
        indicator.addEventListener('mouseenter', () => {
            indicator.style.transform = 'scale(1.1)';
        });
        
        indicator.addEventListener('mouseleave', () => {
            indicator.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(indicator);
    }

    showOrchestraPanel() {
        if (document.getElementById('ai-orchestra-panel')) {
            document.getElementById('ai-orchestra-panel').remove();
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'ai-orchestra-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10001;
            padding: 1rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        panel.innerHTML = `
            <div style="border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: #333;">🎼 AI Orchestra</h3>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">
                    Сервис: ${this.getServiceName()}
                </p>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; font-weight: bold; margin-bottom: 0.5rem;">
                    Быстрая отправка:
                </label>
                <textarea id="quickMessage" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; resize: vertical;" rows="3" placeholder="Введите сообщение..."></textarea>
                <button id="sendQuickMessage" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                    Отправить
                </button>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <button id="extractText" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-bottom: 0.5rem;">
                    📋 Извлечь текст страницы
                </button>
                <button id="openOrchestra" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                    🎼 Открыть Orchestra
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Обработчики событий
        document.getElementById('sendQuickMessage').addEventListener('click', () => {
            const text = document.getElementById('quickMessage').value;
            if (text.trim()) {
                this.simulateUserInput(text);
                document.getElementById('quickMessage').value = '';
            }
        });
        
        document.getElementById('extractText').addEventListener('click', () => {
            const text = this.getPageText();
            this.copyToClipboard(text);
            this.showNotification('Текст скопирован в буфер обмена');
        });
        
        document.getElementById('openOrchestra').addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: 'OPEN_ORCHESTRA' });
        });
        
        // Закрытие панели при клике вне её
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && e.target.id !== 'ai-orchestra-indicator') {
                    panel.remove();
                }
            }, { once: true });
        }, 100);
    }

    getServiceName() {
        const names = {
            'chatgpt': 'ChatGPT',
            'claude': 'Claude',
            'bard': 'Bard',
            'bing': 'Bing Chat',
            'perplexity': 'Perplexity',
            'unknown': 'Неизвестный сервис'
        };
        return names[this.serviceType] || 'Неизвестный сервис';
    }

    observePageChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    // Реагируем на новые сообщения
                    this.onNewContent(mutation.addedNodes);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    onNewContent(addedNodes) {
        // Автоматический перехват новых ответов ИИ
        setTimeout(() => {
            this.detectAndForwardAIResponse(addedNodes);
        }, 1000); // Даем время на полную загрузку сообщения
    }

    detectAndForwardAIResponse(addedNodes) {
        let newAIMessage = this.extractLatestAIMessage();
        
        if (newAIMessage && newAIMessage !== this.lastProcessedMessage) {
            this.lastProcessedMessage = newAIMessage;
            console.log(`🤖 Новый ответ от ${this.getServiceName()}:`, newAIMessage);
            
            // Отправляем сообщение в Orchestra для автоматической пересылки
            this.forwardToOrchestra(newAIMessage);
        }
    }

    extractLatestAIMessage() {
        const messages = document.querySelectorAll(this.messagesSelector);
        if (messages.length === 0) return null;
        
        // Получаем последнее сообщение от ИИ (не от пользователя)
        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (this.isAIMessage(message)) {
                const text = message.textContent.trim();
                if (text.length > 10) { // Фильтруем слишком короткие сообщения
                    return text;
                }
            }
        }
        return null;
    }

    isAIMessage(messageElement) {
        const text = messageElement.textContent.toLowerCase();
        const classList = messageElement.className.toLowerCase();
        
        // Определяем, является ли сообщение от ИИ
        switch(this.serviceType) {
            case 'chatgpt':
                return messageElement.hasAttribute('data-message-author-role') && 
                       messageElement.getAttribute('data-message-author-role') === 'assistant';
            case 'claude':
                return classList.includes('claude') || classList.includes('assistant');
            case 'bard':
                return classList.includes('model-response') || classList.includes('response');
            case 'bing':
                return classList.includes('ac-textblock') && !classList.includes('user');
            case 'perplexity':
                return classList.includes('prose') && !messageElement.closest('[data-testid="user-message"]');
            default:
                // Общая эвристика - если не содержит маркеров пользователя
                return !classList.includes('user') && !classList.includes('human');
        }
    }

    forwardToOrchestra(message) {
        // Получаем настройки автопересылки из localStorage
        const orchestraSettings = JSON.parse(localStorage.getItem('aiOrchestra') || '{}');
        const autoForwardRules = orchestraSettings.autoForwardRules || [];
        
        // Проверяем правила автопересылки
        autoForwardRules.forEach(rule => {
            if (this.matchesRule(message, rule)) {
                this.executeAutoForward(message, rule);
            }
        });
        
        // Также отправляем в общий буфер Orchestra
        chrome.runtime.sendMessage({
            type: 'AI_RESPONSE_INTERCEPTED',
            source: this.getServiceName(),
            message: message,
            timestamp: Date.now(),
            url: window.location.href
        });
    }

    matchesRule(message, rule) {
        // Проверяем, подходит ли сообщение под правило
        if (rule.sourceService && rule.sourceService !== this.getServiceName()) {
            return false;
        }
        
        if (rule.trigger) {
            const trigger = rule.trigger.toLowerCase();
            return message.toLowerCase().includes(trigger);
        }
        
        return rule.autoForwardAll === true;
    }

    executeAutoForward(message, rule) {
        console.log(`🔄 Автопересылка: ${this.getServiceName()} → ${rule.targetService}`);
        
        // Форматируем сообщение для пересылки
        const forwardedMessage = this.formatForwardedMessage(message, rule);
        
        // Отправляем через background script
        chrome.runtime.sendMessage({
            type: 'AUTO_FORWARD_MESSAGE',
            targetService: rule.targetService,
            message: forwardedMessage,
            originalSource: this.getServiceName(),
            rule: rule
        });
        
        this.showNotification(`🔄 Автопересылка в ${rule.targetService}: ${message.substring(0, 50)}...`);
    }

    formatForwardedMessage(message, rule) {
        let formatted = message;
        
        if (rule.addSourcePrefix) {
            formatted = `[От ${this.getServiceName()}]: ${formatted}`;
        }
        
        if (rule.addInstructions) {
            formatted = `${rule.instructions}\n\n${formatted}`;
        }
        
        if (rule.translateTo) {
            formatted = `Переведи на ${rule.translateTo}: ${formatted}`;
        }
        
        return formatted;
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+O - открыть панель Orchestra
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                this.showOrchestraPanel();
            }
            
            // Ctrl+Shift+C - копировать текст страницы
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                const text = this.getPageText();
                this.copyToClipboard(text);
                this.showNotification('Текст скопирован');
            }
        });
    }

    handleIncomingMessage(message) {
        this.showNotification(`📨 Получено сообщение: ${message.substring(0, 50)}...`);
        
        // Автоматическая вставка сообщения (опционально)
        if (confirm('Вставить полученное сообщение в поле ввода?')) {
            this.injectText(message);
        }
    }

    handleBroadcastMessage(message) {
        this.showNotification(`📢 Broadcast: ${message.substring(0, 50)}...`);
    }

    injectText(text) {
        const inputField = document.querySelector(this.inputSelector);
        if (inputField) {
            if (inputField.tagName === 'TEXTAREA' || inputField.tagName === 'INPUT') {
                inputField.value = text;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                // Для contenteditable элементов
                inputField.textContent = text;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    simulateUserInput(text) {
        this.injectText(text);
        
        // Попытка автоматической отправки
        setTimeout(() => {
            const sendButton = document.querySelector(this.sendButtonSelector);
            if (sendButton && !sendButton.disabled) {
                sendButton.click();
            }
        }, 500);
    }

    getPageText() {
        // Извлечение текста сообщений
        const messages = document.querySelectorAll(this.messagesSelector);
        let text = '';
        
        messages.forEach((msg, index) => {
            const msgText = msg.textContent.trim();
            if (msgText) {
                text += `[Сообщение ${index + 1}]\n${msgText}\n\n`;
            }
        });
        
        return text || document.body.textContent.substring(0, 5000);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(() => {
            // Fallback для старых браузеров
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 10002;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Инициализация content script
new AIOrchestraContent();