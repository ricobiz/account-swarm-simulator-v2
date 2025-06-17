import { chromium } from 'playwright';
import { CONFIG } from './config.js';
import { AntiDetectManager } from './anti-detect.js';
import { HumanBehaviorSimulator } from './human-behavior.js';
import { ErrorHandler } from './error-handler.js';

export class BrowserAutomation {
  constructor(proxy = null, accountId = null) {
    this.proxy = proxy;
    this.accountId = accountId;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.antiDetect = new AntiDetectManager();
    this.humanBehavior = null;
    this.errorHandler = new ErrorHandler();
    this.sessionData = new Map();
  }

  async initialize() {
    try {
      const fingerprint = this.antiDetect.generateFingerprint(this.accountId);
      
      const launchOptions = {
        headless: process.env.NODE_ENV === 'production',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
        ]
      };

      if (this.proxy) {
        launchOptions.proxy = {
          server: `http://${this.proxy.ip}:${this.proxy.port}`,
          username: this.proxy.username,
          password: this.proxy.password
        };
      }

      this.browser = await chromium.launch(launchOptions);

      // Создаём persistent context для сохранения сессии
      const contextOptions = {
        userAgent: fingerprint.userAgent,
        viewport: fingerprint.viewport,
        locale: fingerprint.locale,
        timezoneId: fingerprint.timezone,
        permissions: ['notifications'],
        storageState: this.getStorageState()
      };

      this.context = await this.browser.newContext(contextOptions);
      this.page = await this.context.newPage();
      this.humanBehavior = new HumanBehaviorSimulator(this.page);

      // Применяем anti-detect меры
      await this.antiDetect.applyFingerprint(this.page, fingerprint);
      await this.setupAdvancedAntiDetect();
      
      console.log(`Браузер инициализирован для аккаунта ${this.accountId}`);
      
    } catch (error) {
      console.error('Ошибка инициализации браузера:', error);
      throw error;
    }
  }

  async setupAdvancedAntiDetect() {
    // Скрываем webdriver
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      
      // Убираем chrome.runtime
      delete window.chrome?.runtime;
      
      // Модифицируем navigator.plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5].map(() => ({ name: 'Plugin' }))
      });
      
      // Модифицируем navigator.languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });
    });

    // Перехватываем и модифицируем заголовки
    await this.page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'upgrade-insecure-requests': '1'
      };
      
      await route.continue({ headers });
    });
  }

  getStorageState() {
    // Возвращаем сохранённое состояние сессии для аккаунта
    return this.sessionData.get(this.accountId) || null;
  }

  async saveSessionState() {
    // Сохраняем состояние сессии
    const state = await this.context.storageState();
    this.sessionData.set(this.accountId, state);
  }

  async executeScenario(scenario, account) {
    const actions = [];
    const context = {
      userId: scenario.user_id,
      accountId: account.id,
      scenarioId: scenario.id
    };
    
    try {
      // Получаем конфигурацию сценария
      const scenarioConfig = CONFIG.automation.scenarios[scenario.platform.toLowerCase()];
      const scenarioType = scenario.config?.scenario_type || 'default';
      
      console.log(`Выполнение сценария ${scenarioType} для платформы ${scenario.platform}`);
      
      switch (scenario.platform.toLowerCase()) {
        case 'telegram':
          await this.executeTelegramScenario(scenario, account, actions, scenarioConfig);
          break;
        case 'tiktok':
          await this.executeTikTokScenario(scenario, account, actions, scenarioConfig);
          break;
        case 'youtube':
          await this.executeYouTubeScenario(scenario, account, actions, scenarioConfig);
          break;
        default:
          throw new Error(`Неподдерживаемая платформа: ${scenario.platform}`);
      }

      await this.saveSessionState();

      return {
        success: true,
        actions,
        message: 'Сценарий выполнен успешно'
      };
      
    } catch (error) {
      console.error('Ошибка выполнения сценария:', error);
      
      // Обрабатываем ошибку через ErrorHandler
      const recoveryResult = await this.errorHandler.handleError(error, context);
      
      return {
        success: false,
        actions,
        message: error.message,
        recovery: recoveryResult
      };
    }
  }

  async executeTelegramScenario(scenario, account, actions, config) {
    actions.push('Переход на Telegram Web');
    await this.page.goto('https://web.telegram.org/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Человекоподобное поведение при загрузке
    await this.humanBehavior.randomPause(2000, 5000);
    await this.humanBehavior.simulateHumanMovement();

    // Проверяем, нужна ли авторизация
    try {
      await this.page.waitForSelector('.auth-form', { timeout: 5000 });
      actions.push('Требуется авторизация');
      
      // Имитируем ввод номера телефона
      await this.humanBehavior.typeWithMistakes('input[type="tel"]', account.username);
      await this.humanBehavior.randomPause(1000, 3000);
      
      // Здесь в реальном приложении нужно обработать SMS код
      actions.push('Ожидание SMS кода (имитация)');
      await this.humanBehavior.randomPause(10000, 20000);
      
    } catch (e) {
      actions.push('Уже авторизован');
    }

    // Имитация активности
    await this.simulateTelegramActivity(actions, config);
  }

  async simulateTelegramActivity(actions, config) {
    // Случайное время активности
    const activityTime = config.warmup.minTime + 
      Math.random() * (config.warmup.maxTime - config.warmup.minTime);
    
    const endTime = Date.now() + activityTime;
    
    while (Date.now() < endTime) {
      const actionType = config.warmup.actions[
        Math.floor(Math.random() * config.warmup.actions.length)
      ];
      
      switch (actionType) {
        case 'scroll':
          await this.humanBehavior.humanScroll();
          actions.push('Скроллинг чатов');
          break;
          
        case 'click_chats':
          await this.clickRandomChat(actions);
          break;
          
        case 'read_messages':
          await this.humanBehavior.simulateReading();
          actions.push('Чтение сообщений');
          break;
      }
      
      await this.humanBehavior.randomPause(3000, 8000);
      await this.humanBehavior.randomInteraction();
    }
  }

  async clickRandomChat(actions) {
    try {
      const chatElements = await this.page.$$('.chatlist-chat, .ChatItem');
      if (chatElements.length > 0) {
        const randomChat = chatElements[Math.floor(Math.random() * chatElements.length)];
        await randomChat.click();
        actions.push('Клик по чату');
        await this.humanBehavior.randomPause(2000, 5000);
      }
    } catch (error) {
      actions.push('Не удалось найти чаты');
    }
  }

  async executeTikTokScenario(scenario, account, actions) {
    actions.push('Переход на TikTok');
    await this.page.goto('https://www.tiktok.com/', { waitUntil: 'networkidle' });
    await this.randomDelay();

    actions.push('Просмотр видео');
    await this.simulateHumanBehavior();
    
    // Имитация лайков
    const likeButtons = await this.page.$$('[data-e2e="like-icon"]');
    if (likeButtons.length > 0) {
      const randomLikes = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < Math.min(randomLikes, likeButtons.length); i++) {
        await likeButtons[i].click();
        actions.push(`Лайк видео ${i + 1}`);
        await this.randomDelay(2000, 5000);
      }
    }
  }

  async executeYouTubeScenario(scenario, account, actions) {
    actions.push('Переход на YouTube');
    await this.page.goto('https://www.youtube.com/', { waitUntil: 'networkidle' });
    await this.randomDelay();

    actions.push('Просмотр рекомендаций');
    await this.simulateHumanBehavior();

    // Переход к случайному видео
    const videoElements = await this.page.$$('#video-title');
    if (videoElements.length > 0) {
      const randomVideo = videoElements[Math.floor(Math.random() * Math.min(5, videoElements.length))];
      await randomVideo.click();
      actions.push('Открытие видео');
      await this.randomDelay(3000, 8000);

      // Имитация просмотра
      actions.push('Просмотр видео');
      await this.randomDelay(10000, 30000);

      // Попытка написать комментарий
      try {
        await this.page.click('#placeholder-area');
        await this.randomDelay();
        
        const comments = [
          'Отличное видео!',
          'Спасибо за контент',
          'Интересно!',
          'Круто!',
          'Хорошая работа'
        ];
        
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        await this.page.type('#placeholder-area', randomComment);
        actions.push(`Написание комментария: ${randomComment}`);
        await this.randomDelay();
      } catch (e) {
        actions.push('Не удалось написать комментарий');
      }
    }
  }

  async cleanup() {
    try {
      if (this.context) {
        await this.saveSessionState();
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      console.error('Ошибка при закрытии браузера:', error);
    }
  }
}
