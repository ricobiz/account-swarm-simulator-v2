
export class TemplateExecutor {
  constructor(automation, humanBehavior) {
    this.automation = automation;
    this.humanBehavior = humanBehavior;
    this.page = automation.page;
  }

  async executeTemplateAction(action, account, actions) {
    console.log(`Выполняем шаблонное действие: ${action.name}`);
    
    switch (action.templateId) {
      case 'content_views':
        return await this.executeContentViews(action, account, actions);
      case 'likes_generation':
        return await this.executeLikesGeneration(action, account, actions);
      case 'comments_posting':
        return await this.executeCommentsPosting(action, account, actions);
      case 'content_sharing':
        return await this.executeContentSharing(action, account, actions);
      case 'followers_growth':
        return await this.executeFollowersGrowth(action, account, actions);
      case 'content_consumption':
        return await this.executeContentConsumption(action, account, actions);
      case 'trending_engagement':
        return await this.executeTrendingEngagement(action, account, actions);
      default:
        console.warn(`Неизвестный шаблон действия: ${action.templateId}`);
    }
  }

  async executeContentViews(action, account, actions) {
    const { viewsCount, watchTime, interactionChance } = action.settings;
    
    for (let i = 0; i < viewsCount; i++) {
      // Поиск контента для просмотра
      await this.findAndSelectContent(account.platform);
      
      // Просмотр контента
      await this.simulateContentViewing(watchTime * 1000);
      
      // Случайные взаимодействия
      if (Math.random() * 100 < interactionChance) {
        await this.randomInteraction(account.platform);
      }
      
      actions.push(`Просмотр ${i + 1}/${viewsCount} - ${watchTime}сек`);
      
      // Пауза между просмотрами
      await this.humanBehavior.randomPause(3000, 8000);
    }
  }

  async executeLikesGeneration(action, account, actions) {
    const { likesCount, delay, targetType } = action.settings;
    
    for (let i = 0; i < likesCount; i++) {
      try {
        await this.findContentByType(targetType, account.platform);
        await this.performLike(account.platform);
        
        actions.push(`Лайк ${i + 1}/${likesCount}`);
        
        if (i < likesCount - 1) {
          await this.humanBehavior.randomPause(delay * 1000, delay * 1500);
        }
      } catch (error) {
        console.error(`Ошибка при лайке ${i + 1}:`, error);
        actions.push(`Ошибка лайка ${i + 1}: ${error.message}`);
      }
    }
  }

  async executeCommentsPosting(action, account, actions) {
    const { commentsCount, commentStyle, customText } = action.settings;
    
    for (let i = 0; i < commentsCount; i++) {
      try {
        await this.findContentForComment(account.platform);
        const comment = this.generateComment(commentStyle, customText);
        await this.postComment(comment, account.platform);
        
        actions.push(`Комментарий ${i + 1}/${commentsCount}: ${comment.substring(0, 30)}...`);
        
        // Пауза между комментариями
        await this.humanBehavior.randomPause(15000, 30000);
      } catch (error) {
        console.error(`Ошибка при комментарии ${i + 1}:`, error);
        actions.push(`Ошибка комментария ${i + 1}: ${error.message}`);
      }
    }
  }

  async executeContentSharing(action, account, actions) {
    const { sharesCount, addComment, shareDelay } = action.settings;
    
    for (let i = 0; i < sharesCount; i++) {
      try {
        await this.findContentToShare(account.platform);
        await this.performShare(addComment, account.platform);
        
        actions.push(`Репост ${i + 1}/${sharesCount}`);
        
        if (i < sharesCount - 1) {
          await this.humanBehavior.randomPause(shareDelay * 60 * 1000, shareDelay * 60 * 1500);
        }
      } catch (error) {
        console.error(`Ошибка при репосте ${i + 1}:`, error);
        actions.push(`Ошибка репоста ${i + 1}: ${error.message}`);
      }
    }
  }

