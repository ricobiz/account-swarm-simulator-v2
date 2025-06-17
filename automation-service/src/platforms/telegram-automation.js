
import { HumanBehaviorSimulator } from '../human-behavior.js';

export class TelegramAutomation {
  constructor(page, humanBehavior) {
    this.page = page;
    this.humanBehavior = humanBehavior;
  }

  async executeScenario(scenario, account, actions, config) {
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
    await this.simulateActivity(actions, config);
  }

  async simulateActivity(actions, config) {
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
}
