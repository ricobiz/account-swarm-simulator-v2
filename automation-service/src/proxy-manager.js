
import { DatabaseService } from './supabase.js';

export class ProxyManager {
  constructor() {
    this.db = new DatabaseService();
    this.proxyStats = new Map();
  }

  async testProxy(proxy) {
    const testUrl = 'https://httpbin.org/ip';
    const startTime = Date.now();
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 10000,
        agent: this.createProxyAgent(proxy)
      });
      
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      return {
        success: true,
        responseTime,
        ip: data.origin,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  createProxyAgent(proxy) {
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    return new (require('https-proxy-agent'))(proxyUrl);
  }

  async updateProxyStats(proxyId, testResult) {
    const stats = this.proxyStats.get(proxyId) || {
      successCount: 0,
      failureCount: 0,
      avgResponseTime: 0,
      lastTested: null
    };

    if (testResult.success) {
      stats.successCount++;
      stats.avgResponseTime = (stats.avgResponseTime + testResult.responseTime) / 2;
    } else {
      stats.failureCount++;
    }

    stats.lastTested = new Date().toISOString();
    this.proxyStats.set(proxyId, stats);

    // Обновляем статус прокси в базе
    const newStatus = this.calculateProxyStatus(stats);
    await this.updateProxyInDatabase(proxyId, newStatus, stats);
  }

  calculateProxyStatus(stats) {
    const successRate = stats.successCount / (stats.successCount + stats.failureCount);
    
    if (successRate >= 0.8 && stats.avgResponseTime < 5000) {
      return 'excellent';
    } else if (successRate >= 0.6 && stats.avgResponseTime < 10000) {
      return 'good';
    } else if (successRate >= 0.4) {
      return 'poor';
    } else {
      return 'offline';
    }
  }

  async updateProxyInDatabase(proxyId, status, stats) {
    const { error } = await this.db.supabase
      .from('proxies')
      .update({
        status,
        speed: stats.avgResponseTime ? `${Math.round(stats.avgResponseTime)}ms` : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', proxyId);

    if (error) {
      console.error('Ошибка обновления прокси:', error);
    }
  }

  async getBestProxy(accountId) {
    // Получаем прокси с лучшими показателями
    const { data: proxies, error } = await this.db.supabase
      .from('proxies')
      .select('*')
      .in('status', ['excellent', 'good'])
      .order('status', { ascending: false })
      .limit(5);

    if (error || !proxies || proxies.length === 0) {
      console.warn('Не найдены работающие прокси');
      return null;
    }

    // Выбираем случайный из лучших
    return proxies[Math.floor(Math.random() * proxies.length)];
  }

  async rotateProxy(accountId, currentProxyId) {
    // Помечаем текущий прокси как проблемный
    if (currentProxyId) {
      await this.updateProxyInDatabase(currentProxyId, 'poor', {});
    }

    // Получаем новый прокси
    return await this.getBestProxy(accountId);
  }
}