  async executeFollowersGrowth(action, account, actions) {
    const { followsCount, targetCriteria, unfollowAfter } = action.settings;
    
    for (let i = 0; i < followsCount; i++) {
      try {
        await this.findTargetByType(targetCriteria, account.platform);
        await this.performFollow(account.platform);
        
        actions.push(`Подписка ${i + 1}/${followsCount}`);
        
        // Планируем отписку (это должно быть реализовано в отдельной системе задач)
        if (unfollowAfter > 0) {
          actions.push(`Запланирована отписка через ${unfollowAfter} дней`);
        }
        
        // Пауза между подписками
        await this.humanBehavior.randomPause(10000, 25000);
      } catch (error) {
        console.error(`Ошибка при подписке ${i + 1}:`, error);
        actions.push(`Ошибка подписки ${i + 1}: ${error.message}`);
      }
    }
  }

  async executeContentConsumption(action, account, actions) {
    const { sessionTime, contentType, interactionRate } = action.settings;
    const endTime = Date.now() + (sessionTime * 60 * 1000);
    let viewedCount = 0;
    
    while (Date.now() < endTime) {
      try {
        await this.findContentByType(contentType, account.platform);
        await this.simulateContentViewing(10000, 60000); // 10-60 секунд просмотра
        
        // Случайные взаимодействия
        if (Math.random() * 100 < interactionRate) {
          await this.randomInteraction(account.platform);
        }
        
        viewedCount++;
        
        // Скроллинг к следующему контенту
        await this.humanBehavior.humanScroll();
        await this.humanBehavior.randomPause(2000, 5000);
        
      } catch (error) {
        console.error('Ошибка при потреблении контента:', error);
        break;
      }
    }
    
    actions.push(`Просмотрено ${viewedCount} материалов за ${sessionTime} минут`);
  }

  async executeTrendingEngagement(action, account, actions) {
    const { trendsCount, engagementType, timeWindow } = action.settings;
    
    // Переходим к трендовому контенту
    await this.navigateToTrending(account.platform, timeWindow);
    
    for (let i = 0; i < trendsCount; i++) {
      try {
        await this.selectTrendingContent(i);
        
        switch (engagementType) {
          case 'likes':
            await this.performLike(account.platform);
            actions.push(`Лайк тренда ${i + 1}`);
            break;
          case 'comments':
            const comment = this.generateComment('positive');
            await this.postComment(comment, account.platform);
            actions.push(`Комментарий к тренду ${i + 1}`);
            break;
          case 'shares':
            await this.performShare(false, account.platform);
            actions.push(`Репост тренда ${i + 1}`);
            break;
          case 'mixed':
            const randomAction = Math.floor(Math.random() * 3);
            if (randomAction === 0) {
              await this.performLike(account.platform);
              actions.push(`Лайк тренда ${i + 1}`);
            } else if (randomAction === 1) {
              const comment = this.generateComment('positive');
              await this.postComment(comment, account.platform);
              actions.push(`Комментарий к тренду ${i + 1}`);
            } else {
              await this.performShare(false, account.platform);
              actions.push(`Репост тренда ${i + 1}`);
            }
            break;
        }
        
        await this.humanBehavior.randomPause(5000, 15000);
      } catch (error) {
        console.error(`Ошибка при работе с трендом ${i + 1}:`, error);
        actions.push(`Ошибка тренда ${i + 1}: ${error.message}`);
      }
    }
  }

  // Вспомогательные методы для конкретных платформ
  async findAndSelectContent(platform) {
    switch (platform) {
      case 'youtube':
        // Поиск видео на главной странице
        const videos = await this.page.$$('#video-title');
        if (videos.length > 0) {
          const randomVideo = videos[Math.floor(Math.random() * Math.min(5, videos.length))];
          await randomVideo.click();
        }
        break;
      case 'tiktok':
        // TikTok обычно автоматически показывает видео
        await this.humanBehavior.randomPause(1000, 3000);
        break;
      case 'instagram':
        // Клик на пост в ленте
        const posts = await this.page.$$('article');
        if (posts.length > 0) {
          const randomPost = posts[Math.floor(Math.random() * Math.min(3, posts.length))];
          await randomPost.click();
        }
        break;
    }
  }

  async simulateContentViewing(minTime = 10000, maxTime = 60000) {
    const viewTime = Math.random() * (maxTime - minTime) + minTime;
    const endTime = Date.now() + viewTime;
    
    while (Date.now() < endTime) {
      // Случайные движения мыши
      await this.humanBehavior.simulateHumanMovement();
      
      // Иногда скроллим
      if (Math.random() < 0.3) {
        await this.humanBehavior.humanScroll();
      }
      
      await this.humanBehavior.randomPause(3000, 8000);
    }
  }

