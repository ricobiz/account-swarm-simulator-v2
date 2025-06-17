
import { chromium } from 'playwright';
import { CONFIG } from './config.js';

export class BrowserAutomation {
  constructor(proxy = null) {
    this.proxy = proxy;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async initialize() {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
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

    const contextOptions = {
      userAgent: CONFIG.automation.userAgents[
        Math.floor(Math.random() * CONFIG.automation.userAgents.length)
      ],
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    };

    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Настройка для обхода детекции
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
  }

  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.page.waitForTimeout(delay);
  }

  async humanLikeScroll() {
    const scrollCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < scrollCount; i++) {
      await this.page.mouse.wheel(0, Math.random() * 500 + 200);
      await this.randomDelay(500, 1500);
    }
  }

  async simulateHumanBehavior() {
    // Случайные движения мыши
    for (let i = 0; i < 3; i++) {
      await this.page.mouse.move(
        Math.random() * 1920,
        Math.random() * 1080
      );
      await this.randomDelay(200, 800);
    }

    // Скроллинг
    await this.humanLikeScroll();
  }

  async executeScenario(scenario, account) {
    const actions = [];
    
    try {
      switch (scenario.platform.toLowerCase()) {
        case 'telegram':
          await this.executeTelegramScenario(scenario, account, actions);
          break;
        case 'tiktok':
          await this.executeTikTokScenario(scenario, account, actions);
          break;
        case 'youtube':
          await this.executeYouTubeScenario(scenario, account, actions);
          break;
        default:
          throw new Error(`Неподдерживаемая платформа: ${scenario.platform}`);
      }

      return {
        success: true,
        actions,
        message: 'Сценарий выполнен успешно'
      };
    } catch (error) {
      return {
        success: false,
        actions,
        message: error.message
      };
    }
  }

  async executeTelegramScenario(scenario, account, actions) {
    actions.push('Переход на Telegram Web');
    await this.page.goto('https://web.telegram.org/', { waitUntil: 'networkidle' });
    await this.randomDelay();

    // Имитация входа (упрощенная версия)
    actions.push('Авторизация в Telegram');
    await this.simulateHumanBehavior();
    
    // Имитация прогрева
    actions.push('Скроллинг чатов');
    await this.humanLikeScroll();
    
    actions.push('Клик по случайному чату');
    const chatElements = await this.page.$$('.chatlist-chat');
    if (chatElements.length > 0) {
      const randomChat = chatElements[Math.floor(Math.random() * chatElements.length)];
      await randomChat.click();
      await this.randomDelay();
    }

    actions.push('Чтение сообщений');
    await this.humanLikeScroll();
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
    if (this.browser) {
      await this.browser.close();
    }
  }
}
