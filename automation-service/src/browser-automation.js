
import { CONFIG } from './config.js';
import { AntiDetectManager } from './anti-detect.js';
import { HumanBehaviorSimulator } from './human-behavior.js';
import { ErrorHandler } from './error-handler.js';
import { SessionManager } from './browser/session-manager.js';
import { BrowserLauncher } from './browser/browser-launcher.js';
import { TelegramAutomation } from './platforms/telegram-automation.js';
import { TikTokAutomation } from './platforms/tiktok-automation.js';
import { YouTubeAutomation } from './platforms/youtube-automation.js';

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
    this.sessionManager = new SessionManager();
    this.browserLauncher = new BrowserLauncher(proxy);
  }

  async initialize() {
    try {
      const fingerprint = this.antiDetect.generateFingerprint(this.accountId);
      
      this.browser = await this.browserLauncher.launch();

      // Создаём persistent context для сохранения сессии
      const contextOptions = this.browserLauncher.createContextOptions(
        fingerprint, 
        this.sessionManager.getStorageState(this.accountId)
      );

      this.context = await this.browser.newContext(contextOptions);
      this.page = await this.context.newPage();
      this.humanBehavior = new HumanBehaviorSimulator(this.page);

      // Применяем anti-detect меры
      await this.antiDetect.applyFingerprint(this.page, fingerprint);
      await this.browserLauncher.setupAdvancedAntiDetect(this.page);
      
      console.log(`Браузер инициализирован для аккаунта ${this.accountId}`);
      
    } catch (error) {
      console.error('Ошибка инициализации браузера:', error);
      throw error;
    }
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
      
      const platformAutomation = this.createPlatformAutomation(scenario.platform.toLowerCase());
      await platformAutomation.executeScenario(scenario, account, actions, scenarioConfig);

      await this.sessionManager.saveSessionState(this.accountId, this.context);

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

  createPlatformAutomation(platform) {
    switch (platform) {
      case 'telegram':
        return new TelegramAutomation(this.page, this.humanBehavior);
      case 'tiktok':
        return new TikTokAutomation(this.page, this.humanBehavior);
      case 'youtube':
        return new YouTubeAutomation(this.page, this.humanBehavior);
      default:
        throw new Error(`Неподдерживаемая платформа: ${platform}`);
    }
  }

  async cleanup() {
    try {
      if (this.context && this.accountId) {
        await this.sessionManager.saveSessionState(this.accountId, this.context);
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
