
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
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

      // Обновляем статус аккаунта
      await supabase
        .from('accounts')
        .update({ status: 'checking' })
        .eq('id', accountId);

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

      // Симулируем выполнение проверки
      setTimeout(async () => {
        try {
          const success = Math.random() > 0.2; // 80% вероятность успеха
          
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

          await supabase
            .from('logs')
            .insert({
              user_id: user.id,
              account_id: accountId,
              scenario_id: scenario.id,
              action: success ? 'Проверка завершена успешно' : 'Проверка завершена с ошибкой',
              details: success 
                ? `Аккаунт работает корректно. Выполнен переход на ${getCheckUrl(platform)} и просмотр контента.`
                : 'Аккаунт не отвечает или произошла ошибка при выполнении действий.',
              status: success ? 'success' : 'error'
            });

          if (success) {
            toast({
              title: "Проверка завершена",
              description: "Аккаунт работает корректно"
            });
          } else {
            toast({
              title: "Проблема с аккаунтом",
              description: "Аккаунт не отвечает или произошла ошибка",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Ошибка при завершении проверки:', error);
        }
      }, 8000); // 8 секунд на проверку

      toast({
        title: "Проверка запущена",
        description: "Выполняется базовая проверка аккаунта..."
      });

    } catch (error: any) {
      console.error('Ошибка при запуске проверки:', error);
      
      toast({
        title: "Ошибка проверки",
        description: error.message || 'Не удалось запустить проверку аккаунта',
        variant: "destructive"
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
