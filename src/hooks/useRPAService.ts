
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { RPATask, RPAResult, RPATaskInfo, RPATaskStatus } from '@/types/rpa';

export const useRPAService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitRPATask = async (task: RPATask): Promise<{ success: boolean; taskId?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    try {
      console.log('Отправка RPA задачи:', task);

      // Add user context to task data for security
      const secureTask = {
        ...task,
        userId: user.id,
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase.functions.invoke('rpa-task', {
        body: { task: secureTask }
      });

      if (error) {
        console.error('Ошибка отправки RPA задачи:', error);
        
        // Log security event
        await supabase.rpc('audit_sensitive_operation', {
          operation_type: 'RPA_TASK_ERROR',
          table_name: 'rpa_tasks',
          record_id: task.taskId,
          details: { error: error.message, taskId: task.taskId, url: task.url }
        });

        toast({
          title: "Ошибка RPA",
          description: "Не удалось отправить задачу RPA-боту",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      console.log('RPA задача успешно отправлена:', data);
      
      // Log successful task submission
      await supabase.rpc('audit_sensitive_operation', {
        operation_type: 'RPA_TASK_SUBMITTED',
        table_name: 'rpa_tasks',
        record_id: data.taskId,
        details: { taskId: task.taskId, url: task.url, actionsCount: task.actions.length, status: 'submitted' }
      });

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
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('rpa-status', {
        body: { taskId, userId: user.id }
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
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startTime = Date.now();
    const pollInterval = 2000;

    while (Date.now() - startTime < maxWaitTime) {
      const taskInfo = await getRPATaskStatus(taskId);
      
      if (taskInfo?.status === 'completed') {
        // Log successful completion
        await supabase.rpc('audit_sensitive_operation', {
          operation_type: 'RPA_TASK_COMPLETED',
          table_name: 'rpa_tasks',
          record_id: taskId,
          details: { duration: Date.now() - startTime, status: 'completed' }
        });
        
        return taskInfo.result || null;
      }
      
      if (taskInfo?.status === 'failed') {
        // Log failure
        await supabase.rpc('audit_sensitive_operation', {
          operation_type: 'RPA_TASK_FAILED',
          table_name: 'rpa_tasks',
          record_id: taskId,
          details: { duration: Date.now() - startTime, error: taskInfo.result?.error }
        });
        
        throw new Error(taskInfo.result?.error || 'RPA задача завершилась с ошибкой');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Log timeout
    await supabase.rpc('audit_sensitive_operation', {
      operation_type: 'RPA_TASK_TIMEOUT',
      table_name: 'rpa_tasks',
      record_id: taskId,
      details: { duration: maxWaitTime, status: 'timeout' }
    });

    throw new Error('Превышено время ожидания выполнения RPA задачи');
  };

  return {
    loading,
    submitRPATask,
    getRPATaskStatus,
    waitForRPACompletion
  };
};
