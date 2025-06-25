
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRPAService } from '@/hooks/useRPAService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Globe,
  User,
  AlertTriangle,
  Wifi
} from 'lucide-react';

interface Account {
  id: string;
  platform: string;
  username: string;
  password: string;
  proxy?: string;
  status?: string;
}

interface AccountTestButtonProps {
  account: Account;
}

export const AccountTestButton: React.FC<AccountTestButtonProps> = ({ account }) => {
  const [isTestingAccount, setIsTestingAccount] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);
  const [testDetails, setTestDetails] = useState<string>('');
  const [isUsingProxy, setIsUsingProxy] = useState<boolean>(false);
  const { toast } = useToast();
  const { submitRPATask, waitForRPACompletion } = useRPAService();

  const getAvailableProxy = async () => {
    try {
      const { data: proxies, error } = await supabase
        .from('proxies')
        .select('*')
        .in('status', ['excellent', 'good'])
        .limit(1);

      if (error) {
        console.log('Ошибка получения прокси (будем работать без прокси):', error);
        return null;
      }

      return proxies && proxies.length > 0 ? proxies[0] : null;
    } catch (error) {
      console.log('Не удалось получить прокси (будем работать без прокси):', error);
      return null;
    }
  };

  const testAccount = async () => {
    setIsTestingAccount(true);
    setTestResult(null);
    setTestDetails('');

    try {
      // Пытаемся получить прокси, но это не критично
      const proxy = await getAvailableProxy();
      setIsUsingProxy(!!proxy);

      toast({
        title: "Запуск реального теста",
        description: `Тестируем аккаунт ${account.username} ${proxy ? 'через прокси' : 'напрямую'}...`
      });

      const testTaskId = `account_test_${account.id}_${Date.now()}`;
      
      // Определяем URL и действия для тестирования
      let testUrl = '';
      let testActions = [];

      switch (account.platform.toLowerCase()) {
        case 'instagram':
          testUrl = 'https://www.instagram.com/accounts/login/';
          testActions = [
            {
              id: 'nav_to_login',
              type: 'navigate',
              timestamp: Date.now(),
              url: testUrl,
              delay: 3000
            },
            {
              id: 'check_page_loaded',
              type: 'check_element',
              timestamp: Date.now() + 1000,
              element: {
                selector: 'input[name="username"]',
                text: 'Username field',
                coordinates: { x: 0, y: 0 }
              },
              delay: 2000
            },
            {
              id: 'type_username',
              type: 'type',
              timestamp: Date.now() + 2000,
              element: {
                selector: 'input[name="username"]',
                text: account.username,
                coordinates: { x: 0, y: 0 }
              },
              delay: 1000
            },
            {
              id: 'type_password',
              type: 'type',
              timestamp: Date.now() + 3000,
              element: {
                selector: 'input[name="password"]',
                text: account.password,
                coordinates: { x: 0, y: 0 }
              },
              delay: 1000
            },
            {
              id: 'click_login',
              type: 'click',
              timestamp: Date.now() + 4000,
              element: {
                selector: 'button[type="submit"]',
                text: 'Log In',
                coordinates: { x: 0, y: 0 }
              },
              delay: 5000
            },
            {
              id: 'check_login_success',
              type: 'check_element',
              timestamp: Date.now() + 5000,
              element: {
                selector: 'nav[role="navigation"], [data-testid="search-input"], .x1n2onr6',
                text: 'Main navigation or search',
                coordinates: { x: 0, y: 0 }
              },
              delay: 3000
            }
          ];
          break;

        case 'youtube':
          testUrl = 'https://accounts.google.com/signin';
          testActions = [
            {
              id: 'nav_to_login',
              type: 'navigate',
              timestamp: Date.now(),
              url: testUrl,
              delay: 3000
            },
            {
              id: 'check_email_field',
              type: 'check_element',
              timestamp: Date.now() + 1000,
              element: {
                selector: 'input[type="email"]',
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
                selector: 'input[type="email"]',
                text: account.username,
                coordinates: { x: 0, y: 0 }
              },
              delay: 1000
            }
          ];
          break;

        case 'facebook':
          testUrl = 'https://www.facebook.com/login';
          testActions = [
            {
              id: 'nav_to_login',
              type: 'navigate',
              timestamp: Date.now(),
              url: testUrl,
              delay: 3000
            },
            {
              id: 'check_page_loaded',
              type: 'check_element',
              timestamp: Date.now() + 1000,
              element: {
                selector: '#email',
                text: 'Email field',
                coordinates: { x: 0, y: 0 }
              },
              delay: 2000
            }
          ];
          break;

        default:
          // Универсальный тест - переход на сайт платформы
          testUrl = `https://${account.platform.toLowerCase()}.com`;
          testActions = [
            {
              id: 'nav_to_site',
              type: 'navigate',
              timestamp: Date.now(),
              url: testUrl,
              delay: 3000
            },
            {
              id: 'check_page_loaded',
              type: 'check_element',
              timestamp: Date.now() + 1000,
              element: {
                selector: 'body',
                text: 'Page body',
                coordinates: { x: 0, y: 0 }
              },
              delay: 2000
            }
          ];
      }

      const rpaTask = {
        taskId: testTaskId,
        url: testUrl,
        actions: testActions,
        accountId: account.id,
        scenarioId: 'account_test',
        blockId: 'test_block',
        timeout: 120000, // Увеличиваем таймаут до 2 минут
        proxy: proxy ? {
          ip: proxy.ip,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
          country: proxy.country
        } : null, // Если прокси нет - работаем без него
        metadata: {
          platform: account.platform,
          username: account.username,
          testType: 'account_login',
          usingProxy: !!proxy
        }
      };

      console.log('Отправляем задачу тестирования:', {
        ...rpaTask,
        proxy: rpaTask.proxy ? 'PROXY_CONFIGURED' : 'NO_PROXY'
      });

      // Отправляем задачу
      const submitResult = await submitRPATask(rpaTask);
      
      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Не удалось отправить задачу тестирования');
      }

      toast({
        title: "Задача отправлена",
        description: `Ожидаем результат тестирования ${proxy ? 'через прокси' : 'напрямую'}...`,
        duration: 3000
      });

      // Ждём результат выполнения
      const result = await waitForRPACompletion(testTaskId, 150000); // 2.5 минуты таймаут

      if (result?.success) {
        setTestResult('success');
        setTestDetails(result.message || 'Аккаунт успешно прошёл тестирование');
        
        // Обновляем статус аккаунта в базе
        await supabase
          .from('accounts')
          .update({ status: 'active' })
          .eq('id', account.id);
        
        toast({
          title: "✅ Аккаунт работает!",
          description: `${account.username} успешно протестирован на ${account.platform}`,
        });
      } else {
        setTestResult('failed');
        setTestDetails(result?.error || 'Тестирование не прошло');
        
        // Обновляем статус аккаунта в базе
        await supabase
          .from('accounts')
          .update({ status: 'failed' })
          .eq('id', account.id);
        
        toast({
          title: "❌ Проблема с аккаунтом",
          description: result?.error || `Тест аккаунта ${account.username} не прошёл`,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Ошибка тестирования аккаунта:', error);
      setTestResult('failed');
      setTestDetails(error.message);
      
      toast({
        title: "Ошибка тестирования",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTestingAccount(false);
      setIsUsingProxy(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" />
          Реальный тест: {account.username}
          {isTestingAccount && isUsingProxy && (
            <Badge variant="outline" className="ml-2 text-green-400 border-green-400">
              <Wifi className="h-3 w-3 mr-1" />
              Прокси
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{account.platform}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{account.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {testResult && (
              <Badge variant={testResult === 'success' ? 'default' : 'destructive'}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {testResult === 'success' ? 'Работает' : 'Ошибка'}
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={testAccount}
          disabled={isTestingAccount}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isTestingAccount ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Тестируем реально...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Протестировать реально
            </>
          )}
        </Button>

        {isTestingAccount && (
          <div className="p-3 bg-blue-900 border border-blue-700 rounded text-blue-300 text-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              RPA-бот тестирует аккаунт {isUsingProxy ? 'через прокси' : 'напрямую'}...
            </div>
          </div>
        )}

        {testResult === 'success' && (
          <div className="p-3 bg-green-900 border border-green-700 rounded text-green-300 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Тест пройден успешно!</span>
            </div>
            <p className="text-xs">{testDetails}</p>
          </div>
        )}

        {testResult === 'failed' && (
          <div className="p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Тест не прошёл</span>
            </div>
            <p className="text-xs">{testDetails}</p>
            <p className="text-xs mt-2 opacity-75">
              Проверьте логин/пароль аккаунта
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          💡 Тест выполняется через реальный RPA-бот<br/>
          🌐 Автоматически использует прокси если доступен
        </div>
      </CardContent>
    </Card>
  );
};
