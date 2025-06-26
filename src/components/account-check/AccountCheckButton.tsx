
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRPAExecutor } from '@/components/rpa/RPAExecutor';
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
  const { executeRPABlock } = useRPAExecutor();

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

      toast({
        title: "Проверка запущена",
        description: `Выполняется реальная проверка аккаунта ${account.username}`,
        duration: 3000
      });

      // Создаем упрощенную RPA задачу для проверки
      const rpaActions = [
        // Переход на страницу входа
        { 
          id: 'nav_to_login',
          type: 'navigate', 
          timestamp: Date.now(),
          url: getLoginUrl(platform),
          delay: 3000
        },
        // Проверка наличия поля email
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
        // Ввод email (только первые шаги для проверки)
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
      ];

      console.log('RPA действия:', rpaActions);

      // Выполняем RPA проверку
      const rpaResult = await executeRPABlock({
        url: getLoginUrl(platform),
        actions: rpaActions,
        accountId: accountId,
        scenarioId: 'account_test',
        blockId: 'test_block',
        timeout: 120000
      });

      console.log('Результат RPA проверки:', rpaResult);

      if (rpaResult.success) {
        // Успешная проверка
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
            details: `Аккаунт ${account.username} успешно проверен. Поля доступны, данные корректны.`,
            status: 'success'
          });

        toast({
          title: "✅ Проверка успешна",
          description: `Аккаунт ${account.username} прошел базовую проверку`,
          duration: 5000
        });
      } else {
        throw new Error(rpaResult.error || 'Проверка завершилась неудачно');
      }

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
    } finally {
      setIsChecking(false);
    }
  };

  // Упрощенные URL для разных платформ
  const getLoginUrl = (platform: string): string => {
    const urls: Record<string, string> = {
      youtube: 'https://accounts.google.com/signin',
      google: 'https://accounts.google.com/signin',
      gmail: 'https://accounts.google.com/signin',
      tiktok: 'https://www.tiktok.com/login',
      instagram: 'https://www.instagram.com/accounts/login/',
      facebook: 'https://www.facebook.com/login',
      twitter: 'https://twitter.com/login',
      telegram: 'https://web.telegram.org/k/',
      reddit: 'https://www.reddit.com/login'
    };
    
    return urls[platform.toLowerCase()] || 'https://www.google.com';
  };

  // Универсальные селекторы для email полей
  const getEmailSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: 'input[type="email"]',
      google: 'input[type="email"]', 
      gmail: 'input[type="email"]',
      tiktok: 'input[name="username"]',
      instagram: 'input[name="username"]',
      facebook: 'input[name="email"]',
      twitter: 'input[name="text"]',
      reddit: 'input[name="username"]',
      telegram: 'input[name="phone_number"]'
    };
    
    return selectors[platform.toLowerCase()] || 'input[type="email"]';
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
