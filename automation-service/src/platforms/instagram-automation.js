
export class InstagramAutomation {
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

          case 'scroll':
            await this.humanBehavior.humanScroll();
            actions.push('Скроллинг ленты');
            break;

          case 'wait':
            const waitTime = Math.floor(Math.random() * (step.maxTime - step.minTime)) + step.minTime;
            await this.humanBehavior.randomPause(waitTime, waitTime + 1000);
            actions.push(`Просмотр ${waitTime}ms`);
            break;

          case 'random_interaction':
            await this.humanBehavior.randomInteraction();
            actions.push('Случайное движение');
            break;

          case 'like_posts':
            await this.likePosts(step, actions);
            break;

          case 'follow_user':
            await this.followUser(step, actions);
            break;

          case 'story_view':
            await this.viewStories(step, actions);
            break;

          default:
            console.warn(`Неизвестный тип шага: ${step.type}`);
        }

        // Пауза между действиями
        await this.humanBehavior.randomPause(
          config?.settings?.minDelay || 2000,
          config?.settings?.maxDelay || 5000
        );

      } catch (error) {
        console.error(`Ошибка в шаге ${i + 1} (${step.name}):`, error);
        
        const retryAttempts = config?.settings?.retryAttempts || 1;
        if (retryAttempts > 0) {
          config.settings.retryAttempts--;
          i--;
          continue;
        }
        
        throw error;
      }
    }

    return {
      success: true,
      actions,
      message: `Instagram сценарий "${scenario.name}" выполнен успешно`
    };
  }

  async likePosts(step, actions) {
    try {
      const maxLikes = step.count || 3;
      let likedCount = 0;

      // Поиск постов для лайка
      const posts = await this.page.$$('article');
      
      for (let i = 0; i < Math.min(posts.length, maxLikes); i++) {
        const post = posts[i];
        
        // Поиск кнопки лайка в посте
        const likeButton = await post.$('button[aria-label*="Like"]');
        if (likeButton) {
          await likeButton.click();
          likedCount++;
          actions.push(`Лайк поста ${i + 1}`);
          
          // Пауза между лайками
          await this.humanBehavior.randomPause(3000, 8000);
        }
      }

      actions.push(`Поставлено лайков: ${likedCount}`);
      
    } catch (error) {
      console.error('Ошибка при постановке лайков:', error);
      throw error;
    }
  }

  async followUser(step, actions) {
    try {
      // Переход на профиль пользователя
      if (step.username) {
        await this.page.goto(`https://instagram.com/${step.username}`, { waitUntil: 'networkidle' });
        await this.humanBehavior.randomPause(2000, 4000);
      }

      // Поиск кнопки подписки
      const followButton = await this.page.$('button:has-text("Follow")');
      if (followButton) {
        await followButton.click();
        actions.push(`Подписка на @${step.username}`);
        await this.humanBehavior.randomPause(2000, 5000);
      }

    } catch (error) {
      console.error('Ошибка при подписке:', error);
      throw error;
    }
  }

  async viewStories(step, actions) {
    try {
      // Поиск и просмотр историй
      const storyElements = await this.page.$$('canvas[aria-label*="story"]');
      
      if (storyElements.length > 0) {
        const randomStory = storyElements[Math.floor(Math.random() * storyElements.length)];
        await randomStory.click();
        
        // Просмотр истории
        const viewTime = step.viewTime || 5000;
        await this.humanBehavior.randomPause(viewTime, viewTime + 2000);
        
        // Закрытие истории
        await this.page.keyboard.press('Escape');
        actions.push('Просмотр истории');
      }

    } catch (error) {
      console.error('Ошибка при просмотре историй:', error);
      // Не критичная ошибка, продолжаем
    }
  }
}
