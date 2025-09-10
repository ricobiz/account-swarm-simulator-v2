
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LaunchScenarioParams {
  templateId: string;
  accountIds: string[];
  userId: string;
  config?: any;
}

export const useAutomationService = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { toast } = useToast();

  const launchScenario = async ({ templateId, accountIds, userId, config }: LaunchScenarioParams) => {
    setIsLaunching(true);
    
    try {
      console.log('Launching scenario with config:', { templateId, accountIds, config });

      // Получаем шаблон
      const { data: template, error: templateError } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        throw new Error(`Ошибка получения шаблона: ${templateError.message}`);
      }

      if (!template) {
        throw new Error('Шаблон не найден');
      }

      // Создаем сценарии для каждого аккаунта
      const scenarioPromises = accountIds.map(async (accountId) => {
        // Safely handle template config
        const baseConfig = template.config && typeof template.config === 'object' ? template.config : {};
        
        const scenarioConfig = {
          ...baseConfig,
          executionConfig: config,
          accountId,
          userId,
          templateId
        };

        const { data: newScenario, error: scenarioError } = await supabase
          .from('scenarios')
          .insert({
            user_id: userId,
            name: `${template.name} - Аккаунт ${accountId.slice(-6)}`,
            platform: template.platform,
            status: 'waiting',
            config: scenarioConfig,
            accounts_count: 1,
            progress: 0
          })
          .select()
          .single();

        if (scenarioError) {
          console.error('Ошибка создания сценария:', scenarioError);
          throw scenarioError;
        }

        // Логируем создание сценария
        await supabase
          .from('logs')
          .insert({
            user_id: userId,
            account_id: accountId,
            scenario_id: newScenario.id,
            action: 'Сценарий создан',
            details: `Сценарий "${template.name}" создан для аккаунта с конфигурацией: ${JSON.stringify(config)}`,
            status: 'info'
          });

        return newScenario;
      });

      const createdScenarios = await Promise.all(scenarioPromises);

      // Обновляем статус аккаунтов
      await Promise.all(accountIds.map(accountId =>
        supabase
          .from('accounts')
          .update({ status: 'working' })
          .eq('id', accountId)
      ));

      // Симулируем начало выполнения
      setTimeout(async () => {
        for (const scenario of createdScenarios) {
          await supabase
            .from('scenarios')
            .update({ 
              status: 'running',
              progress: 5
            })
            .eq('id', scenario.id);

          await supabase
            .from('logs')
            .insert({
              user_id: userId,
              scenario_id: scenario.id,
              action: 'Сценарий запущен',
              details: `Выполнение сценария начато с конфигурацией: URLs: ${config?.targetUrls?.join(', ') || 'не указаны'}, Поиск: ${config?.searchQueries?.join(', ') || 'не указан'}`,
              status: 'info'
            });
        }
      }, 2000);

      return {
        success: true,
        message: `${createdScenarios.length} сценариев создано и запущено`,
        scenarios: createdScenarios
      };

    } catch (error: any) {
      console.error('Ошибка запуска сценариев:', error);
      
      toast({
        title: "Ошибка запуска",
        description: error.message || 'Неизвестная ошибка',
        variant: "destructive"
      });

      return {
        success: false,
        message: error.message || 'Ошибка запуска сценариев'
      };
    } finally {
      setIsLaunching(false);
    }
  };

  const stopScenario = async (scenarioId: string): Promise<boolean> => {
    try {
      console.log('Stopping scenario:', scenarioId);

      const { error } = await supabase
        .from('scenarios')
        .update({ 
          status: 'stopped',
          progress: 0
        })
        .eq('id', scenarioId);

      if (error) {
        console.error('Ошибка остановки сценария:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось остановить сценарий",
          variant: "destructive"
        });
        return false;
      }

      await supabase
        .from('logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          scenario_id: scenarioId,
          action: 'Сценарий остановлен',
          details: 'Сценарий остановлен пользователем',
          status: 'info'
        });

      toast({
        title: "Успешно",
        description: "Сценарий остановлен"
      });

      return true;
    } catch (error: any) {
      console.error('Ошибка остановки сценария:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при остановке сценария",
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
