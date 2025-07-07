/**
 * React Hook для управления RPA функциональностью
 */

import { useState, useEffect, useCallback } from 'react';
import { rpaApi, RPAAccount, RPAScenario, RPATask } from '../services/rpaApi';
import { toast } from 'sonner';

interface UseRPAReturn {
  // Состояние
  isConnected: boolean;
  isLoading: boolean;
  activeProfiles: any[];
  
  // Функции для аккаунтов
  testAccount: (account: RPAAccount) => Promise<boolean>;
  createMultiloginProfile: (account: RPAAccount) => Promise<string | null>;
  
  // Функции для сценариев
  executeScenario: (scenario: RPAScenario, accounts: RPAAccount[]) => Promise<any[]>;
  executeSingleScenario: (scenario: RPAScenario, account: RPAAccount) => Promise<any>;
  
  // Функции для мониторинга
  getTaskStatus: (taskId: string) => Promise<any>;
  stopTask: (taskId: string) => Promise<boolean>;
  
  // Функции для Multilogin
  startProfile: (profileId: string) => Promise<boolean>;
  stopProfile: (profileId: string) => Promise<boolean>;
  refreshActiveProfiles: () => Promise<void>;
  
  // Проверка подключения
  checkConnection: () => Promise<boolean>;
}

export const useRPA = (): UseRPAReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProfiles, setActiveProfiles] = useState<any[]>([]);

  // Проверка подключения к RPA API
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const health = await rpaApi.getHealth();
      const connected = health.status === 'ok';
      setIsConnected(connected);
      
      if (connected) {
        console.log('✅ RPA API подключен:', health);
      } else {
        console.warn('⚠️ RPA API недоступен');
      }
      
      return connected;
    } catch (error) {
      console.error('❌ Ошибка подключения к RPA API:', error);
      setIsConnected(false);
      return false;
    }
  }, []);

  // Тестирование аккаунта
  const testAccount = useCallback(async (account: RPAAccount): Promise<boolean> => {
    setIsLoading(true);
    try {
      toast.info(`🧪 Тестирование аккаунта ${account.username}...`);
      
      const result = await rpaApi.testAccount(account);
      
      if (result.success) {
        toast.success(`✅ Аккаунт ${account.username} работает корректно`);
        return true;
      } else {
        toast.error(`❌ Ошибка тестирования аккаунта: ${result.error || 'Неизвестная ошибка'}`);
        return false;
      }
    } catch (error) {
      console.error('Ошибка тестирования аккаунта:', error);
      toast.error(`❌ Ошибка тестирования аккаунта ${account.username}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Создание Multilogin профиля
  const createMultiloginProfile = useCallback(async (account: RPAAccount): Promise<string | null> => {
    setIsLoading(true);
    try {
      toast.info(`🔧 Создание Multilogin профиля для ${account.username}...`);
      
      const result = await rpaApi.createMultiloginProfile(account);
      
      if (result.success && result.profile_id) {
        toast.success(`✅ Multilogin профиль создан: ${result.profile_id}`);
        return result.profile_id;
      } else {
        toast.error(`❌ Ошибка создания профиля: ${result.error || 'Неизвестная ошибка'}`);
        return null;
      }
    } catch (error) {
      console.error('Ошибка создания Multilogin профиля:', error);
      toast.error(`❌ Ошибка создания профиля для ${account.username}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Выполнение сценария на одном аккаунте
  const executeSingleScenario = useCallback(async (scenario: RPAScenario, account: RPAAccount): Promise<any> => {
    setIsLoading(true);
    try {
      toast.info(`🚀 Запуск сценария "${scenario.name}" на аккаунте ${account.username}...`);
      
      const task: RPATask = {
        taskId: `single-${scenario.id}-${account.id}-${Date.now()}`,
        scenario: {
          steps: rpaApi.convertVisualStepsToRPA(scenario.steps)
        },
        account,
      };

      const result = await rpaApi.executeScenario(task);
      
      if (result.success) {
        toast.success(`✅ Сценарий "${scenario.name}" успешно выполнен`);
      } else {
        toast.error(`❌ Ошибка выполнения сценария: ${result.error || 'Неизвестная ошибка'}`);
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка выполнения сценария:', error);
      toast.error(`❌ Ошибка выполнения сценария "${scenario.name}"`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Массовое выполнение сценария на множестве аккаунтов
  const executeScenario = useCallback(async (scenario: RPAScenario, accounts: RPAAccount[]): Promise<any[]> => {
    setIsLoading(true);
    try {
      toast.info(`🚀 Массовый запуск сценария "${scenario.name}" на ${accounts.length} аккаунтах...`);
      
      const results = await rpaApi.executeBulkScenario(scenario, accounts);
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;
      
      if (errorCount === 0) {
        toast.success(`✅ Сценарий успешно выполнен на всех ${accounts.length} аккаунтах`);
      } else {
        toast.warning(`⚠️ Сценарий выполнен: ${successCount} успешно, ${errorCount} с ошибками`);
      }
      
      return results;
    } catch (error) {
      console.error('Ошибка массового выполнения сценария:', error);
      toast.error(`❌ Ошибка массового выполнения сценария "${scenario.name}"`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получение статуса задачи
  const getTaskStatus = useCallback(async (taskId: string): Promise<any> => {
    try {
      return await rpaApi.getTaskStatus(taskId);
    } catch (error) {
      console.error('Ошибка получения статуса задачи:', error);
      return null;
    }
  }, []);

  // Остановка задачи
  const stopTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const result = await rpaApi.stopTask(taskId);
      
      if (result.success) {
        toast.success(`✅ Задача ${taskId} остановлена`);
        return true;
      } else {
        toast.error(`❌ Ошибка остановки задачи: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Ошибка остановки задачи:', error);
      toast.error(`❌ Ошибка остановки задачи ${taskId}`);
      return false;
    }
  }, []);

  // Запуск Multilogin профиля
  const startProfile = useCallback(async (profileId: string): Promise<boolean> => {
    try {
      toast.info(`🚀 Запуск Multilogin профиля ${profileId}...`);
      
      const result = await rpaApi.startMultiloginProfile(profileId);
      
      if (result.success) {
        toast.success(`✅ Профиль ${profileId} запущен`);
        await refreshActiveProfiles();
        return true;
      } else {
        toast.error(`❌ Ошибка запуска профиля: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Ошибка запуска профиля:', error);
      toast.error(`❌ Ошибка запуска профиля ${profileId}`);
      return false;
    }
  }, []);

  // Остановка Multilogin профиля
  const stopProfile = useCallback(async (profileId: string): Promise<boolean> => {
    try {
      toast.info(`🛑 Остановка Multilogin профиля ${profileId}...`);
      
      const result = await rpaApi.stopMultiloginProfile(profileId);
      
      if (result.success) {
        toast.success(`✅ Профиль ${profileId} остановлен`);
        await refreshActiveProfiles();
        return true;
      } else {
        toast.error(`❌ Ошибка остановки профиля: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Ошибка остановки профиля:', error);
      toast.error(`❌ Ошибка остановки профиля ${profileId}`);
      return false;
    }
  }, []);

  // Обновление списка активных профилей
  const refreshActiveProfiles = useCallback(async (): Promise<void> => {
    try {
      const profiles = await rpaApi.getActiveProfiles();
      setActiveProfiles(profiles || []);
    } catch (error) {
      console.error('Ошибка получения активных профилей:', error);
      setActiveProfiles([]);
    }
  }, []);

  // Инициализация при монтировании компонента
  useEffect(() => {
    checkConnection();
    refreshActiveProfiles();
    
    // Периодическая проверка подключения
    const interval = setInterval(() => {
      checkConnection();
      refreshActiveProfiles();
    }, 30000); // каждые 30 секунд
    
    return () => clearInterval(interval);
  }, [checkConnection, refreshActiveProfiles]);

  return {
    isConnected,
    isLoading,
    activeProfiles,
    testAccount,
    createMultiloginProfile,
    executeScenario,
    executeSingleScenario,
    getTaskStatus,
    stopTask,
    startProfile,
    stopProfile,
    refreshActiveProfiles,
    checkConnection,
  };
};

