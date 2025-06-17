
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();

  const validateUserOwnership = async (resourceIds: string[], resourceType: 'accounts' | 'scenarios'): Promise<boolean> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from(resourceType)
        .select('id')
        .in('id', resourceIds)
        .eq('user_id', user.id);

      if (error) {
        console.error(`Error validating ${resourceType} ownership:`, error);
        return false;
      }

      const foundIds = data?.map(item => item.id) || [];
      const allOwned = resourceIds.every(id => foundIds.includes(id));

      if (!allOwned) {
        // Log unauthorized access attempt
        await supabase.rpc('audit_sensitive_operation', {
          operation_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          table_name: resourceType,
          record_id: resourceIds[0],
          details: { 
            requestedIds: resourceIds, 
            ownedIds: foundIds,
            resourceType 
          }
        });
      }

      return allOwned;
    } catch (error) {
      console.error(`Error in ownership validation:`, error);
      return false;
    }
  };

  const launchScenario = async (request: LaunchScenarioRequest): Promise<AutomationServiceResponse> => {
    if (!user || request.userId !== user.id) {
      return {
        success: false,
        message: 'Пользователь не авторизован или несоответствие ID'
      };
    }

    setIsLaunching(true);
    try {
      // Security check: Validate user owns the template and accounts
      const templateOwned = await validateUserOwnership([request.templateId], 'scenarios');
      const accountsOwned = await validateUserOwnership(request.accountIds, 'accounts');

      if (!templateOwned || !accountsOwned) {
        const errorMessage = 'Недостаточно прав для доступа к указанным ресурсам';
        await supabase.rpc('audit_sensitive_operation', {
          operation_type: 'SCENARIO_LAUNCH_DENIED',
          table_name: 'scenarios',
          record_id: request.templateId,
          details: { 
            reason: 'ownership_validation_failed',
            templateId: request.templateId,
            accountIds: request.accountIds
          }
        });
        
        return {
          success: false,
          message: errorMessage
        };
      }

      const scenarios = [];
      
      for (const accountId of request.accountIds) {
        const { data: template, error: templateError } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', request.templateId)
          .eq('status', 'template')
          .eq('user_id', user.id)
          .single();

        if (templateError) {
          console.error('Template fetch error:', templateError);
          throw new Error('Шаблон сценария не найден или недоступен');
        }

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
            user_id: user.id,
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

        // Update account status with proper validation
        const { error: accountUpdateError } = await supabase
          .from('accounts')
          .update({ 
            status: 'working',
            last_action: new Date().toISOString()
          })
          .eq('id', accountId)
          .eq('user_id', user.id);

        if (accountUpdateError) {
          console.error('Account update error:', accountUpdateError);
        }

        // Create audit log
        await supabase.rpc('audit_sensitive_operation', {
          operation_type: 'SCENARIO_LAUNCHED',
          table_name: 'scenarios',
          record_id: scenario.id,
          details: {
            templateId: request.templateId,
            accountId: accountId,
            scenarioName: template.name
          }
        });

        // Create user-visible log
        const { error: logError } = await supabase
          .from('logs')
          .insert({
            user_id: user.id,
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
      
      // Log error for security monitoring
      await supabase.rpc('audit_sensitive_operation', {
        operation_type: 'SCENARIO_LAUNCH_ERROR',
        table_name: 'scenarios',
        record_id: request.templateId,
        details: {
          error: errorMessage,
          templateId: request.templateId,
          accountIds: request.accountIds
        }
      });

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLaunching(false);
    }
  };

  const stopScenario = async (scenarioId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Validate ownership before stopping
      const owned = await validateUserOwnership([scenarioId], 'scenarios');
      if (!owned) {
        return false;
      }

      const { error } = await supabase
        .from('scenarios')
        .update({ status: 'stopped' })
        .eq('id', scenarioId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Stop scenario error:', error);
        throw error;
      }

      // Audit log
      await supabase.rpc('audit_sensitive_operation', {
        operation_type: 'SCENARIO_STOPPED',
        table_name: 'scenarios',
        record_id: scenarioId,
        details: { reason: 'user_requested' }
      });

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
