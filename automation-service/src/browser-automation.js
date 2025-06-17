
import { BrowserLauncher } from './browser/browser-launcher.js';
import { HumanBehaviorSimulator } from './human-behavior.js';
import { SessionManager } from './browser/session-manager.js';
import { TelegramAutomation } from './platforms/telegram-automation.js';
import { TikTokAutomation } from './platforms/tiktok-automation.js';
import { YouTubeAutomation } from './platforms/youtube-automation.js';
import { RedditAutomation } from './platforms/reddit-automation.js';
import { InstagramAutomation } from './platforms/instagram-automation.js';
import { ScenarioManager } from './scenario-manager.js';

export class BrowserAutomation {
  constructor(proxy = null) {
    this.proxy = proxy;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.humanBehavior = null;
    this.sessionManager = new SessionManager();
    this.scenarioManager = new ScenarioManager();
  }

  async initialize() {
    try {
      console.log('Инициализация браузерной автоматизации...');
      
      const launcher = new BrowserLauncher();
      this.browser = await launcher.launch(this.proxy);
      
      console.log('Браузер успешно запущен');
    } catch (error) {
      console.error('Ошибка инициализации браузера:', error);
      throw error;
    }
  }

  async createContext(account) {
    try {
      // Получаем сохраненное состояние сессии
      const storageState = this.sessionManager.getStorageState(account.id);
      
      const launcher = new BrowserLauncher();
      const contextOptions = await launcher.createContextOptions(account, this.proxy);
      
      if (storageState) {
        contextOptions.storageState = storageState;
        console.log(`Восстановлена сессия для аккаунта ${account.username}`);
      }

      this.context = await this.browser.newContext(contextOptions);
      this.page = await this.context.newPage();
      this.humanBehavior = new HumanBehaviorSimulator(this.page);

      console.log(`Контекст создан для аккаунта ${account.username}`);
    } catch (error) {
      console.error('Ошибка создания контекста:', error);
      throw error;
    }
  }

  createPlatformAutomation(platform) {
    switch (platform.toLowerCase()) {
      case 'telegram':
        return new TelegramAutomation(this.page, this.humanBehavior);
      case 'tiktok':
        return new TikTokAutomation(this.page, this.humanBehavior);
      case 'youtube':
        return new YouTubeAutomation(this.page, this.humanBehavior);
      case 'reddit':
        return new RedditAutomation(this.page, this.humanBehavior);
      case 'instagram':
        return new InstagramAutomation(this.page, this.humanBehavior);
      default:
        throw new Error(`Неподдерживаемая платформа: ${platform}`);
    }
  }

  async executeScenario(scenario, account) {
    try {
      console.log(`Выполнение сценария: ${scenario.name} для аккаунта: ${account.username}`);

      await this.createContext(account);

      // Загружаем кастомные сценарии если еще не загружены
      if (this.scenarioManager.customScenarios.size === 0) {
        await this.scenarioManager.loadCustomScenarios();
      }

      let result;

      // Проверяем, является ли сценарий кастомным (из JSON)
      if (scenario.config && scenario.config.template_id) {
        console.log('Выполняем кастомный сценарий из JSON конфигурации');
        result = await this.scenarioManager.executeCustomScenario(scenario, account, this);
      } else {
        // Стандартные предустановленные сценарии
        console.log('Выполняем стандартный сценарий');
        const platformAutomation = this.createPlatformAutomation(scenario.platform);
        result = await platformAutomation.executeScenario(scenario, account, [], scenario.config);
      }

      // Сохраняем состояние сессии
      await this.sessionManager.saveSessionState(account.id, this.context);

      console.log(`Сценарий завершен для аккаунта ${account.username}:`, result.message);
      return result;

    } catch (error) {
      console.error(`Ошибка выполнения сценария для аккаунта ${account.username}:`, error);
      throw error;
    }
  }

  async cleanup() {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
        this.page = null;
        this.humanBehavior = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log('Браузер закрыт');
    } catch (error) {
      console.error('Ошибка при закрытии браузера:', error);
    }
  }
}
