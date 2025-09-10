
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { AccountCheckButton } from './AccountCheckButton';

export const QuickAccountCheck: React.FC = () => {
  const { accounts, loading } = useAccounts();
  const [checkingAll, setCheckingAll] = React.useState(false);

  // Расширяем фильтр - показываем аккаунты со статусами idle, error, checking и working
  const availableAccounts = accounts.filter(account => 
    ['idle', 'error', 'checking', 'working'].includes(account.status)
  );

  console.log('QuickAccountCheck - Все аккаунты:', accounts);
  console.log('QuickAccountCheck - Доступные аккаунты:', availableAccounts);

  const handleCheckAll = async () => {
    setCheckingAll(true);
    
    // Запускаем проверку всех доступных аккаунтов с небольшой задержкой
    for (let i = 0; i < availableAccounts.length; i++) {
      setTimeout(() => {
        const button = document.querySelector(`[data-account-id="${availableAccounts[i].id}"] button`) as HTMLButtonElement;
        if (button) {
          button.click();
        }
      }, i * 2000); // 2 секунды между запусками
    }
    
    // Сбрасываем состояние через время, достаточное для всех проверок
    setTimeout(() => {
      setCheckingAll(false);
    }, availableAccounts.length * 2000 + 10000);
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Быстрая проверка аккаунтов</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Загрузка аккаунтов...</p>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Быстрая проверка аккаунтов</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Аккаунты не найдены. Добавьте аккаунты в систему.</p>
        </CardContent>
      </Card>
    );
  }

  if (availableAccounts.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Быстрая проверка аккаунтов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Нет аккаунтов доступных для проверки</p>
            <div className="text-xs text-gray-500">
              <p>Всего аккаунтов: {accounts.length}</p>
              {accounts.map(acc => (
                <p key={acc.id}>
                  {acc.username} ({acc.platform}) - статус: {acc.status}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Быстрая проверка аккаунтов</CardTitle>
          <Button
            onClick={handleCheckAll}
            disabled={checkingAll}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {checkingAll ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Проверяем...
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Проверить все ({availableAccounts.length})
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {availableAccounts.slice(0, 5).map((account) => (
          <div 
            key={account.id} 
            className="flex items-center justify-between p-2 bg-gray-700/50 rounded text-sm"
            data-account-id={account.id}
          >
            <div className="flex items-center gap-2">
              <span className="text-white">{account.username}</span>
              <span className="text-gray-400">({account.platform})</span>
              <span className={`text-xs px-2 py-1 rounded ${
                account.status === 'idle' ? 'bg-green-600' : 
                account.status === 'error' ? 'bg-red-600' : 
                account.status === 'checking' ? 'bg-blue-600' : 
                account.status === 'working' ? 'bg-yellow-600' : 'bg-gray-600'
              }`}>
                {account.status === 'idle' ? 'Готов' : 
                 account.status === 'error' ? 'Ошибка' : 
                 account.status === 'checking' ? 'Проверяется' :
                 account.status === 'working' ? 'Работает' : account.status}
              </span>
            </div>
            <AccountCheckButton
              accountId={account.id}
              platform={account.platform}
              disabled={checkingAll}
            />
          </div>
        ))}
        {availableAccounts.length > 5 && (
          <p className="text-gray-400 text-xs">
            И еще {availableAccounts.length - 5} аккаунтов...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
