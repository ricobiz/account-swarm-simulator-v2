
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Account {
  id: string;
  username: string;
  platform: string;
  status: string;
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccounts: string[];
  onAccountSelection: (accountId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccounts,
  onAccountSelection,
  onSelectAll,
  onClearSelection
}) => {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Нет доступных аккаунтов для данной платформы</p>
        <p className="text-sm">Импортируйте аккаунты или проверьте их статус</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          Выберите аккаунты ({accounts.length} доступно)
        </label>
        <div className="flex gap-2">
          <Button 
            onClick={onSelectAll}
            variant="outline" 
            size="sm"
            className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
            disabled={accounts.length === 0}
          >
            Выбрать все
          </Button>
          <Button 
            onClick={onClearSelection}
            variant="outline" 
            size="sm"
            className="border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            Очистить
          </Button>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-2">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded">
            <Checkbox
              checked={selectedAccounts.includes(account.id)}
              onCheckedChange={(checked) => onAccountSelection(account.id, !!checked)}
            />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{account.username}</div>
                <div className="text-xs text-gray-400">{account.platform}</div>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  account.status === 'idle' ? 'border-green-500 text-green-400' :
                  account.status === 'working' ? 'border-yellow-500 text-yellow-400' :
                  'border-gray-500 text-gray-400'
                }`}
              >
                {account.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSelector;
