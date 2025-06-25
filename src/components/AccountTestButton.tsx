
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Globe,
  User
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
  const { toast } = useToast();

  const testAccount = async () => {
    setIsTestingAccount(true);
    setTestResult(null);

    try {
      // Симуляция тестирования аккаунта
      toast({
        title: "Тестирование аккаунта",
        description: `Проверяем аккаунт ${account.username} на ${account.platform}...`
      });

      // Симулируем задержку и случайный результат
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isSuccess = Math.random() > 0.3; // 70% шанс успеха
      
      setTestResult(isSuccess ? 'success' : 'failed');
      
      toast({
        title: isSuccess ? "Аккаунт работает!" : "Ошибка аккаунта",
        description: isSuccess 
          ? `Аккаунт ${account.username} успешно авторизован`
          : `Не удалось войти в аккаунт ${account.username}`,
        variant: isSuccess ? "default" : "destructive"
      });

    } catch (error) {
      setTestResult('failed');
      toast({
        title: "Ошибка тестирования",
        description: "Произошла ошибка при проверке аккаунта",
        variant: "destructive"
      });
    } finally {
      setIsTestingAccount(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" />
          Тест аккаунта: {account.username}
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
            {account.proxy && (
              <div className="text-sm text-gray-400">
                Прокси: {account.proxy}
              </div>
            )}
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
              Тестирование...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Проверить аккаунт
            </>
          )}
        </Button>

        {testResult === 'success' && (
          <div className="p-3 bg-green-900 border border-green-700 rounded text-green-300 text-sm">
            ✅ Аккаунт успешно авторизован и готов к использованию
          </div>
        )}

        {testResult === 'failed' && (
          <div className="p-3 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
            ❌ Проверьте логин/пароль и настройки прокси
          </div>
        )}
      </CardContent>
    </Card>
  );
};
