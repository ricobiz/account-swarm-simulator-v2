
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
    if (!user) return;
    
    setIsChecking(true);
    
    try {
      console.log(`Запуск реальной проверки аккаунта ${accountId} на платформе ${platform}`);
      
      // Получаем данные аккаунта
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (accountError || !account) {
        throw new Error('Не удалось получить данные аккаунта');
      }

      // Создаем реальный сценарий проверки
      const checkScenario = {
        user_id: user.id,
        name: `Проверка аккаунта ${account.username}`,
        platform: platform,
        status: 'running',
        config: {
          type: 'account_check',
          accountId: accountId,
          username: account.username,
          platform: platform
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

      // Логируем начало проверки
      await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          account_id: accountId,
          scenario_id: scenario.id,
          action: 'Запуск реальной проверки аккаунта',
          details: `Начата реальная проверка аккаунта ${account.username} на платформе ${platform}`,
          status: 'info'
        });

      toast({
        title: "Запуск проверки",
        description: `Выполняется реальная проверка аккаунта ${account.username}...`,
        duration: 3000
      });

      // Создаем RPA-блок для реальной проверки
      const rpaActions = [
        // Переход на главную страницу платформы
        { type: 'navigate', url: getCheckUrl(platform) },
        { type: 'wait', duration: 3000 },
        
        // Поиск формы входа
        { type: 'click', selector: getLoginButtonSelector(platform) },
        { type: 'wait', duration: 2000 },
        
        // Ввод логина
        { type: 'type', selector: getUsernameSelector(platform), text: account.username },
        { type: 'wait', duration: 1000 },
        
        // Ввод пароля
        { type: 'type', selector: getPasswordSelector(platform), text: account.password },
        { type: 'wait', duration: 1000 },
        
        // Попытка входа
        { type: 'click', selector: getSubmitSelector(platform) },
        { type: 'wait', duration: 5000 },
        
        // Проверка успешности входа
        { type: 'check_element', selector: getSuccessSelector(platform) }
      ];

      console.log('Отправляем задачу на реальный RPA-бот');

      // Выполняем реальную RPA-проверку
      const rpaResult = await executeRPABlock({
        url: getCheckUrl(platform),
        actions: rpaActions,
        accountId: accountId,
        scenarioId: scenario.id,
        blockId: `check_${accountId}`,
        timeout: 120000 // 2 минуты на проверку
      });

      if (rpaResult.success) {
        // Успешная проверка
        await supabase
          .from('scenarios')
          .update({ 
            status: 'completed',
            progress: 100
          })
          .eq('id', scenario.id);

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
            scenario_id: scenario.id,
            action: 'Проверка завершена успешно',
            details: `Аккаунт ${account.username} работает корректно. Вход выполнен успешно.`,
            status: 'success'
          });

        toast({
          title: "Проверка завершена",
          description: `Аккаунт ${account.username} работает корректно`,
          duration: 5000
        });
      } else {
        throw new Error(rpaResult.error || 'RPA-проверка завершилась неудачно');
      }

    } catch (error: any) {
      console.error('Ошибка при реальной проверке аккаунта:', error);
      
      // Обновляем статусы при ошибке
      await supabase
        .from('scenarios')
        .update({ 
          status: 'failed',
          progress: 100
        })
        .eq('user_id', user.id)
        .eq('config->>accountId', accountId);

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
          details: `Ошибка при проверке: ${error.message}`,
          status: 'error'
        });
      
      toast({
        title: "Ошибка проверки",
        description: error.message || 'Не удалось проверить аккаунт',
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getCheckUrl = (platform: string): string => {
    const urls: Record<string, string> = {
      youtube: 'https://accounts.google.com/signin',
      tiktok: 'https://www.tiktok.com/login',
      instagram: 'https://www.instagram.com/accounts/login/',
      twitter: 'https://twitter.com/login',
      telegram: 'https://web.telegram.org/k/',
      reddit: 'https://www.reddit.com/login'
    };
    
    return urls[platform] || 'https://www.google.com';
  };

  const getLoginButtonSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: '[data-testid="sign-in-button"]',
      tiktok: '[data-e2e="login-button"]',
      instagram: 'a[href="/accounts/login/"]',
      twitter: 'a[href="/login"]',
      reddit: 'a[href="/login"]',
      telegram: '.sign-in-button'
    };
    
    return selectors[platform] || 'input[type="submit"]';
  };

  const getUsernameSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: 'input[type="email"]',
      tiktok: 'input[name="username"]',
      instagram: 'input[name="username"]',
      twitter: 'input[name="text"]',
      reddit: 'input[name="username"]',
      telegram: 'input[name="phone_number"]'
    };
    
    return selectors[platform] || 'input[name="username"]';
  };

  const getPasswordSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: 'input[type="password"]',
      tiktok: 'input[name="password"]',
      instagram: 'input[name="password"]',
      twitter: 'input[name="password"]',
      reddit: 'input[name="password"]',
      telegram: 'input[name="password"]'
    };
    
    return selectors[platform] || 'input[name="password"]';
  };

  const getSubmitSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: 'button[type="submit"]',
      tiktok: 'button[data-e2e="login-submit-button"]',
      instagram: 'button[type="submit"]',
      twitter: 'button[role="button"]',
      reddit: 'button[type="submit"]',
      telegram: 'button[type="submit"]'
    };
    
    return selectors[platform] || 'button[type="submit"]';
  };

  const getSuccessSelector = (platform: string): string => {
    const selectors: Record<string, string> = {
      youtube: '[data-testid="avatar"]',
      tiktok: '[data-e2e="profile-icon"]',
      instagram: 'nav[role="navigation"]',
      twitter: '[data-testid="AppTabBar_Home_Link"]',
      reddit: '[data-testid="user-dropdown"]',
      telegram: '.chats-container'
    };
    
    return selectors[platform] || '.user-menu';
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
          Проверяем...
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
