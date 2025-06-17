
import { DatabaseService } from './supabase.js';

export class ScenarioManager {
  constructor() {
    this.db = new DatabaseService();
    this.customScenarios = new Map();
  }

  async loadCustomScenarios() {
    try {
      // Загружаем кастомные сценарии из базы данных
      const { data: scenarios, error } = await this.db.supabase
        .from('scenario_templates')
        .select('*')
        .eq('active', true);

      if (error) {
        console.error('Ошибка загрузки сценариев:', error);
        return;
      }

      scenarios?.forEach(scenario => {
        this.customScenarios.set(scenario.id, scenario);
      });

      console.log(`Загружено ${scenarios?.length || 0} кастомных сценариев`);
    } catch (error) {
      console.error('Ошибка при загрузке сценариев:', error);
    }
  }

  async createScenarioFromTemplate(templateId, accountIds, userId) {
    const template = this.customScenarios.get(templateId);
    if (!template) {
      throw new Error(`Шаблон сценария ${templateId} не найден`);
    }

    const scenarios = [];
    
    for (const accountId of accountIds) {
      const scenario = {
        user_id: userId,
        name: template.name,
        platform: template.platform,
        status: 'waiting',
        progress: 0,
        accounts_count: 1,
        config: {
          template_id: templateId,
          account_id: accountId,
          steps: template.steps,
          settings: template.settings
        }
      };

      try {
        const { data, error } = await this.db.supabase
          .from('scenarios')
          .insert(scenario)
          .select()
          .single();

        if (error) {
          console.error('Ошибка создания сценария:', error);
          continue;
        }

        scenarios.push(data);
        console.log(`Создан сценарий для аккаунта ${accountId}:`, data.id);
      } catch (error) {
        console.error(`Ошибка при создании сценария для аккаунта ${accountId}:`, error);
      }
    }

    return scenarios;
  }

  async executeCustomScenario(scenario, account, automation) {
    const template = this.customScenarios.get(scenario.config.template_id);
    if (!template) {
      throw new Error('Шаблон сценария не найден');
    }

    const actions = [];
    const steps = template.steps || [];

    console.log(`Начинаем выполнение сценария "${template.name}" для аккаунта ${account.username}`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const progress = Math.round(((i + 1) / steps.length) * 100);

      // Обновляем прогресс сценария
      await this.db.updateScenarioStatus(scenario.id, 'running', progress);

      try {
        console.log(`Выполняем шаг ${i + 1}/${steps.length}: ${step.name}`);
        
        await this.executeStep(step, automation, actions);
        
        // Логируем успешное выполнение шага
        await this.db.createLog(
          scenario.user_id,
          account.id,
          scenario.id,
          `Шаг ${i + 1}: ${step.name}`,
          `Выполнен: ${step.description || step.name}`,
          'success'
        );

        console.log(`✓ Шаг ${i + 1} выполнен: ${step.name}`);

      } catch (error) {
        console.error(`✗ Ошибка в шаге ${i + 1}: ${step.name}`, error);
        
        // Логируем ошибку
        await this.db.createLog(
          scenario.user_id,
          account.id,
          scenario.id,
          `Ошибка в шаге ${i + 1}`,
          `${step.name}: ${error.message}`,
          'error'
        );
        
        throw error;
      }
    }

    return {
      success: true,
      actions,
      message: `Выполнен кастомный сценарий: ${template.name}`
    };
  }

  async executeStep(step, automation, actions) {
    switch (step.type) {
      case 'navigate':
        await automation.page.goto(step.url, { waitUntil: 'networkidle' });
        actions.push(`Переход на ${step.url}`);
        break;

      case 'click':
        await automation.page.waitForSelector(step.selector, { timeout: 10000 });
        await automation.page.click(step.selector);
        actions.push(`Клик по ${step.selector}`);
        break;

      case 'type':
        await automation.page.waitForSelector(step.selector, { timeout: 10000 });
        await automation.humanBehavior.typeWithMistakes(step.selector, step.text);
        actions.push(`Ввод текста в ${step.selector}: ${step.text}`);
        break;

      case 'scroll':
        await automation.humanBehavior.humanScroll();
        actions.push('Скроллинг страницы');
        break;

      case 'wait':
        const minTime = step.minTime || 1000;
        const maxTime = step.maxTime || 3000;
        await automation.humanBehavior.randomPause(minTime, maxTime);
        actions.push(`Ожидание ${minTime}-${maxTime}ms`);
        break;

      case 'random_interaction':
        await automation.humanBehavior.randomInteraction();
        actions.push('Случайное взаимодействие');
        break;

      default:
        console.warn(`Неизвестный тип шага: ${step.type}`);
    }

    // Добавляем случайную паузу между шагами
    await automation.humanBehavior.randomPause(1000, 3000);
  }

