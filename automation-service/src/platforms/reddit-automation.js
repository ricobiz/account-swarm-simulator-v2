
export class RedditAutomation {
  constructor(page, humanBehavior) {
    this.page = page;
    this.humanBehavior = humanBehavior;
  }

  async executeScenario(scenario, account, actions, config) {
    const steps = scenario.config?.steps || [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        switch (step.type) {
          case 'navigate':
            await this.page.goto(step.url, { waitUntil: 'networkidle' });
            actions.push(`Переход на ${step.url}`);
            break;

          case 'click':
            await this.page.waitForSelector(step.selector, { timeout: 10000 });
            await this.page.click(step.selector);
            actions.push(`Клик по ${step.selector}`);
            break;

          case 'type':
            await this.page.waitForSelector(step.selector, { timeout: 10000 });
            await this.humanBehavior.typeWithMistakes(step.selector, step.text);
            actions.push(`Ввод текста в ${step.selector}: ${step.text}`);
            break;

          case 'scroll':
            await this.humanBehavior.humanScroll();
            actions.push('Скроллинг страницы');
            break;

          case 'wait':
            const waitTime = Math.floor(Math.random() * (step.maxTime - step.minTime)) + step.minTime;
            await this.humanBehavior.randomPause(waitTime, waitTime + 1000);
            actions.push(`Ожидание ${waitTime}ms`);
            break;

          case 'random_interaction':
            await this.humanBehavior.randomInteraction();
            actions.push('Случайное взаимодействие');
            break;

          case 'submit_post':
            // Reddit-специфичная логика для отправки поста
            await this.submitPost(step, actions);
            break;

          case 'comment':
            // Reddit-специфичная логика для комментирования
            await this.addComment(step, actions);
            break;

          default:
            console.warn(`Неизвестный тип шага: ${step.type}`);
        }

        // Случайная пауза между шагами
        await this.humanBehavior.randomPause(
          config?.settings?.minDelay || 1000,
          config?.settings?.maxDelay || 3000
        );

      } catch (error) {
        console.error(`Ошибка в шаге ${i + 1} (${step.name}):`, error);
        
        // Повторная попытка если настроено
        const retryAttempts = config?.settings?.retryAttempts || 1;
        if (retryAttempts > 0) {
          console.log(`Повторная попытка шага ${i + 1}...`);
          config.settings.retryAttempts--;
          i--; // Повторить текущий шаг
          continue;
        }
        
        throw error;
      }
    }

    return {
      success: true,
      actions,
      message: `Reddit сценарий "${scenario.name}" выполнен успешно`
    };
  }

  async submitPost(step, actions) {
    try {
      // Клик по кнопке создания поста
      await this.page.click('[data-click-id="submit"]');
      await this.humanBehavior.randomPause(2000, 4000);

      // Выбор типа поста (текст)
      await this.page.click('[data-click-id="text-post"]');
      await this.humanBehavior.randomPause(1000, 2000);

      // Заполнение заголовка
      if (step.title) {
        await this.humanBehavior.typeWithMistakes('textarea[name="title"]', step.title);
        await this.humanBehavior.randomPause(1000, 3000);
      }

      // Заполнение текста поста
      if (step.content) {
        await this.humanBehavior.typeWithMistakes('div[contenteditable="true"]', step.content);
        await this.humanBehavior.randomPause(2000, 5000);
      }

      // Отправка поста
      await this.page.click('button[type="submit"]');
      actions.push('Пост отправлен в Reddit');

    } catch (error) {
      console.error('Ошибка при создании поста в Reddit:', error);
      throw error;
    }
  }

  async addComment(step, actions) {
    try {
      // Поиск поля комментария
      await this.page.waitForSelector('div[contenteditable="true"]', { timeout: 10000 });
      
      // Ввод комментария
      await this.humanBehavior.typeWithMistakes('div[contenteditable="true"]', step.text);
      await this.humanBehavior.randomPause(2000, 4000);

      // Отправка комментария
      await this.page.click('button[type="submit"]');
      actions.push(`Комментарий добавлен: ${step.text}`);

    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      throw error;
    }
  }
}
