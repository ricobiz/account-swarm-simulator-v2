
import { CONFIG } from './config.js';
import { JobManager } from './job-manager.js';
import { ProxyManager } from './proxy-manager.js';
import { DatabaseService } from './supabase.js';

export class WorkerManager {
  constructor() {
    this.workerId = CONFIG.scaling.workerId;
    this.jobManager = new JobManager();
    this.proxyManager = new ProxyManager();
    this.db = new DatabaseService();
    this.isRegistered = false;
    this.lastHeartbeat = null;
  }

  async registerWorker() {
    try {
      const workerInfo = {
        id: this.workerId,
        status: 'online',
        max_jobs: CONFIG.automation.maxConcurrentJobs,
        current_jobs: 0,
        last_heartbeat: new Date().toISOString(),
        system_info: await this.getSystemInfo()
      };

      const { error } = await this.db.supabase
        .from('workers')
        .upsert(workerInfo, { onConflict: 'id' });

      if (error) {
        console.error('Ошибка регистрации воркера:', error);
        return false;
      }

      this.isRegistered = true;
      console.log(`Воркер ${this.workerId} зарегистрирован`);
      
      // Запускаем heartbeat
      this.startHeartbeat();
      
      return true;
    } catch (error) {
      console.error('Ошибка регистрации воркера:', error);
      return false;
    }
  }

  async getSystemInfo() {
    const os = await import('os');
    const process = await import('process');
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: Math.round(os.totalmem() / 1024 / 1024), // MB
      node_version: process.version,
      uptime: process.uptime()
    };
  }

  startHeartbeat() {
    setInterval(async () => {
      await this.sendHeartbeat();
    }, 30000); // Каждые 30 секунд
  }

  async sendHeartbeat() {
    if (!this.isRegistered) return;

    try {
      const stats = this.jobManager.getJobStatistics();
      const memoryUsage = process.memoryUsage();
      
      const heartbeat = {
        last_heartbeat: new Date().toISOString(),
        current_jobs: stats.active,
        memory_usage: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        cpu_usage: await this.getCpuUsage(),
        status: this.getWorkerStatus()
      };

      const { error } = await this.db.supabase
        .from('workers')
        .update(heartbeat)
        .eq('id', this.workerId);

      if (error) {
        console.error('Ошибка отправки heartbeat:', error);
      }

      this.lastHeartbeat = new Date();
    } catch (error) {
      console.error('Ошибка heartbeat:', error);
    }
  }

  async getCpuUsage() {
    // Простое измерение CPU usage
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    
    const totalUsage = endUsage.user + endUsage.system;
    return Math.round((totalUsage / 100000) * 100) / 100; // Процент
  }

  getWorkerStatus() {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const activeJobs = this.jobManager.getActiveJobsCount();
    
    if (memoryUsage > CONFIG.scaling.maxMemoryUsage) {
      return 'overloaded';
    }
    
    if (activeJobs >= CONFIG.automation.maxConcurrentJobs) {
      return 'busy';
    }
    
    return 'available';
  }

  async getAssignedJobs() {
    // Получаем задания, назначенные этому воркеру
    const { data: scenarios, error } = await this.db.supabase
      .from('scenarios')
      .select(`
        *,
        accounts!inner(id, username, password, platform, proxy_id),
        accounts.proxies(ip, port, username, password, country)
      `)
      .eq('status', 'waiting')
      .eq('assigned_worker', this.workerId)
      .limit(CONFIG.automation.maxConcurrentJobs);

    if (error) {
      console.error('Ошибка получения заданий:', error);
      return [];
    }

    return scenarios || [];
  }

  async claimJobs() {
    // Пытаемся захватить свободные задания
    const availableSlots = CONFIG.automation.maxConcurrentJobs - this.jobManager.getActiveJobsCount();
    
    if (availableSlots <= 0) return [];

    const { data: scenarios, error } = await this.db.supabase
      .from('scenarios')
      .select(`
        *,
        accounts!inner(id, username, password, platform, proxy_id),
        accounts.proxies(ip, port, username, password, country)
      `)
      .eq('status', 'waiting')
      .is('assigned_worker', null)
      .limit(availableSlots);

    if (error || !scenarios || scenarios.length === 0) {
      return [];
    }

    // Назначаем задания этому воркеру
    const claimedJobs = [];
    for (const scenario of scenarios) {
      const { error: updateError } = await this.db.supabase
        .from('scenarios')
        .update({ 
          assigned_worker: this.workerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', scenario.id)
        .eq('status', 'waiting'); // Дополнительная проверка

      if (!updateError) {
        claimedJobs.push(scenario);
      }
    }

    if (claimedJobs.length > 0) {
      console.log(`Воркер ${this.workerId} захватил ${claimedJobs.length} заданий`);
    }

    return claimedJobs;
  }

  async shutdown() {
    console.log(`Завершение работы воркера ${this.workerId}...`);
    
    // Помечаем воркер как оффлайн
    await this.db.supabase
      .from('workers')
      .update({ 
        status: 'offline',
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', this.workerId);

    // Освобождаем захваченные задания
    await this.db.supabase
      .from('scenarios')
      .update({ 
        assigned_worker: null,
        status: 'waiting'
      })
      .eq('assigned_worker', this.workerId)
      .eq('status', 'running');

    this.isRegistered = false;
  }
}