  async getAvailableScenarios(platform = null) {
    try {
      let query = this.db.supabase
        .from('scenario_templates')
        .select('*')
        .eq('active', true);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка получения сценариев:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Ошибка при получении сценариев:', error);
      return [];
    }
  }

  async createScenarioTemplate(userId, templateData) {
    try {
      const { data, error } = await this.db.supabase
        .from('scenario_templates')
        .insert({
          user_id: userId,
          name: templateData.name,
          platform: templateData.platform,
          description: templateData.description,
          steps: templateData.steps,
          settings: templateData.settings || {},
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Ошибка создания шаблона:', error);
        throw error;
      }

      // Добавляем в кеш
      this.customScenarios.set(data.id, data);
      
      console.log(`Создан новый шаблон сценария: ${data.name}`);
      return data;
    } catch (error) {
      console.error('Ошибка при создании шаблона сценария:', error);
      throw error;
    }
  }

  async updateScenarioTemplate(templateId, updates) {
    try {
      const { data, error } = await this.db.supabase
        .from('scenario_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error('Ошибка обновления шаблона:', error);
        throw error;
      }

      // Обновляем кеш
      this.customScenarios.set(templateId, data);
      
      return data;
    } catch (error) {
      console.error('Ошибка при обновлении шаблона:', error);
      throw error;
    }
  }

  async deleteScenarioTemplate(templateId) {
    try {
      const { error } = await this.db.supabase
        .from('scenario_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Ошибка удаления шаблона:', error);
        throw error;
      }

      // Удаляем из кеша
      this.customScenarios.delete(templateId);
      
      console.log(`Удален шаблон сценария: ${templateId}`);
    } catch (error) {
      console.error('Ошибка при удалении шаблона:', error);
      throw error;
    }
  }

  // Валидация JSON конфигурации сценария
  validateScenarioConfig(config) {
    const requiredFields = ['name', 'platform', 'steps'];
    const allowedStepTypes = ['navigate', 'click', 'type', 'scroll', 'wait', 'random_interaction'];

    // Проверка обязательных полей
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Отсутствует обязательное поле: ${field}`);
      }
    }

    // Проверка шагов
    if (!Array.isArray(config.steps) || config.steps.length === 0) {
      throw new Error('Сценарий должен содержать хотя бы один шаг');
    }

    // Валидация каждого шага
    config.steps.forEach((step, index) => {
      if (!step.type) {
        throw new Error(`Шаг ${index + 1}: отсутствует тип шага`);
      }

      if (!allowedStepTypes.includes(step.type)) {
        throw new Error(`Шаг ${index + 1}: неизвестный тип шага "${step.type}"`);
      }

      if (!step.name) {
        throw new Error(`Шаг ${index + 1}: отсутствует название шага`);
      }

      // Специфичная валидация по типам
      switch (step.type) {
        case 'navigate':
          if (!step.url) {
            throw new Error(`Шаг ${index + 1}: отсутствует URL для навигации`);
          }
          break;
        case 'click':
          if (!step.selector) {
            throw new Error(`Шаг ${index + 1}: отсутствует селектор для клика`);
          }
          break;
        case 'type':
          if (!step.selector || !step.text) {
            throw new Error(`Шаг ${index + 1}: отсутствует селектор или текст для ввода`);
          }
          break;
        case 'wait':
          if (!step.minTime || !step.maxTime) {
            throw new Error(`Шаг ${index + 1}: отсутствуют времена ожидания`);
          }
          break;
      }
    });

    return true;
  }
}
