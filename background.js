// Фоновый скрипт для AI Orchestra
class AIOrchestraBackground {
    constructor() {
        this.setupMessageHandlers();
        this.setupTabHandlers();
    }

    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch(request.type) {
                case 'CREATE_WINDOW':
                    this.createWindow(request.data, sendResponse);
                    return true; // Асинхронный ответ
                
                case 'SEND_MESSAGE':
                    this.sendMessageToTab(request.tabId, request.message, sendResponse);
                    return true;
                
                case 'GET_TABS':
                    this.getAllTabs(sendResponse);
                    return true;
                
                case 'BROADCAST_MESSAGE':
                    this.broadcastMessage(request.message, request.excludeTabId, sendResponse);
                    return true;
            }
        });
    }

    setupTabHandlers() {
        // Отслеживание создания новых вкладок
        chrome.tabs.onCreated.addListener((tab) => {
            this.notifyOrchestra('TAB_CREATED', { tab });
        });

        // Отслеживание обновления вкладок
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.notifyOrchestra('TAB_UPDATED', { tab });
            }
        });

        // Отслеживание закрытия вкладок
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            this.notifyOrchestra('TAB_REMOVED', { tabId });
        });
    }

    async createWindow(data, sendResponse) {
        try {
            const window = await chrome.windows.create({
                url: data.url || 'chrome://newtab/',
                type: 'normal',
                width: 800,
                height: 600
            });

            // Сохраняем информацию об окне в storage
            const windowData = {
                id: window.id,
                callsign: data.callsign,
                url: data.url,
                title: data.title,
                created: Date.now()
            };

            await this.saveWindowData(windowData);
            
            sendResponse({ success: true, window: windowData });
        } catch (error) {
            console.error('Ошибка создания окна:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async sendMessageToTab(tabId, message, sendResponse) {
        try {
            await chrome.tabs.sendMessage(tabId, {
                type: 'AI_ORCHESTRA_MESSAGE',
                message: message,
                timestamp: Date.now()
            });
            
            sendResponse({ success: true });
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getAllTabs(sendResponse) {
        try {
            const tabs = await chrome.tabs.query({});
            const windowsData = await this.getWindowsData();
            
            const orchestraTabs = tabs.filter(tab => 
                windowsData.some(w => w.id === tab.windowId)
            );
            
            sendResponse({ success: true, tabs: orchestraTabs });
        } catch (error) {
            console.error('Ошибка получения вкладок:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async broadcastMessage(message, excludeTabId, sendResponse) {
        try {
            const tabs = await chrome.tabs.query({});
            const windowsData = await this.getWindowsData();
            
            const promises = tabs
                .filter(tab => 
                    tab.id !== excludeTabId && 
                    windowsData.some(w => w.id === tab.windowId)
                )
                .map(tab => 
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'AI_ORCHESTRA_BROADCAST',
                        message: message,
                        timestamp: Date.now()
                    }).catch(err => console.log(`Не удалось отправить в вкладку ${tab.id}:`, err))
                );

            await Promise.allSettled(promises);
            sendResponse({ success: true, sentTo: promises.length });
        } catch (error) {
            console.error('Ошибка broadcast:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async saveWindowData(windowData) {
        const { windows = [] } = await chrome.storage.local.get(['windows']);
        windows.push(windowData);
        await chrome.storage.local.set({ windows });
    }

    async getWindowsData() {
        const { windows = [] } = await chrome.storage.local.get(['windows']);
        return windows;
    }

    async notifyOrchestra(type, data) {
        try {
            // Попытка отправить уведомление в основное окно Orchestra
            const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('index.html') });
            
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'ORCHESTRA_NOTIFICATION',
                    notificationType: type,
                    data: data
                }).catch(err => console.log('Уведомление не доставлено:', err));
            });
        } catch (error) {
            console.error('Ошибка уведомления:', error);
        }
    }
}

// Инициализация фонового скрипта
new AIOrchestraBackground();

// Обработка установки расширения
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Открываем главную страницу при первой установке
        chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
        });
    }
});

// Команды клавиатуры
chrome.commands.onCommand.addListener(async (command) => {
    switch(command) {
        case 'open-orchestra':
            chrome.tabs.create({
                url: chrome.runtime.getURL('index.html')
            });
            break;
        
        case 'new-ai-window':
            // Создание нового окна для ИИ
            const aiServices = [
                'https://chat.openai.com',
                'https://claude.ai',
                'https://bard.google.com'
            ];
            
            const randomService = aiServices[Math.floor(Math.random() * aiServices.length)];
            chrome.windows.create({
                url: randomService,
                type: 'normal'
            });
            break;
    }
});