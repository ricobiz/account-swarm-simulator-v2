
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LaunchScenarioRequest {
  templateId: string;
  accountIds: string[];
  userId: string;
}

interface AutomationServiceResponse {
  success: boolean;
  message: string;
  scenarioIds?: string[];
}

export const useAutomationService = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { toast } = useToast();

  const launchScenario = async (request: LaunchScenarioRequest): Promise<AutomationServiceResponse> => {
    setIsLaunching(true);
    try {
      // В реальном приложении здесь был бы вызов к automation-service
      // Пока создаем сценарии напрямую в базе данных
      const scenarios = [];
      
      for (const accountId of request.accountIds) {
        const { data: template } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', request.templateId)
          .eq('status', 'template')
          .single();

        if (!template) {
          throw new Error('Шаблон сценария не найден');
        }

        const { data: scenario, error } = await supabase
          .from('scenarios')
          .insert({
            user_id: request.userId,
            name: template.name,
            platform: template.platform,
            status: 'waiting',
            progress: 0,
            accounts_count: 1,
            config: {
              template_id: request.templateId,
              account_id: accountId,
              steps: template.config?.steps || [],
              settings: template.config?.settings || {}
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Ошибка создания сценария:', error);
          continue;
        }

        scenarios.push(scenario);

        // Обновляем статус аккаунта
        await supabase
          .from('accounts')
          .update({ 
            status: 'working',
            last_action: new Date().toISOString()
          })
          .eq('id', accountId);

        // Создаем лог
        await supabase
          .from('logs')
          .insert({
            user_id: request.userId,
            account_id: accountId,
            scenario_id: scenario.id,
            action: 'Запуск сценария',
            details: `Сценарий "${template.name}" добавлен в очередь`,
            status: 'info'
          });
      }

      return {
        success: true,
        message: `Создано ${scenarios.length} сценариев`,
        scenarioIds: scenarios.map(s => s.id)
      };

    } catch (error) {
      console.error('Ошибка запуска сценария:', error);
      return {
        success: false,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    } finally {
      setIsLaunching(false);
    }
  };

  const stopScenario = async (scenarioId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('scenarios')
        .update({ status: 'stopped' })
        .eq('id', scenarioId);

      if (error) throw error;

      toast({
        title: "Сценарий остановлен",
        description: "Выполнение сценария было прервано",
      });

      return true;
    } catch (error) {
      console.error('Ошибка остановки сценария:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось остановить сценарий",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    launchScenario,
    stopScenario,
    isLaunching
  };
};
