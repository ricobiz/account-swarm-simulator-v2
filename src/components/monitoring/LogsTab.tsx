
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import LogFilters from './LogFilters';
import LogsList from './LogsList';

interface Log {
  id: string;
  user_id: string;
  account_id: string | null;
  scenario_id: string | null;
  action: string;
  details: string | null;
  status: string;
  created_at: string;
  accounts?: {
    username: string;
    platform: string;
  };
  scenarios?: {
    name: string;
  };
}

interface Account {
  id: string;
  username: string;
  platform: string;
}

interface LogsTabProps {
  logs: Log[];
  loading: boolean;
  accounts: Account[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterAccount: string;
  setFilterAccount: (account: string) => void;
  autoRefresh: boolean;
  setAutoRefresh: (auto: boolean) => void;
  onRefresh: () => void;
}

const LogsTab = ({
  logs,
  loading,
  accounts,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterAccount,
  setFilterAccount,
  autoRefresh,
  setAutoRefresh,
  onRefresh
}: LogsTabProps) => {
  // Фильтрация логов
  const filteredLogs = logs.filter(log => {
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesAccount = filterAccount === 'all' || log.account_id === filterAccount;
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesAccount && matchesSearch;
  });

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Логи активности
        </CardTitle>
        
        <LogFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterAccount={filterAccount}
          setFilterAccount={setFilterAccount}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          onRefresh={onRefresh}
          accounts={accounts}
        />
      </CardHeader>
      
      <CardContent>
        <LogsList 
          logs={filteredLogs} 
          loading={loading} 
          accounts={accounts} 
        />
      </CardContent>
    </Card>
  );
};

export default LogsTab;
