
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
    console.log('=== 🚀 ЗАПУСК ПРОВЕРКИ АККАУНТА ===');
    console.log('Account ID:', accountId);
    console.log('Platform:', platform);
    
    if (!user) {
      toast({
        title: "❌ Ошибка авторизации",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    
    try {
      // Получаем данные аккаунта
      console.log('📋 Получение данных аккаунта...');
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (accountError || !account) {
        throw new Error(`Аккаунт не найден: ${accountError?.message}`);
      }

      console.log('✅ Найден аккаунт:', {
        id: account.id,
        username: account.username,
        platform: account.platform,
        status: account.status
      });

      // Показываем пользователю данные для проверки
      console.log('🔐 Данные для входа:');
      console.log('- Email/Username:', account.username);
      console.log('- Password:', '***' + account.password.slice(-3));
      console.log('- Platform:', account.platform);

      // Обновляем статус на "проверяется"
      console.log('⏳ Обновление статуса аккаунта на "checking"...');
      await supabase
        .from('accounts')
        .update({ status: 'checking' })
        .eq('id', accountId);

      // Создаем улучшенную RPA задачу
      const taskId = `account_check_${accountId}_${Date.now()}`;
      
      const rpaTask = {
        taskId,
        url: getLoginUrl(platform),
        actions: [
          {
            id: 'navigate_to_login',
            type: 'navigate',
            timestamp: Date.now(),
            url: getLoginUrl(platform),
            delay: 3000
          },
          {
            id: 'wait_for_load',
            type: 'wait',
            timestamp: Date.now() + 1000,
            duration: 2000,
            delay: 1000
          },
          {
            id: 'find_email_field',
            type: 'check_element',
            timestamp: Date.now() + 2000,
            element: {
              selector: getEmailSelector(platform),
              text: 'Email field',
              coordinates: { x: 0, y: 0 }
            },
            delay: 2000
          },
          {
            id: 'enter_username',
            type: 'type',
            timestamp: Date.now() + 3000,
            element: {
              selector: getEmailSelector(platform),
              text: account.username,
              coordinates: { x: 0, y: 0 }
            },
            delay: 2000
          }
        ],
        accountId: accountId,
        scenarioId: 'account_verification',
        blockId: 'login_test',
        timeout: 120000,
        proxy: null,
        metadata: {
          platform: platform,
          username: account.username,
          testType: 'account_login_verification',
          usingProxy: false,
          checkReason: 'user_initiated_account_check'
        }
      };

      console.log('📤 Отправка RPA задачи:', {
        taskId: taskId,
        platform: platform,
        username: account.username,
        url: getLoginUrl(platform)
      });

      // Отправляем через Edge Function
      const { data: result, error } = await supabase.functions.invoke('rpa-task', {
        body: { task: rpaTask }
      });

      console.log('📨 Результат Edge Function:', result);

      if (error) {
        throw new Error(`Ошибка отправки задачи: ${error.message}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'RPA задача не была принята к выполнению');
      }

      toast({
        title: "🚀 Проверка запущена",
        description: `Выполняется проверка аккаунта ${account.username} на платформе ${platform}`,
        duration: 4000
      });

      // Ждем результат с подробным логированием
      let attempts = 0;
      const maxAttempts = 30; // 2.5 минуты
      
      const checkResult = async () => {
        attempts++;
        console.log(`🔍 Проверка результата (попытка ${attempts}/${maxAttempts})...`);
        
        try {
          const { data: taskData, error: taskError } = await supabase
            .from('rpa_tasks')
            .select('*')
            .eq('task_id', taskId)
            .single();

          if (!taskError && taskData) {
            console.log(`📊 Статус задачи: ${taskData.status}`);
            
            if (taskData.status === 'completed') {
              // Успешное выполнение
              console.log('✅ Задача выполнена успешно!');
              
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
                  action: 'Проверка аккаунта завершена успешно',
                  details: `Аккаунт ${account.username} на платформе ${platform} работает корректно`,
                  status: 'success'
                });

              toast({
                title: "✅ Проверка успешна!",
                description: `Аккаунт ${account.username} работает корректно на ${platform}`,
                duration: 6000
              });
              
              setIsChecking(false);
              return;
              
            } else if (taskData.status === 'failed') {
              // Ошибка выполнения
              const resultData = taskData.result_data as any;
              const errorDetails = resultData?.error || resultData?.message || 'Неизвестная ошибка RPA-бота';
              console.log('❌ Задача завершилась с ошибкой:', errorDetails);
              throw new Error(`RPA-бот: ${errorDetails}`);
              
            } else if (attempts >= maxAttempts) {
              // Таймаут
              console.log('⏰ Превышено время ожидания');
              throw new Error('Превышено время ожидания выполнения проверки (2.5 мин)');
            } else {
              // Продолжаем ждать
              console.log(`⏳ Задача в процессе (${taskData.status}), ждем еще...`);
              setTimeout(checkResult, 5000);
            }
          } else if (attempts >= maxAttempts) {
            throw new Error('Не удалось получить результат проверки');
          } else {
            console.log('⏳ Задача еще не появилась в базе, ждем...');
            setTimeout(checkResult, 5000);
          }
        } catch (error) {
          console.error('❌ Ошибка при проверке результата:', error);
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
      console.error('💥 КРИТИЧЕСКАЯ ОШИБКА при проверке аккаунта:', error);
      
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
            details: `Платформа: ${platform}, Ошибка: ${error.message}`,
            status: 'error'
          });
      } catch (updateError) {
        console.error('❌ Ошибка обновления статуса:', updateError);
      }
      
      toast({
        title: "❌ Ошибка проверки аккаунта", 
        description: error.message || 'Не удалось проверить аккаунт. Проверьте данные и попробуйте снова.',
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
      x: 'https://x.com/i/flow/login',
      telegram: 'https://web.telegram.org/k/',
      reddit: 'https://www.reddit.com/login'
    };
    
    const url = urls[platform.toLowerCase()] || 'https://accounts.google.com/signin';
    console.log(`🌐 URL для ${platform}: ${url}`);
    return url;
  };

  // Улучшенные селекторы для полей email/username
  const getEmailSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: 'input[type="email"], input[id="identifierId"], input[name="identifier"]',
      google: 'input[type="email"], input[id="identifierId"], input[name="identifier"]', 
      gmail: 'input[type="email"], input[id="identifierId"], input[name="identifier"]',
      tiktok: 'input[name="username"], input[placeholder*="email" i], input[placeholder*="Email" i]',
      instagram: 'input[name="username"], input[aria-label*="Phone number, username, or email" i]',
      facebook: 'input[name="email"], input[id="email"], input[type="email"]',
      twitter: 'input[name="text"], input[autocomplete="username"], input[data-testid="ocfEnterTextField"]',
      x: 'input[name="text"], input[autocomplete="username"], input[data-testid="ocfEnterTextField"]',
      reddit: 'input[name="username"], input[id="loginUsername"]',
      telegram: 'input[name="phone_number"], .input-field-input'
    };
    
    const selector = selectors[platform.toLowerCase()] || 'input[type="email"], input[name="username"], input[name="identifier"]';
    console.log(`🎯 Селектор для ${platform}: ${selector}`);
    return selector;
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
          Проверить аккаунт
        </>
      )}
    </Button>
  );
};
