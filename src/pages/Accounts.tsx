
import React, { useState } from 'react';
import AccountsPanel from '@/components/AccountsPanel';
import { AccountTestButton } from '@/components/AccountTestButton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Accounts = () => {
  const navigate = useNavigate();
  
  // Пример тестового аккаунта для демонстрации
  const [testAccounts] = useState([
    {
      id: '1',
      platform: 'Instagram',
      username: 'test_user',
      password: 'password123',
      proxy: '123.456.789.0:8080',
      status: 'active'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Улучшенная навигация */}
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
              <p className="text-gray-300">Добавляйте и управляйте аккаунтами для автоматизации</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <AccountsPanel />
          </div>

          {/* Панель тестирования аккаунтов */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Тестирование аккаунтов</h2>
            
            {testAccounts.length > 0 ? (
              <div className="space-y-4">
                {testAccounts.map((account) => (
                  <AccountTestButton key={account.id} account={account} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Добавьте аккаунты для их тестирования</p>
              </div>
            )}

            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">Как проверить аккаунт:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Добавьте аккаунт в панели слева</li>
                <li>• Нажмите "Проверить аккаунт"</li>
                <li>• Дождитесь результата проверки</li>
                <li>• Используйте рабочие аккаунты в сценариях</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
