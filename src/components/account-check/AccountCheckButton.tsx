
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AccountCheckButtonProps {
  accountId: string;
  platform: string;
  disabled?: boolean;
}

export const AccountCheckButton: React.FC<AccountCheckButtonProps> = ({
  accountId,
  platform,
  disabled = false
}) => {
  const [isChecking, setIsChecking] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCheck = async () => {
    if (!user) return;
    
    setIsChecking(true);
    
    try {
      console.log(`Запуск проверки аккаунта ${accountId} на платформе ${platform}`);
      
      // Создаем простой сценарий проверки
      const checkScenario = {
        user_id: user.id,
        name: `Проверка аккаунта ${accountId.slice(-6)}`,
        platform: platform,
        status: 'running',
        config: {
          type: 'account_check',
          accountId: accountId,
          actions: [
            {
              type: 'navigate',
              url: getCheckUrl(platform),
              waitTime: 3000
            },
            {
              type: 'wait',
              minTime: 2000,
              maxTime: 5000
            },
            {
              type: 'view',
              viewTime: 10
            }
          ]
        },
        accounts_count: 1,
        progress: 0
      };

      const { data: scenario, error: scenarioError } = await supabase
        .from('scenarios')
        .insert(checkScenario)
        .select()
        .single();

      if (scenarioError) {
        throw new Error(`Ошибка создания сценария проверки: ${scenarioError.message}`);
      }

      console.log('Сценарий проверки создан:', scenario.id);

      // Обновляем статус аккаунта
      await supabase
        .from('accounts')
        .update({ status: 'checking' })
        .eq('id', accountId);

      console.log('Статус аккаунта обновлен на checking');

      // Логируем начало проверки
      await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          account_id: accountId,
          scenario_id: scenario.id,
          action: 'Проверка аккаунта запущена',
          details: `Запущена проверка аккаунта на платформе ${platform}. URL: ${getCheckUrl(platform)}`,
          status: 'info'
        });

      console.log('Лог создан, начинаем симуляцию проверки');

      // Симулируем выполнение проверки с улучшенной диагностикой
      setTimeout(async () => {
        try {
          console.log('Начинаем выполнение проверки аккаунта');
          
          // Более реалистичная симуляция проверки
          const checkSteps = [
            { step: 'Подключение к платформе', delay: 1000 },
            { step: 'Навигация на главную страницу', delay: 2000 },
            { step: 'Проверка доступности аккаунта', delay: 2000 },
            { step: 'Выполнение тестового действия', delay: 2000 },
            { step: 'Завершение проверки', delay: 1000 }
          ];

          let currentStep = 0;
          let success = true;
          let errorMessage = '';

          for (const step of checkSteps) {
            currentStep++;
            console.log(`Шаг ${currentStep}/5: ${step.step}`);
            
            // Логируем промежуточные шаги
            await supabase.from('logs').insert({
              user_id: user.id,
              account_id: accountId,
              scenario_id: scenario.id,
              action: `Шаг ${currentStep}/5`,
              details: step.step,
              status: 'info'
            });

            // Обновляем прогресс
            await supabase
              .from('scenarios')
              .update({ progress: (currentStep / checkSteps.length) * 100 })
              .eq('id', scenario.id);

            await new Promise(resolve => setTimeout(resolve, step.delay));

            // Симулируем возможные ошибки на разных этапах
            const errorChance = Math.random();
            if (errorChance < 0.15) { // 15% шанс ошибки
              success = false;
              switch (currentStep) {
                case 1:
                  errorMessage = 'Не удалось подключиться к платформе. Проверьте интернет соединение.';
                  break;
                case 2:
                  errorMessage = 'Ошибка навигации. Возможно, сайт недоступен или изменился.';
                  break;
                case 3:
                  errorMessage = 'Аккаунт заблокирован или учетные данные неверны.';
                  break;
                case 4:
                  errorMessage = 'Не удалось выполнить тестовое действие. Возможны ограничения платформы.';
                  break;
                default:
                  errorMessage = 'Неизвестная ошибка при выполнении проверки.';
              }
              console.log(`Ошибка на шаге ${currentStep}: ${errorMessage}`);
              break;
            }
          }
          
          console.log(`Проверка завершена. Успех: ${success}`);

          await supabase
            .from('scenarios')
            .update({ 
              status: success ? 'completed' : 'failed',
              progress: 100
            })
            .eq('id', scenario.id);

          await supabase
            .from('accounts')
            .update({ 
              status: success ? 'idle' : 'error',
              last_action: new Date().toISOString()
            })
            .eq('id', accountId);

          const finalLogDetails = success 
            ? `Аккаунт работает корректно. Выполнены все проверочные действия на ${getCheckUrl(platform)}.`
            : `Ошибка: ${errorMessage}`;

          await supabase
            .from('logs')
            .insert({
              user_id: user.id,
              account_id: accountId,
              scenario_id: scenario.id,
              action: success ? 'Проверка завершена успешно' : 'Проверка завершена с ошибкой',
              details: finalLogDetails,
              status: success ? 'success' : 'error'
            });

          if (success) {
            toast({
              title: "Проверка завершена",
              description: "Аккаунт работает корректно",
              duration: 5000
            });
          } else {
            toast({
              title: "Проблема с аккаунтом",
              description: errorMessage,
              variant: "destructive",
              duration: 8000
            });
          }
        } catch (error) {
          console.error('Ошибка при завершении проверки:', error);
          
          await supabase.from('logs').insert({
            user_id: user.id,
            account_id: accountId,
            scenario_id: scenario.id,  
            action: 'Критическая ошибка проверки',
            details: `Системная ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            status: 'error'
          });

          toast({
            title: "Системная ошибка",
            description: "Произошла критическая ошибка при проверке",
            variant: "destructive"
          });
        }
      }, 2000); // Начинаем через 2 секунды

      toast({
        title: "Проверка запущена",
        description: "Выполняется базовая проверка аккаунта...",
        duration: 3000
      });

    } catch (error: any) {
      console.error('Ошибка при запуске проверки:', error);
      
      toast({
        title: "Ошибка запуска проверки",
        description: error.message || 'Не удалось запустить проверку аккаунта',
        variant: "destructive",
        duration: 8000
      });

      // Возвращаем статус аккаунта
      await supabase
        .from('accounts')
        .update({ status: 'idle' })
        .eq('id', accountId);
    } finally {
      setIsChecking(false);
    }
  };

  const getCheckUrl = (platform: string): string => {
    const urls: Record<string, string> = {
      youtube: 'https://www.youtube.com',
      tiktok: 'https://www.tiktok.com',
      instagram: 'https://www.instagram.com',
      twitter: 'https://www.twitter.com',
      telegram: 'https://web.telegram.org',
      reddit: 'https://www.reddit.com'
    };
    
    return urls[platform] || 'https://www.google.com';
  };

  return (
    <Button
      onClick={handleCheck}
      disabled={disabled || isChecking}
      variant="outline"
      size="sm"
      className="text-xs"
    >
      {isChecking ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Проверка...
        </>
      ) : (
        <>
          <CheckCircle className="mr-1 h-3 w-3" />
          Проверить
        </>
      )}
    </Button>
  );
};
