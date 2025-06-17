
import { JobManager } from './job-manager.js';
import { DatabaseService } from './supabase.js';
import { CONFIG } from './config.js';

class AutomationService {
  constructor() {
    this.jobManager = new JobManager();
    this.db = new DatabaseService();
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Запуск сервиса автоматизации браузера...');
    console.log(`📊 Максимальное количество одновременных заданий: ${CONFIG.automation.maxConcurrentJobs}`);
    console.log(`⏱️  Интервал проверки: ${CONFIG.automation.checkInterval}ms`);
    
    this.isRunning = true;
    this.scheduleCheck();

    // Обработка graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async checkForNewJobs() {
    if (!this.isRunning) return;

    try {
      const availableSlots = CONFIG.automation.maxConcurrentJobs - this.jobManager.getActiveJobsCount();
      
      if (availableSlots <= 0) {
        console.log('⏳ Все слоты заняты, ожидаем...');
        return;
      }

      console.log(`🔍 Поиск новых заданий (доступно слотов: ${availableSlots})...`);
      const scenarios = await this.db.getPendingScenarios();
      
      if (scenarios.length === 0) {
        console.log('📭 Новых заданий не найдено');
        return;
      }

      console.log(`📋 Найдено заданий: ${scenarios.length}`);

      // Запускаем задания до заполнения слотов
      const jobsToRun = scenarios.slice(0, availableSlots);
      
      for (const scenario of jobsToRun) {
        if (this.jobManager.getActiveJobsCount() < CONFIG.automation.maxConcurrentJobs) {
          // Запускаем задание асинхронно
          this.jobManager.executeJob(scenario).catch(error => {
            console.error('Ошибка выполнения задания:', error);
          });
        }
      }

      // Статистика
      const stats = this.jobManager.getJobStatistics();
      console.log(`📈 Активных заданий: ${stats.active}`);

    } catch (error) {
      console.error('❌ Ошибка при проверке заданий:', error);
    }
  }

  scheduleCheck() {
    if (!this.isRunning) return;

    setTimeout(() => {
      this.checkForNewJobs().finally(() => {
        this.scheduleCheck();
      });
    }, CONFIG.automation.checkInterval);
  }

  async shutdown() {
    console.log('\n🛑 Получен сигнал остановки, завершение работы...');
    this.isRunning = false;

    // Ждем завершения активных заданий
    const activeJobs = this.jobManager.getActiveJobsCount();
    if (activeJobs > 0) {
      console.log(`⏳ Ожидание завершения ${activeJobs} активных заданий...`);
      
      // Даем 30 секунд на завершение
      let waitTime = 0;
      const maxWait = 30000;
      
      while (this.jobManager.getActiveJobsCount() > 0 && waitTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        waitTime += 1000;
      }
    }

    console.log('✅ Сервис остановлен');
    process.exit(0);
  }
}

// Запуск сервиса
const service = new AutomationService();
service.start().catch(error => {
  console.error('💥 Критическая ошибка запуска:', error);
  process.exit(1);
});
