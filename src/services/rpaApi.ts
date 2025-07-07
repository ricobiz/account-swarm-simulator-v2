/**
 * RPA API Service - интеграция React интерфейса с RPA ботом
 */

const RPA_API_BASE = 'http://localhost:5001';

export interface RPAAccount {
  id: string;
  platform: string;
  username: string;
  password: string;
  proxy?: {
    enabled: boolean;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    type?: string;
  };
  status: 'active' | 'inactive' | 'testing' | 'error';
  multilogin_profile_id?: string;
}

export interface RPAScenario {
  id: string;
  name: string;
  description: string;
  steps: RPAStep[];
  accounts: string[];
  status: 'draft' | 'ready' | 'running' | 'completed' | 'error';
}

export interface RPAStep {
  id: string;
  type: 'navigate' | 'click' | 'input' | 'wait' | 'scroll' | 'screenshot' | 'extract';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  coordinates?: { x: number; y: number };
}

export interface RPATask {
  taskId: string;
  scenario: {
    steps: RPAStep[];
  };
  account?: RPAAccount;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  result?: any;
  error?: string;
}

class RPAApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = RPA_API_BASE;
  }

  // Проверка состояния RPA бота
  async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('RPA Health check failed:', error);
      throw error;
    }
  }

  // Выполнение сценария
  async executeScenario(task: RPATask): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      return await response.json();
    } catch (error) {
      console.error('RPA Execute failed:', error);
      throw error;
    }
  }

  // Тестирование аккаунта
  async testAccount(account: RPAAccount): Promise<any> {
    try {
      const testScenario: RPATask = {
        taskId: `test-${account.id}-${Date.now()}`,
        scenario: {
          steps: [
            {
              id: '1',
              type: 'navigate',
              url: this.getPlatformUrl(account.platform),
            },
            {
              id: '2',
              type: 'wait',
              timeout: 3000,
            },
            {
              id: '3',
              type: 'screenshot',
            }
          ]
        },
        account,
      };

      return await this.executeScenario(testScenario);
    } catch (error) {
      console.error('Account test failed:', error);
      throw error;
    }
  }

  // Массовый запуск сценария на множестве аккаунтов
  async executeBulkScenario(scenario: RPAScenario, accounts: RPAAccount[]): Promise<any[]> {
    try {
      const tasks = accounts.map(account => ({
        taskId: `bulk-${scenario.id}-${account.id}-${Date.now()}`,
        scenario: {
          steps: scenario.steps
        },
        account,
      }));

      // Запускаем все задачи параллельно
      const promises = tasks.map(task => this.executeScenario(task));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Bulk scenario execution failed:', error);
      throw error;
    }
  }

  // Получение статуса задачи
  async getTaskStatus(taskId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/task/${taskId}/status`);
      return await response.json();
    } catch (error) {
      console.error('Get task status failed:', error);
      throw error;
    }
  }

  // Остановка задачи
  async stopTask(taskId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/task/${taskId}/stop`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Stop task failed:', error);
      throw error;
    }
  }

  // Получение логов задачи
  async getTaskLogs(taskId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/task/${taskId}/logs`);
      return await response.json();
    } catch (error) {
      console.error('Get task logs failed:', error);
      throw error;
    }
  }

  // Создание Multilogin профиля для аккаунта
  async createMultiloginProfile(account: RPAAccount): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/multilogin/profile/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account }),
      });
      return await response.json();
    } catch (error) {
      console.error('Create Multilogin profile failed:', error);
      throw error;
    }
  }

  // Запуск Multilogin профиля
  async startMultiloginProfile(profileId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/multilogin/profile/${profileId}/start`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Start Multilogin profile failed:', error);
      throw error;
    }
  }

  // Остановка Multilogin профиля
  async stopMultiloginProfile(profileId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/multilogin/profile/${profileId}/stop`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Stop Multilogin profile failed:', error);
      throw error;
    }
  }

  // Получение списка активных профилей
  async getActiveProfiles(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/multilogin/profiles/active`);
      return await response.json();
    } catch (error) {
      console.error('Get active profiles failed:', error);
      throw error;
    }
  }

  // Вспомогательная функция для получения URL платформы
  private getPlatformUrl(platform: string): string {
    const urls: { [key: string]: string } = {
      instagram: 'https://www.instagram.com',
      facebook: 'https://www.facebook.com',
      twitter: 'https://www.twitter.com',
      youtube: 'https://www.youtube.com',
      tiktok: 'https://www.tiktok.com',
      linkedin: 'https://www.linkedin.com',
    };
    return urls[platform.toLowerCase()] || 'https://www.google.com';
  }

  // Конвертация шагов из визуального конструктора в формат RPA
  convertVisualStepsToRPA(visualSteps: any[]): RPAStep[] {
    return visualSteps.map((step, index) => ({
      id: (index + 1).toString(),
      type: this.mapVisualTypeToRPA(step.type),
      selector: step.selector,
      value: step.value || step.text,
      url: step.url,
      timeout: step.timeout || 5000,
      coordinates: step.coordinates,
    }));
  }

  // Маппинг типов шагов из визуального конструктора
  private mapVisualTypeToRPA(visualType: string): RPAStep['type'] {
    const mapping: { [key: string]: RPAStep['type'] } = {
      'mouse_click': 'click',
      'text_input': 'input',
      'navigation': 'navigate',
      'wait': 'wait',
      'scroll': 'scroll',
      'screenshot': 'screenshot',
      'data_extraction': 'extract',
    };
    return mapping[visualType] || 'wait';
  }
}

export const rpaApi = new RPAApiService();
export default rpaApi;

