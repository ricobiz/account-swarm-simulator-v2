
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { Database } from '@/integrations/supabase/types';

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

type ScenarioConfig = {
  template_id: string;
  account_id: string;
  steps: any[];
  settings: any;
};

export const useAutomationService = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();

  const launchScenario = async (request: LaunchScenarioRequest): Promise<AutomationServiceResponse> => {
    if (!request.userId) {
      return {
        success: false,
        message: 'Пользователь не авторизован'
      };
    }

    setIsLaunching(true);
    try {
      // В реальном приложении здесь был бы вызов к automation-service
      // Пока создаем сценарии напрямую в базе данных
      const scenarios = [];
      
      for (const accountId of request.accountIds) {
        const { data: template, error: templateError } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', request.templateId)
          .eq('status', 'template')
          .single();

        if (templateError) {
          console.error('Template fetch error:', templateError);
          throw new Error('Шаблон сценария не найден');
        }

        // Безопасно извлекаем конфигурацию
        let templateConfig: any = {};
        if (template.config && typeof template.config === 'object') {
          templateConfig = template.config;
        }

        const scenarioConfig: ScenarioConfig = {
          template_id: request.templateId,
          account_id: accountId,
          steps: templateConfig.steps || [],
          settings: templateConfig.settings || {}
        };

        const { data: scenario, error: scenarioError } = await supabase
          .from('scenarios')
          .insert({
            user_id: request.userId,
            name: template.name,
            platform: template.platform,
            status: 'waiting',
            progress: 0,
            accounts_count: 1,
            config: scenarioConfig as any
          })
          .select()
          .single();

        if (scenarioError) {
          console.error('Scenario creation error:', scenarioError);
          continue;
        }

        scenarios.push(scenario);

        // Обновляем статус аккаунта
        const { error: accountUpdateError } = await supabase
          .from('accounts')
          .update({ 
            status: 'working',
            last_action: new Date().toISOString()
          })
          .eq('id', accountId);

        if (accountUpdateError) {
          console.error('Account update error:', accountUpdateError);
        }

        // Создаем лог
        const { error: logError } = await supabase
          .from('logs')
          .insert({
            user_id: request.userId,
            account_id: accountId,
            scenario_id: scenario.id,
            action: 'Запуск сценария',
            details: `Сценарий "${template.name}" добавлен в очередь`,
            status: 'info'
          });

        if (logError) {
          console.error('Log creation error:', logError);
        }
      }

      const message = `Создано ${scenarios.length} сценариев`;
      handleSuccess(message);

      return {
        success: true,
        message,
        scenarioIds: scenarios.map(s => s.id)
      };

    } catch (error) {
      const errorMessage = handleError(error, 'launchScenario');
      return {
        success: false,
        message: errorMessage
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

      if (error) {
        console.error('Stop scenario error:', error);
        throw error;
      }

      handleSuccess("Выполнение сценария было прервано", "Сценарий остановлен");
      return true;
    } catch (error) {
      handleError(error, 'stopScenario', {
        title: "Ошибка",
        showToast: true
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
