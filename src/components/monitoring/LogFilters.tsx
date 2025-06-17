
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search } from 'lucide-react';

interface Account {
  id: string;
  username: string;
  platform: string;
}

interface LogFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterAccount: string;
  setFilterAccount: (account: string) => void;
  autoRefresh: boolean;
  setAutoRefresh: (auto: boolean) => void;
  onRefresh: () => void;
  accounts: Account[];
}

const LogFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterAccount,
  setFilterAccount,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
  accounts
}: LogFiltersProps) => {
  // Filter valid accounts to prevent empty string values
  const validAccounts = accounts.filter(account => {
    return account?.id && 
           typeof account.id === 'string' && 
           account.id.trim() !== '' &&
           account.id.length > 0 &&
           account.username &&
           typeof account.username === 'string' &&
           account.username.trim() !== '';
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск по действию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="success">Успех</SelectItem>
            <SelectItem value="error">Ошибка</SelectItem>
            <SelectItem value="warning">Предупреждение</SelectItem>
            <SelectItem value="info">Информация</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAccount} onValueChange={setFilterAccount}>
          <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="all">Все аккаунты</SelectItem>
            {validAccounts.map((account) => {
              // Double check the value before rendering
              if (!account.id || account.id.trim() === '') {
                console.error('Skipping account with invalid ID:', account);
                return null;
              }
              return (
                <SelectItem key={account.id} value={account.id}>
                  {account.username} ({account.platform})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={autoRefresh ? 'border-green-500 text-green-400' : 'border-gray-600 text-gray-400'}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
          Авто
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Обновить
        </Button>
      </div>
    </div>
  );
};

export default LogFilters;
