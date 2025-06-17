
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RPATask, RPAResult, RPATaskInfo, RPATaskStatus } from '@/types/rpa';

export const useRPAService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitRPATask = async (task: RPATask): Promise<{ success: boolean; taskId?: string; error?: string }> => {
    setLoading(true);
    try {
      console.log('Отправка RPA задачи:', task);

      const { data, error } = await supabase.functions.invoke('rpa-task', {
        body: { task }
      });

      if (error) {
        console.error('Ошибка отправки RPA задачи:', error);
        toast({
          title: "Ошибка RPA",
          description: "Не удалось отправить задачу RPA-боту",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      console.log('RPA задача успешно отправлена:', data);
      toast({
        title: "RPA задача отправлена",
        description: `Задача ${task.taskId} отправлена RPA-боту`
      });

      return { success: true, taskId: data.taskId };
    } catch (error: any) {
      console.error('Ошибка при отправке RPA задачи:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Произошла ошибка при отправке RPA задачи",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getRPATaskStatus = async (taskId: string): Promise<RPATaskInfo | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('rpa-status', {
        body: { taskId }
      });

      if (error) {
        console.error('Ошибка получения статуса RPA:', error);
        return null;
      }

      return data as RPATaskInfo;
    } catch (error) {
      console.error('Ошибка при получении статуса RPA:', error);
      return null;
    }
  };

  const waitForRPACompletion = async (taskId: string, maxWaitTime = 300000): Promise<RPAResult | null> => {
    const startTime = Date.now();
    const pollInterval = 2000; // Проверяем каждые 2 секунды

    while (Date.now() - startTime < maxWaitTime) {
      const taskInfo = await getRPATaskStatus(taskId);
      
      if (taskInfo?.status === 'completed') {
        return taskInfo.result || null;
      }
      
      if (taskInfo?.status === 'failed') {
        throw new Error(taskInfo.result?.error || 'RPA задача завершилась с ошибкой');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Превышено время ожидания выполнения RPA задачи');
  };

  return {
    loading,
    submitRPATask,
    getRPATaskStatus,
    waitForRPACompletion
  };
};
