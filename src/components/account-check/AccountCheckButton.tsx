
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
    console.log('=== ЗАПУСК ПРОВЕРКИ АККАУНТА ===');
    console.log('Account ID:', accountId);
    console.log('Platform:', platform);
    
    if (!user) {
      toast({
        title: "Ошибка авторизации",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    
    try {
      // Получаем данные аккаунта
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (accountError || !account) {
        throw new Error(`Аккаунт не найден: ${accountError?.message}`);
      }

      console.log('Найден аккаунт:', {
        id: account.id,
        username: account.username,
        platform: account.platform
      });

      // Обновляем статус на "проверяется"
      await supabase
        .from('accounts')
        .update({ status: 'checking' })
        .eq('id', accountId);

      // Создаем задачи для проверки
      const taskId = `account_test_${accountId}_${Date.now()}`;
      
      const rpaTask = {
        taskId,
        url: getLoginUrl(platform),
        actions: [
          {
            id: 'nav_to_login',
            type: 'navigate',
            timestamp: Date.now(),
            url: getLoginUrl(platform),
            delay: 3000
          },
          {
            id: 'check_email_field',
            type: 'check_element',
            timestamp: Date.now() + 1000,
            element: {
              selector: getEmailSelector(platform),
              text: 'Email field',
              coordinates: { x: 0, y: 0 }
            },
            delay: 2000
          },
          {
            id: 'type_email',
            type: 'type',
            timestamp: Date.now() + 2000,
            element: {
              selector: getEmailSelector(platform),
              text: account.username,
              coordinates: { x: 0, y: 0 }
            },
            delay: 1000
          }
        ],
        accountId: accountId,
        scenarioId: 'account_test',
        blockId: 'test_block',
        timeout: 120000,
        proxy: null,
        metadata: {
          platform: platform,
          username: account.username,
          testType: 'account_login',
          usingProxy: false
        }
      };

      console.log('Отправляем RPA задачу напрямую:', rpaTask);

      // Отправляем через Edge Function
      const { data: result, error } = await supabase.functions.invoke('rpa-task', {
        body: { task: rpaTask }
      });

      console.log('Результат отправки RPA задачи:', result);

      if (error) {
        throw new Error(`Ошибка Edge Function: ${error.message}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'RPA задача не принята');
      }

      toast({
        title: "Проверка запущена",
        description: `Выполняется проверка аккаунта ${account.username}`,
        duration: 3000
      });

      // Ждем результат (проверяем каждые 5 секунд в течение 2 минут)
      let attempts = 0;
      const maxAttempts = 24; // 2 минуты
      
      const checkResult = async () => {
        attempts++;
        
        try {
          const { data: taskData, error: taskError } = await supabase
            .from('rpa_tasks')
            .select('*')
            .eq('task_id', taskId)
            .single();

          if (!taskError && taskData) {
            console.log('Статус задачи:', taskData.status);
            
            if (taskData.status === 'completed') {
              // Успешное выполнение
              await supabase
                .from('accounts')
                .update({ 
                  status: 'idle',
                  last_action: new Date().toISOString()
                })
                .eq('id', accountId);

              await supabase
                .from('logs')
                .insert({
                  user_id: user.id,
                  account_id: accountId,
                  action: 'Проверка аккаунта завершена',
                  details: `Аккаунт ${account.username} успешно проверен через RPA-бот`,
                  status: 'success'
                });

              toast({
                title: "✅ Проверка успешна",
                description: `Аккаунт ${account.username} работает корректно`,
                duration: 5000
              });
              
              setIsChecking(false);
              return;
              
            } else if (taskData.status === 'failed') {
              // Ошибка выполнения - исправляем TypeScript ошибку
              const resultData = taskData.result_data as any;
              const errorDetails = resultData?.error || 'Неизвестная ошибка';
              throw new Error(`RPA-бот: ${errorDetails}`);
              
            } else if (attempts >= maxAttempts) {
              // Таймаут
              throw new Error('Превышено время ожидания выполнения проверки');
            } else {
              // Продолжаем ждать
              setTimeout(checkResult, 5000);
            }
          } else if (attempts >= maxAttempts) {
            throw new Error('Не удалось получить результат проверки');
          } else {
            setTimeout(checkResult, 5000);
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            throw error;
          } else {
            setTimeout(checkResult, 5000);
          }
        }
      };
      
      // Запускаем проверку результата
      setTimeout(checkResult, 5000);

    } catch (error: any) {
      console.error('Ошибка при проверке аккаунта:', error);
      
      // Обновляем статус на ошибку
      try {
        await supabase
          .from('accounts')
          .update({ status: 'error' })
          .eq('id', accountId);

        await supabase
          .from('logs')
          .insert({
            user_id: user.id,
            account_id: accountId,
            action: 'Ошибка проверки аккаунта',
            details: `Ошибка: ${error.message}`,
            status: 'error'
          });
      } catch (updateError) {
        console.error('Ошибка обновления статуса:', updateError);
      }
      
      toast({
        title: "❌ Ошибка проверки", 
        description: error.message || 'Не удалось проверить аккаунт',
        variant: "destructive",
        duration: 8000
      });
      
      setIsChecking(false);
    }
  };

  // Улучшенные URL для разных платформ
  const getLoginUrl = (platform: string): string => {
    const urls: Record<string, string> = {
      youtube: 'https://accounts.google.com/signin',
      google: 'https://accounts.google.com/signin',
      gmail: 'https://accounts.google.com/signin',
      tiktok: 'https://www.tiktok.com/login/phone-or-email/email',
      instagram: 'https://www.instagram.com/accounts/login/',
      facebook: 'https://www.facebook.com/login',
      twitter: 'https://twitter.com/i/flow/login',
      telegram: 'https://web.telegram.org/k/',
      reddit: 'https://www.reddit.com/login'
    };
    
    return urls[platform.toLowerCase()] || 'https://www.google.com';
  };

  // Улучшенные селекторы для email полей
  const getEmailSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: 'input[type="email"], input[id="identifierId"]',
      google: 'input[type="email"], input[id="identifierId"]', 
      gmail: 'input[type="email"], input[id="identifierId"]',
      tiktok: 'input[name="username"], input[placeholder*="email"]',
      instagram: 'input[name="username"], input[aria-label*="Phone number, username, or email"]',
      facebook: 'input[name="email"], input[id="email"]',
      twitter: 'input[name="text"], input[autocomplete="username"]',
      reddit: 'input[name="username"], input[id="loginUsername"]',
      telegram: 'input[name="phone_number"], .input-field-input'
    };
    
    return selectors[platform.toLowerCase()] || 'input[type="email"], input[name="username"]';
  };

  return (
    <Button
      onClick={handleCheck}
      disabled={disabled || isChecking}
      variant="outline"
      size="sm"
      className="text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
    >
      {isChecking ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Проверяем...
        </>
      ) : (
        <>
          <CheckCircle className="mr-1 h-3 w-3" />
          Проверить реально
        </>
      )}
    </Button>
  );
};
