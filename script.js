class AIOrchestra {
    constructor() {
        this.windows = [];
        this.maxWindows = 6;
        this.chatVisible = false;
        this.routingRules = [];
        this.messageHistory = [];
        
        // Предустановленные позывные для ИИ-сервисов
        this.defaultCallsigns = [
            'GPT', 'CLAUDE', 'BARD', 'BING', 'PERPLX', 'GEMINI'
        ];
        
        // Популярные ИИ-сервисы
        this.aiServices = [
            { name: 'ChatGPT', url: 'https://chat.openai.com', callsign: 'GPT' },
            { name: 'Claude', url: 'https://claude.ai', callsign: 'CLAUDE' },
            { name: 'Bard', url: 'https://bard.google.com', callsign: 'BARD' },
            { name: 'Bing Chat', url: 'https://bing.com/chat', callsign: 'BING' },
            { name: 'Perplexity', url: 'https://perplexity.ai', callsign: 'PERPLX' },
            { name: 'Gemini', url: 'https://gemini.google.com', callsign: 'GEMINI' }
        ];
        
        this.initializeEventListeners();
        this.loadSettings();
        this.addInitialWindow();
    }
    
    initializeEventListeners() {
        // Логируем инициализацию
        if (window.debugLog) window.debugLog('🔧 Инициализация обработчиков событий...');
        
        // Кнопки управления
        document.getElementById('addWindow').addEventListener('click', () => {
            if (window.debugLog) window.debugLog('🆕 Добавление нового окна');
            this.addWindow();
        });
        document.getElementById('toggleChat').addEventListener('click', () => {
            if (window.debugLog) window.debugLog('💬 Переключение чата');
            this.toggleChat();
        });
        document.getElementById('settings').addEventListener('click', () => {
            if (window.debugLog) window.debugLog('⚙️ Открытие настроек');
            this.openSettings();
        });
        document.getElementById('closeSettings').addEventListener('click', () => {
            if (window.debugLog) window.debugLog('❌ Закрытие настроек');
            this.closeSettings();
        });
        
        // Чат
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('clearChat').addEventListener('click', () => this.clearChat());
        
        // Настройки
        document.getElementById('addRule').addEventListener('click', () => this.addRoutingRule());
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.addWindow();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleChat();
                        break;
                    case ',':
                        e.preventDefault();
                        this.openSettings();
                        break;
                }
            }
        });
    }
    
    addWindow(service = null) {
        if (this.windows.length >= this.maxWindows) {
            this.showMessage('Достигнуто максимальное количество окон (6)', 'system');
            return;
        }
        
        const windowId = 'window-' + Date.now();
        const callsign = service ? service.callsign : this.defaultCallsigns[this.windows.length];
        const url = service ? service.url : '';
        
        const windowData = {
            id: windowId,
            callsign: callsign,
            url: url,
            title: service ? service.name : `Окно ${this.windows.length + 1}`
        };
        
        this.windows.push(windowData);
        this.createWindowElement(windowData);
        this.updateGridLayout();
        this.updateSettingsCallsigns();
        
        this.showMessage(`Создано окно "${callsign}"`, 'system');
    }
    
    createWindowElement(windowData) {
        const container = document.getElementById('windowsContainer');
        
        const windowEl = document.createElement('div');
        windowEl.className = 'browser-window';
        windowEl.id = windowData.id;
        
        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span class="callsign" contenteditable="true">${windowData.callsign}</span>
                    <span class="window-name">${windowData.title}</span>
                </div>
                <input type="text" class="url-bar" placeholder="Введите URL..." value="${windowData.url}">
                <div class="window-controls">
                    <button class="control-btn minimize-btn" onclick="aiOrchestra.minimizeWindow('${windowData.id}')"></button>
                    <button class="control-btn close-btn" onclick="aiOrchestra.closeWindow('${windowData.id}')"></button>
                </div>
            </div>
            <div class="window-content">
                <div class="iframe-placeholder">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
                        <h3>🤖 ${windowData.title}</h3>
                        <p>Введите URL в адресную строку выше</p>
                        <div style="margin-top: 1rem;">
                            <p>Популярные ИИ-сервисы:</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; justify-content: center;">
                                ${this.aiServices.map(service => 
                                    `<button class="btn btn-small" onclick="aiOrchestra.loadService('${windowData.id}', '${service.url}')">${service.name}</button>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(windowEl);
        
        // Обработчики событий для окна
        const urlBar = windowEl.querySelector('.url-bar');
        urlBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadURL(windowData.id, e.target.value);
            }
        });
        
        const callsignEl = windowEl.querySelector('.callsign');
        callsignEl.addEventListener('blur', (e) => {
            this.updateCallsign(windowData.id, e.target.textContent);
        });
    }
    
    loadService(windowId, url) {
        const urlBar = document.querySelector(`#${windowId} .url-bar`);
        urlBar.value = url;
        this.loadURL(windowId, url);
    }
    
    loadURL(windowId, url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        const windowEl = document.getElementById(windowId);
        const content = windowEl.querySelector('.window-content');
        
        // Создаем iframe для загрузки URL
        content.innerHTML = `
            <iframe class="iframe-container" src="${url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
        `;
        
        // Обновляем данные окна
        const windowData = this.windows.find(w => w.id === windowId);
        if (windowData) {
            windowData.url = url;
        }
        
        this.showMessage(`Загружен URL в окне "${windowData.callsign}": ${url}`, 'system');
    }
    
    closeWindow(windowId) {
        const windowIndex = this.windows.findIndex(w => w.id === windowId);
        if (windowIndex === -1) return;
        
        const windowData = this.windows[windowIndex];
        this.windows.splice(windowIndex, 1);
        
        const windowEl = document.getElementById(windowId);
        windowEl.remove();
        
        this.updateGridLayout();
        this.updateSettingsCallsigns();
        this.showMessage(`Закрыто окно "${windowData.callsign}"`, 'system');
    }
    
    minimizeWindow(windowId) {
        const windowEl = document.getElementById(windowId);
        windowEl.style.display = windowEl.style.display === 'none' ? 'flex' : 'none';
    }
    
    updateCallsign(windowId, newCallsign) {
        const windowData = this.windows.find(w => w.id === windowId);
        if (windowData) {
            const oldCallsign = windowData.callsign;
            windowData.callsign = newCallsign.toUpperCase();
            this.updateSettingsCallsigns();
            this.showMessage(`Изменен позывной с "${oldCallsign}" на "${windowData.callsign}"`, 'system');
        }
    }
    
    updateGridLayout() {
        const container = document.getElementById('windowsContainer');
        const count = this.windows.length;
        
        container.className = 'windows-container';
        
        if (count === 1) container.classList.add('single');
        else if (count === 2) container.classList.add('dual');
        else if (count === 3) container.classList.add('triple');
        else if (count === 4) container.classList.add('quad');
        else if (count === 5) container.classList.add('five');
        else if (count === 6) container.classList.add('six');
    }
    
    toggleChat() {
        const chatPanel = document.getElementById('chatPanel');
        this.chatVisible = !this.chatVisible;
        
        if (this.chatVisible) {
            chatPanel.classList.remove('hidden');
        } else {
            chatPanel.classList.add('hidden');
        }
    }
    
    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        
        // Обработка команд маршрутизации
        if (message.startsWith('@')) {
            this.processRoutingCommand(message);
        } else {
            this.showMessage(message, 'user');
        }
        
        this.messageHistory.push({
            content: message,
            type: 'user',
            timestamp: new Date()
        });
    }
    
    processRoutingCommand(message) {
        const parts = message.split(' ');
        const command = parts[0];
        const content = parts.slice(1).join(' ');
        
        if (command === '@all') {
            // Отправить всем окнам
            this.broadcastToAll(content);
        } else if (command.startsWith('@') && command.length > 1) {
            // Отправить конкретному окну
            const targetCallsign = command.substring(1).toUpperCase();
            this.sendToWindow(targetCallsign, content);
        } else {
            this.showMessage('Неправильный формат команды. Используйте @позывной сообщение или @all сообщение', 'system');
        }
    }
    
    broadcastToAll(message) {
        this.windows.forEach(window => {
            this.simulateMessageToWindow(window.callsign, message);
        });
        
        this.showMessage(`📢 Отправлено всем (${this.windows.length} окон): ${message}`, 'forwarded');
    }
    
    sendToWindow(callsign, message) {
        const targetWindow = this.windows.find(w => w.callsign === callsign);
        
        if (targetWindow) {
            this.simulateMessageToWindow(callsign, message);
            this.showMessage(`📤 Отправлено в "${callsign}": ${message}`, 'forwarded');
        } else {
            this.showMessage(`❌ Окно с позывным "${callsign}" не найдено`, 'system');
        }
    }
    
    simulateMessageToWindow(callsign, message) {
        // В реальном расширении браузера здесь была бы отправка сообщения в iframe
        // Для демонстрации мы просто логируем
        console.log(`Сообщение для ${callsign}: ${message}`);
        
        // Симуляция ответа от ИИ (в реальности это было бы через API или автоматизацию)
        setTimeout(() => {
            this.showMessage(`🤖 ${callsign} получил: "${message}"`, 'system');
        }, 1000);
    }
    
    showMessage(content, type = 'user', sender = null) {
        const chatMessages = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        const header = sender ? `${sender} (${timestamp})` : timestamp;
        
        messageEl.innerHTML = `
            <div class="message-header">${header}</div>
            <div class="message-content">${content}</div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    clearChat() {
        document.getElementById('chatMessages').innerHTML = '';
        this.messageHistory = [];
        this.showMessage('Чат очищен', 'system');
    }
    
    openSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
        this.updateSettingsUI();
    }
    
    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
        this.saveSettings();
    }
    
    updateSettingsUI() {
        this.updateSettingsCallsigns();
        this.updateRoutingRules();
    }
    
    updateSettingsCallsigns() {
        const container = document.getElementById('windowCallsigns');
        container.innerHTML = '';
        
        this.windows.forEach(window => {
            const callsignEl = document.createElement('div');
            callsignEl.className = 'callsign-input';
            callsignEl.innerHTML = `
                <span>Окно "${window.title}":</span>
                <input type="text" value="${window.callsign}" onchange="aiOrchestra.updateWindowCallsign('${window.id}', this.value)">
            `;
            container.appendChild(callsignEl);
        });
    }
    
    updateWindowCallsign(windowId, newCallsign) {
        this.updateCallsign(windowId, newCallsign);
        const windowEl = document.getElementById(windowId);
        const callsignEl = windowEl.querySelector('.callsign');
        callsignEl.textContent = newCallsign.toUpperCase();
    }
    
    addRoutingRule() {
        const rule = {
            id: 'rule-' + Date.now(),
            from: '',
            to: '',
            trigger: '',
            action: 'forward'
        };
        
        this.routingRules.push(rule);
        this.updateRoutingRules();
    }
    
    updateRoutingRules() {
        const container = document.getElementById('routingRules');
        container.innerHTML = '';
        
        this.routingRules.forEach(rule => {
            const ruleEl = document.createElement('div');
            ruleEl.className = 'routing-rule';
            ruleEl.innerHTML = `
                <div class="rule-content">
                    <div style="margin-bottom: 0.5rem;">
                        <label>Триггер:</label>
                        <input type="text" value="${rule.trigger || ''}" placeholder="Ключевое слово или фраза (пусто = все сообщения)" style="width: 100%; padding: 0.25rem;" onchange="aiOrchestra.updateRuleField('${rule.id}', 'trigger', this.value)">
                    </div>
                    <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                        <div style="flex: 1;">
                            <label>От сервиса:</label>
                            <select style="width: 100%; padding: 0.25rem;" onchange="aiOrchestra.updateRuleField('${rule.id}', 'sourceService', this.value)">
                                <option value="">Любой сервис</option>
                                ${this.aiServices.map(s => `<option value="${s.name}" ${rule.sourceService === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label>К сервису:</label>
                            <select style="width: 100%; padding: 0.25rem;" onchange="aiOrchestra.updateRuleField('${rule.id}', 'targetService', this.value)">
                                <option value="">Выберите сервис</option>
                                ${this.aiServices.map(s => `<option value="${s.name}" ${rule.targetService === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <label>
                            <input type="checkbox" ${rule.autoForwardAll ? 'checked' : ''} onchange="aiOrchestra.updateRuleField('${rule.id}', 'autoForwardAll', this.checked)">
                            Автопересылка всех ответов ИИ
                        </label>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <label>
                            <input type="checkbox" ${rule.addSourcePrefix ? 'checked' : ''} onchange="aiOrchestra.updateRuleField('${rule.id}', 'addSourcePrefix', this.checked)">
                            Добавлять префикс источника
                        </label>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <label>Инструкции для ИИ:</label>
                        <textarea style="width: 100%; padding: 0.25rem; height: 50px;" placeholder="Например: 'Переведи следующий текст на английский'" onchange="aiOrchestra.updateRuleField('${rule.id}', 'instructions', this.value)">${rule.instructions || ''}</textarea>
                    </div>
                </div>
                <button class="btn btn-small" onclick="aiOrchestra.removeRoutingRule('${rule.id}')" style="background: #ef4444; color: white;">Удалить</button>
            `;
            container.appendChild(ruleEl);
        });
        
        // Показываем автоправила отдельно
        this.updateAutoForwardRules();
    }

    updateAutoForwardRules() {
        // Создаем секцию автоправил если её нет
        let autoRulesContainer = document.getElementById('autoForwardRules');
        if (!autoRulesContainer) {
            const settingsBody = document.querySelector('.modal-body');
            const autoRulesSection = document.createElement('div');
            autoRulesSection.className = 'setting-group';
            autoRulesSection.innerHTML = `
                <label>🤖 Автоматическая пересылка между ИИ:</label>
                <p style="font-size: 0.875rem; color: #666; margin-bottom: 1rem;">
                    Эти правила работают автоматически - когда ИИ отвечает, его ответ автоматически отправляется другому ИИ без участия пользователя.
                </p>
                <div id="autoForwardRules"></div>
                <button id="addAutoRule" class="btn btn-secondary">+ Добавить автоправило</button>
            `;
            settingsBody.appendChild(autoRulesSection);
            
            document.getElementById('addAutoRule').addEventListener('click', () => this.addAutoForwardRule());
            autoRulesContainer = document.getElementById('autoForwardRules');
        }
        
        // Получаем автоправила
        const autoForwardRules = this.getAutoForwardRules();
        autoRulesContainer.innerHTML = '';
        
        autoForwardRules.forEach(rule => {
            const ruleEl = document.createElement('div');
            ruleEl.className = 'routing-rule';
            ruleEl.style.backgroundColor = '#f0f9ff';
            ruleEl.style.borderLeft = '4px solid #0ea5e9';
            ruleEl.innerHTML = `
                <div class="rule-content">
                    <div style="margin-bottom: 0.5rem;">
                        <strong>🔄 ${rule.sourceService} → ${rule.targetService}</strong>
                    </div>
                    <div style="font-size: 0.875rem; color: #666;">
                        ${rule.trigger ? `Триггер: "${rule.trigger}"` : 'Все ответы'}
                        ${rule.instructions ? `<br>Инструкции: "${rule.instructions}"` : ''}
                    </div>
                </div>
                <button class="btn btn-small" onclick="aiOrchestra.removeAutoForwardRule('${rule.id}')" style="background: #ef4444; color: white;">Удалить</button>
            `;
            autoRulesContainer.appendChild(ruleEl);
        });
    }

    updateRuleField(ruleId, field, value) {
        const rule = this.routingRules.find(r => r.id === ruleId);
        if (rule) {
            rule[field] = value;
            this.saveAutoForwardRules();
        }
    }

    addAutoForwardRule() {
        const rule = {
            id: 'auto-rule-' + Date.now(),
            sourceService: '',
            targetService: '',
            trigger: '',
            instructions: '',
            autoForwardAll: true,
            addSourcePrefix: true,
            isAutoRule: true
        };
        
        this.routingRules.push(rule);
        this.updateRoutingRules();
        this.saveAutoForwardRules();
    }

    removeAutoForwardRule(ruleId) {
        this.routingRules = this.routingRules.filter(rule => rule.id !== ruleId);
        this.updateRoutingRules();
        this.saveAutoForwardRules();
    }

    getAutoForwardRules() {
        return this.routingRules.filter(rule => rule.isAutoRule && rule.sourceService && rule.targetService);
    }

    saveAutoForwardRules() {
        // Сохраняем правила в localStorage для доступа из content script
        const autoRules = this.getAutoForwardRules();
        const settings = JSON.parse(localStorage.getItem('aiOrchestra') || '{}');
        settings.autoForwardRules = autoRules;
        localStorage.setItem('aiOrchestra', JSON.stringify(settings));
        this.saveSettings();
    }
    
    removeRoutingRule(ruleId) {
        this.routingRules = this.routingRules.filter(rule => rule.id !== ruleId);
        this.updateRoutingRules();
    }
    
    addInitialWindow() {
        // Добавляем первое окно с ChatGPT по умолчанию
        this.addWindow(this.aiServices[0]);
        
        // Добавляем пример автоправила
        setTimeout(() => {
            if (this.routingRules.length === 0) {
                this.addExampleAutoRule();
            }
        }, 2000);
    }
    
    addExampleAutoRule() {
        const exampleRule = {
            id: 'example-auto-rule-' + Date.now(),
            sourceService: 'ChatGPT',
            targetService: 'Claude',
            trigger: '',
            instructions: 'Проанализируй следующий ответ и дай свое мнение:',
            autoForwardAll: true,
            addSourcePrefix: true,
            isAutoRule: true
        };
        
        this.routingRules.push(exampleRule);
        this.saveAutoForwardRules();
        
        this.showMessage('🎯 Добавлен пример автоправила: ChatGPT → Claude', 'system');
        this.showMessage('📝 Теперь ответы от ChatGPT будут автоматически пересылаться в Claude для анализа', 'system');
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('aiOrchestra');
            if (saved) {
                const data = JSON.parse(saved);
                this.routingRules = data.routingRules || [];
                this.messageHistory = data.messageHistory || [];
            }
        } catch (e) {
            console.error('Ошибка загрузки настроек:', e);
        }
    }
    
    saveSettings() {
        try {
            const data = {
                routingRules: this.routingRules,
                messageHistory: this.messageHistory,
                windows: this.windows.map(w => ({
                    callsign: w.callsign,
                    url: w.url,
                    title: w.title
                }))
            };
            localStorage.setItem('aiOrchestra', JSON.stringify(data));
        } catch (e) {
            console.error('Ошибка сохранения настроек:', e);
        }
    }
}

// Инициализация приложения
let aiOrchestra;

document.addEventListener('DOMContentLoaded', () => {
    if (window.debugLog) window.debugLog('🚀 Инициализация AI Orchestra...');
    
    try {
        aiOrchestra = new AIOrchestra();
        if (window.debugLog) window.debugLog('✅ AI Orchestra успешно создан!', 'success');
        
        // Показываем приветственное сообщение
        setTimeout(() => {
            aiOrchestra.showMessage('🎼 Добро пожаловать в AI Orchestra! Создайте до 6 окон с ИИ-сервисами и настройте оркестрацию сообщений между ними.', 'system');
            aiOrchestra.showMessage('📝 Используйте команды: @позывной сообщение (отправить конкретному окну) или @all сообщение (отправить всем)', 'system');
            aiOrchestra.showMessage('⌨️ Горячие клавиши: Ctrl+N (новое окно), Ctrl+M (чат), Ctrl+, (настройки)', 'system');
            if (window.debugLog) window.debugLog('📱 AI Orchestra готов к работе!', 'success');
        }, 1000);
    } catch (error) {
        if (window.debugLog) window.debugLog('❌ Ошибка инициализации: ' + error.message, 'error');
    }
});

// Автосохранение при закрытии
window.addEventListener('beforeunload', () => {
    if (aiOrchestra) {
        aiOrchestra.saveSettings();
    }
});