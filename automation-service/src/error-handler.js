
import { DatabaseService } from './supabase.js';

export class ErrorHandler {
  constructor() {
    this.db = new DatabaseService();
    this.retryAttempts = new Map();
    this.cooldownPeriods = new Map();
  }

  async handleError(error, context) {
    const errorType = this.classifyError(error);
    const retryKey = `${context.accountId}-${context.scenarioId}`;
    
    console.error(`Ошибка [${errorType}]:`, error.message);

    // Логируем ошибку
    await this.db.createLog(
      context.userId,
      context.accountId,
      context.scenarioId,
      'Ошибка выполнения',
      `Тип: ${errorType}, Сообщение: ${error.message}`,
      'error'
    );

    const strategy = this.getRecoveryStrategy(errorType, retryKey);
    return await this.executeRecoveryStrategy(strategy, context);
  }

  classifyError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT';
    } else if (message.includes('proxy') || message.includes('connection')) {
      return 'PROXY_ERROR';
    } else if (message.includes('captcha') || message.includes('verification')) {
      return 'CAPTCHA';
    } else if (message.includes('banned') || message.includes('blocked')) {
      return 'ACCOUNT_BANNED';
    } else if (message.includes('login') || message.includes('authentication')) {
      return 'AUTH_ERROR';
    } else if (message.includes('element') || message.includes('selector')) {
      return 'UI_CHANGED';
    } else {
      return 'UNKNOWN';
    }
  }

  getRecoveryStrategy(errorType, retryKey) {
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;
    
    switch (errorType) {
      case 'TIMEOUT':
        return currentAttempts < 3 ? 'RETRY_WITH_DELAY' : 'FAIL';
        
      case 'PROXY_ERROR':
        return currentAttempts < 2 ? 'CHANGE_PROXY' : 'FAIL';
        
      case 'CAPTCHA':
        return 'PAUSE_AND_RETRY';
        
      case 'ACCOUNT_BANNED':
        return 'MARK_BANNED';
        
      case 'AUTH_ERROR':
        return currentAttempts < 2 ? 'RETRY_AUTH' : 'FAIL';
        
      case 'UI_CHANGED':
        return currentAttempts < 1 ? 'RETRY_WITH_DELAY' : 'FAIL';
        
      default:
        return currentAttempts < 1 ? 'RETRY_WITH_DELAY' : 'FAIL';
    }
  }

  async executeRecoveryStrategy(strategy, context) {
    const retryKey = `${context.accountId}-${context.scenarioId}`;
    
    switch (strategy) {
      case 'RETRY_WITH_DELAY':
        return await this.retryWithDelay(retryKey, context);
        
      case 'CHANGE_PROXY':
        return await this.changeProxyAndRetry(retryKey, context);
        
      case 'PAUSE_AND_RETRY':
        return await this.pauseAndRetry(retryKey, context);
        
      case 'MARK_BANNED':
        return await this.markAccountBanned(context);
        
      case 'RETRY_AUTH':
        return await this.retryAuthentication(retryKey, context);
        
      case 'FAIL':
      default:
        return await this.markAsFailed(context);
    }
  }

  async retryWithDelay(retryKey, context) {
    const attempts = this.retryAttempts.get(retryKey) || 0;
    this.retryAttempts.set(retryKey, attempts + 1);
    
    const delay = Math.pow(2, attempts) * 1000 + Math.random() * 5000; // Exponential backoff
    
    await this.db.createLog(
      context.userId,
      context.accountId,
      context.scenarioId,
      'Повторная попытка',
      `Попытка ${attempts + 1}, задержка ${Math.round(delay)}ms`,
      'info'
    );

    setTimeout(() => {
      // Перезапуск задания будет обработан основным циклом
      this.db.updateScenarioStatus(context.scenarioId, 'waiting', 0);
    }, delay);

    return { success: false, retry: true };
  }

  async changeProxyAndRetry(retryKey, context) {
    await this.db.createLog(
      context.userId,
      context.accountId,
      context.scenarioId,
      'Смена прокси',
      'Попытка смены прокси и повторного выполнения',
      'info'
    );

    // Логика смены прокси будет в ProxyManager
    const attempts = this.retryAttempts.get(retryKey) || 0;
    this.retryAttempts.set(retryKey, attempts + 1);

    setTimeout(() => {
      this.db.updateScenarioStatus(context.scenarioId, 'waiting', 0);
    }, 5000);

    return { success: false, retry: true };
  }

  async pauseAndRetry(retryKey, context) {
    const pauseTime = 5 * 60 * 1000; // 5 минут пауза
    
    await this.db.createLog(
      context.userId,
      context.accountId,
      context.scenarioId,
      'Пауза из-за капчи',
      `Пауза на ${pauseTime / 1000} секунд`,
      'warning'
    );

    setTimeout(() => {
      this.db.updateScenarioStatus(context.scenarioId, 'waiting', 0);
    }, pauseTime);

    return { success: false, retry: true };
  }

  async markAccountBanned(context) {
    await this.db.updateAccountStatus(context.accountId, 'banned');
    await this.db.updateScenarioStatus(context.scenarioId, 'failed', 0);
    
    await this.db.createLog(
      context.userId,
      context.accountId,
      context.scenarioId,
      'Аккаунт заблокирован',
      'Аккаунт помечен как заблокированный',
      'error'
    );

    return { success: false, retry: false, banned: true };
  }

  async retryAuthentication(retryKey, context) {
    await this.db.createLog(
      context.userId,
      context.accountId,
      context.scenarioId,
      'Повторная авторизация',
      'Попытка повторной авторизации',
      'info'
    );

    const attempts = this.retryAttempts.get(retryKey) || 0;
    this.retryAttempts.set(retryKey, attempts + 1);

    setTimeout(() => {
      this.db.updateScenarioStatus(context.scenarioId, 'waiting', 0);
    }, 30000); // 30 секунд задержка

    return { success: false, retry: true };
  }

  async markAsFailed(context) {
    await this.db.updateAccountStatus(context.accountId, 'error');
    await this.db.updateScenarioStatus(context.scenarioId, 'failed', 0);
    
    await this.db.createLog(
      context.userId,
      context.accountId,
      context.scenarioId,
      'Задание провалено',
      'Исчерпаны все попытки восстановления',
      'error'
    );

    return { success: false, retry: false };
  }

  clearRetryAttempts(retryKey) {
    this.retryAttempts.delete(retryKey);
    this.cooldownPeriods.delete(retryKey);
  }
}
