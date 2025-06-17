
import { BrowserAutomation } from './browser-automation.js';
import { DatabaseService } from './supabase.js';

export class JobManager {
  constructor() {
    this.activeJobs = new Map();
    this.db = new DatabaseService();
  }

  async executeJob(scenario) {
    const jobId = `${scenario.id}-${Date.now()}`;
    console.log(`Запуск задания ${jobId} для сценария: ${scenario.name}`);

    try {
      // Обновляем статус сценария
      await this.db.updateScenarioStatus(scenario.id, 'running', 0);
      
      // Обновляем статус аккаунта
      const account = scenario.accounts;
      await this.db.updateAccountStatus(account.id, 'working');

      // Создаем лог о начале
      await this.db.createLog(
        scenario.user_id,
        account.id,
        scenario.id,
        'Начало выполнения сценария',
        `Сценарий: ${scenario.name}, Аккаунт: ${account.username}`,
        'info'
      );

      // Инициализируем браузер
      const proxy = account.proxies;
      const automation = new BrowserAutomation(proxy);
      await automation.initialize();

      this.activeJobs.set(jobId, {
        scenario,
        automation,
        startTime: Date.now()
      });

      // Выполняем сценарий
      const result = await automation.executeScenario(scenario, account);

      // Обновляем прогресс
      await this.db.updateScenarioStatus(scenario.id, 'completed', 100);
      await this.db.updateAccountStatus(account.id, 'idle', new Date().toISOString());

      // Логируем результат
      await this.db.createLog(
        scenario.user_id,
        account.id,
        scenario.id,
        'Сценарий завершен',
        `Результат: ${result.message}\nДействия: ${result.actions.join(', ')}`,
        result.success ? 'success' : 'error'
      );

      console.log(`Задание ${jobId} завершено:`, result.message);

      // Очистка
      await automation.cleanup();
      this.activeJobs.delete(jobId);

    } catch (error) {
      console.error(`Ошибка в задании ${jobId}:`, error);

      // Обновляем статусы при ошибке
      await this.db.updateScenarioStatus(scenario.id, 'failed', 0);
      await this.db.updateAccountStatus(scenario.accounts.id, 'error');

      // Логируем ошибку
      await this.db.createLog(
        scenario.user_id,
        scenario.accounts.id,
        scenario.id,
        'Ошибка выполнения сценария',
        error.message,
        'error'
      );

      // Очистка при ошибке
      const job = this.activeJobs.get(jobId);
      if (job?.automation) {
        await job.automation.cleanup();
      }
      this.activeJobs.delete(jobId);
    }
  }

  getActiveJobsCount() {
    return this.activeJobs.size;
  }

  getJobStatistics() {
    const jobs = Array.from(this.activeJobs.values());
    return {
      active: jobs.length,
      avgRuntime: jobs.length > 0 
        ? jobs.reduce((sum, job) => sum + (Date.now() - job.startTime), 0) / jobs.length
        : 0
    };
  }
}
