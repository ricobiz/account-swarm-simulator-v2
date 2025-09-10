
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';

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

interface LogsListProps {
  logs: Log[];
  loading: boolean;
  accounts: Account[];
}

const LogsList = ({ logs, loading, accounts }: LogsListProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-300">Загрузка логов...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-2">Логи не найдены</p>
        <p className="text-sm">Попробуйте изменить фильтры или запустить сценарии</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getStatusIcon(log.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{log.action}</span>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
                {log.details && (
                  <p className="text-sm text-gray-400 mb-2">{log.details}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Аккаунт: {accounts.find(a => a.id === log.account_id)?.username || 'Unknown'}
                  </span>
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogsList;