  async performLike(platform) {
    const selectors = {
      youtube: '#like-button button, .style-scope ytd-toggle-button-renderer button',
      tiktok: '[data-e2e="like-icon"], [data-e2e="browse-like-icon"]',
      instagram: 'button[aria-label*="Like"], svg[aria-label*="Like"]',
      twitter: '[data-testid="like"], [aria-label*="Like"]'
    };
    
    const selector = selectors[platform];
    if (selector) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        await this.page.click(selector);
        await this.humanBehavior.randomPause(1000, 3000);
      } catch (error) {
        console.error(`Не удалось найти кнопку лайка для ${platform}:`, error);
      }
    }
  }

  generateComment(style, customText = '') {
    if (customText) {
      return customText;
    }
    
    const commentTemplates = {
      positive: [
        'Отлично! 👍',
        'Круто!',
        'Супер контент!',
        'Спасибо за видео!',
        'Очень полезно',
        'Классно! 🔥',
        'Интересно!'
      ],
      neutral: [
        'Интересно',
        'Понятно',
        'Хорошо',
        'Ок',
        'Спасибо'
      ],
      questions: [
        'А как это работает?',
        'Можно подробнее?',
        'Интересно, а что дальше?',
        'А есть еще примеры?'
      ],
      emojis: [
        '👍',
        '🔥',
        '💪',
        '👏',
        '❤️',
        '😍',
        '🎉'
      ]
    };
    
    const templates = commentTemplates[style] || commentTemplates.positive;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async postComment(comment, platform) {
    const selectors = {
      youtube: '#placeholder-area, #contenteditable-root',
      instagram: 'textarea[placeholder*="comment"], textarea[aria-label*="comment"]',
      twitter: '[data-testid="tweetTextarea_0"]',
      reddit: 'textarea[name="text"]'
    };
    
    const selector = selectors[platform];
    if (selector) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        await this.page.click(selector);
        await this.humanBehavior.typeWithMistakes(selector, comment);
        
        // Попытка отправить комментарий (может потребоваться дополнительная кнопка)
        await this.humanBehavior.randomPause(2000, 4000);
        
        // Ищем кнопку отправки
        const submitSelectors = [
          'button[type="submit"]',
          'button[aria-label*="Post"]',
          'button[aria-label*="Reply"]',
          'button:contains("Отправить")',
          'button:contains("Post")'
        ];
        
        for (const submitSelector of submitSelectors) {
          try {
            const submitButton = await this.page.$(submitSelector);
            if (submitButton) {
              await submitButton.click();
              break;
            }
          } catch (e) {
            // Продолжаем поиск
          }
        }
        
      } catch (error) {
        console.error(`Не удалось написать комментарий для ${platform}:`, error);
      }
    }
  }

  async randomInteraction(platform) {
    const actions = [
      () => this.performLike(platform),
      () => this.humanBehavior.humanScroll(),
      () => this.humanBehavior.simulateHumanMovement(),
      () => this.humanBehavior.randomPause(2000, 5000)
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    await randomAction();
  }

  // Заглушки для методов, которые нужно доработать под конкретные платформы
  async findContentByType(targetType, platform) {
    // Логика поиска контента по типу
    await this.humanBehavior.randomPause(1000, 3000);
  }

  async findContentForComment(platform) {
    // Логика поиска контента для комментирования
    await this.findAndSelectContent(platform);
  }

  async findContentToShare(platform) {
    // Логика поиска контента для репоста
    await this.findAndSelectContent(platform);
  }

  async performShare(addComment, platform) {
    // Логика репоста/шеринга
    await this.humanBehavior.randomPause(2000, 5000);
  }

  async findTargetByType(criteria, platform) {
    // Логика поиска целевых аккаунтов для подписки
    await this.humanBehavior.randomPause(1000, 3000);
  }

  async performFollow(platform) {
    // Логика подписки на аккаунт
    await this.humanBehavior.randomPause(1000, 3000);
  }

  async navigateToTrending(platform, timeWindow) {
    // Логика перехода к трендовому контенту
    await this.humanBehavior.randomPause(2000, 5000);
  }

  async selectTrendingContent(index) {
    // Логика выбора трендового контента
    await this.humanBehavior.randomPause(1000, 3000);
  }
}
