
import React, { useState, useEffect } from 'react';
import AccountsPanel from '@/components/AccountsPanel';
import { AccountTestButton } from '@/components/AccountTestButton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RefreshCw, Bot, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRPA } from '@/hooks/useRPA';
import { RPAAccount } from '@/services/rpaApi';

interface Account {
  id: string;
  platform: string;
  username: string;
  password: string;
  proxy?: string;
  status?: string;
  multilogin_profile_id?: string;
}

const Accounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // RPA интеграция
  const { 
    isConnected, 
    testAccount, 
    createMultiloginProfile,
    activeProfiles,
    refreshActiveProfiles 
  } = useRPA();

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      console.log('Загружаем аккаунты из базы данных...');

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки аккаунтов:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить аккаунты из базы данных",
          variant: "destructive"
        });
        return;
      }

      console.log('Загружено аккаунтов:', data?.length || 0);

      const formattedAccounts: Account[] = (data || []).map(account => ({
        id: account.id,
        platform: account.platform,
        username: account.username,
        password: account.password,
        proxy: account.proxy_id ? `proxy_${account.proxy_id}` : undefined,
        status: account.status
      }));

      setAccounts(formattedAccounts);

    } catch (error: any) {
      console.error('Ошибка при загрузке аккаунтов:', error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Функция для тестирования аккаунта через RPA
  const handleTestAccount = async (account: Account) => {
    const rpaAccount: RPAAccount = {
      id: account.id,
      platform: account.platform,
      username: account.username,
      password: account.password,
      status: 'testing'
    };

    const success = await testAccount(rpaAccount);
    
    if (success) {
      // Обновляем статус аккаунта в базе данных
      await supabase
        .from('accounts')
        .update({ status: 'active' })
        .eq('id', account.id);
      
      loadAccounts(); // Перезагружаем список
    }
  };

  // Функция для создания Multilogin профиля
  const handleCreateProfile = async (account: Account) => {
    const rpaAccount: RPAAccount = {
      id: account.id,
      platform: account.platform,
      username: account.username,
      password: account.password,
      status: 'active'
    };

    const profileId = await createMultiloginProfile(rpaAccount);
    
    if (profileId) {
      // Сохраняем ID профиля в базе данных
      await supabase
        .from('accounts')
        .update({ multilogin_profile_id: profileId })
        .eq('id', account.id);
      
      loadAccounts(); // Перезагружаем список
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Навигация */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Управление аккаунтами</h1>
              <p className="text-gray-300">Добавляйте и тестируйте аккаунты через реальный RPA-бот</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={loadAccounts}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button
              onClick={() => navigate('/visual-rpa')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              RPA Конструктор
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <Home className="h-4 w-4" />
              Главная
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Панель управления аккаунтами */}
          <div>
            <AccountsPanel onAccountAdded={loadAccounts} />
          </div>

          {/* Панель тестирования аккаунтов */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Реальное тестирование аккаунтов</h2>
              <div className="text-sm text-green-400 font-medium">
                🤖 Через RPA-бот
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Загружаем аккаунты...</p>
              </div>
            ) : accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{account.username}</h3>
                        <p className="text-gray-400 text-sm">{account.platform}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.status === 'active' ? 'bg-green-900 text-green-300' :
                            account.status === 'testing' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {account.status || 'Не проверен'}
                          </span>
                          {account.multilogin_profile_id && (
                            <span className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-300">
                              Multilogin: {account.multilogin_profile_id.slice(0, 8)}...
                            </span>
                          )}
                          {isConnected && (
                            <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
                              RPA: Подключен
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleTestAccount(account)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!isConnected}
                        >
                          <Bot className="h-4 w-4 mr-1" />
                          Тест RPA
                        </Button>
                        {!account.multilogin_profile_id && (
                          <Button
                            onClick={() => handleCreateProfile(account)}
                            size="sm"
                            variant="outline"
                            className="border-purple-600 text-purple-400 hover:bg-purple-900"
                            disabled={!isConnected}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Создать профиль
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg mb-2">Нет аккаунтов для тестирования</p>
                <p className="text-sm">Добавьте аккаунты в панели слева</p>
              </div>
            )}

            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">Как работает реальное тестирование:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Добавьте аккаунт в панели слева</li>
                <li>• Нажмите "Протестировать реально"</li>
                <li>• RPA-бот откроет браузер и попытается войти</li>
                <li>• Получите реальный результат авторизации</li>
                <li>• Используйте проверенные аккаунты в сценариях</li>
              </ul>
              
              <div className="mt-3 p-2 bg-blue-900 border border-blue-700 rounded text-blue-300 text-xs">
                💡 Тестирование происходит через настоящий RPA-бот с реальным браузером
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
