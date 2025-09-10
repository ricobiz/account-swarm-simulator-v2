
import React from 'react';
import { useRPAService } from '@/hooks/useRPAService';
import { useProcessMonitorContext } from '@/components/ProcessMonitorProvider';
import { useToast } from '@/hooks/use-toast';
import type { RPATask } from '@/types/rpa';

export const useRPAExecutor = () => {
  const { submitRPATask, waitForRPACompletion } = useRPAService();
  const { startProcess, updateProcess, completeProcess, failProcess } = useProcessMonitorContext();
  const { toast } = useToast();

  const executeRPABlock = async (blockConfig: {
    url: string;
    actions: any[];
    accountId: string;
    scenarioId: string;
    blockId: string;
    timeout?: number;
  }) => {
    const processId = startProcess('template_create', `RPA блок: ${blockConfig.url}`, 'Подготовка RPA задачи');

    try {
      updateProcess(processId, { 
        status: 'running', 
        progress: 10, 
        details: 'Создание RPA задачи' 
      });

      // Создаем уникальный ID для задачи
      const taskId = `rpa_${blockConfig.blockId}_${Date.now()}`;

      // Создаем RPA задачу
      const rpaTask: RPATask = {
        taskId,
        url: blockConfig.url,
        actions: blockConfig.actions,
        accountId: blockConfig.accountId,
        scenarioId: blockConfig.scenarioId,
        blockId: blockConfig.blockId,
        timeout: blockConfig.timeout || 60000
      };

      updateProcess(processId, { 
        progress: 30, 
        details: 'Отправка задачи RPA-боту' 
      });

      // Отправляем задачу
      const submitResult = await submitRPATask(rpaTask);
      
      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Не удалось отправить RPA задачу');
      }

      updateProcess(processId, { 
        progress: 50, 
        details: 'Ожидание выполнения RPA-ботом' 
      });

      // Ждем выполнения
      const result = await waitForRPACompletion(taskId, blockConfig.timeout || 60000);

      updateProcess(processId, { 
        progress: 90, 
        details: 'Обработка результата' 
      });

      if (result?.success) {
        completeProcess(processId, `RPA блок выполнен: ${result.message}`);
        
        toast({
          title: "RPA блок выполнен",
          description: result.message,
        });

        return { success: true, result };
      } else {
        throw new Error(result?.error || 'RPA задача завершилась с ошибкой');
      }

    } catch (error: any) {
      failProcess(processId, error.message, 'Ошибка выполнения RPA блока');
      
      toast({
        title: "Ошибка RPA",
        description: error.message,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    }
  };

  return { executeRPABlock };
};
