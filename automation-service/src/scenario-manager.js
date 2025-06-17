
import { DatabaseService } from './supabase.js';

export class ScenarioManager {
  constructor() {
    this.db = new DatabaseService();
    this.customScenarios = new Map();
  }

  async loadCustomScenarios() {
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

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const progress = Math.round(((i + 1) / steps.length) * 100);

      await this.db.updateScenarioStatus(scenario.id, 'running', progress);

      try {
        await this.executeStep(step, automation, actions);
        
        await this.db.createLog(
          scenario.user_id,
          account.id,
          scenario.id,
          `Шаг ${i + 1}: ${step.name}`,
          `Выполнен: ${step.description}`,
          'success'
        );

      } catch (error) {
        await this.db.createLog(
          scenario.user_id,
          account.id,
          scenario.id,
          `Ошибка в шаге ${i + 1}`,
          error.message,
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
        await automation.page.click(step.selector);
        actions.push(`Клик по ${step.selector}`);
        break;

      case 'type':
        await automation.humanBehavior.typeWithMistakes(step.selector, step.text);
        actions.push(`Ввод текста в ${step.selector}`);
        break;

      case 'scroll':
        await automation.humanBehavior.humanScroll();
        actions.push('Скроллинг страницы');
        break;

      case 'wait':
        await automation.humanBehavior.randomPause(step.minTime, step.maxTime);
        actions.push(`Ожидание ${step.minTime}-${step.maxTime}ms`);
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
    let query = this.db.supabase
      .from('scenario_templates')
      .select('*')
      .eq('active', true);

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Ошибка получения сценариев:', error);
      return [];
    }

    return data || [];
  }
}
