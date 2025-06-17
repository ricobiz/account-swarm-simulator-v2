
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertCircle, CheckCircle, Clock, Filter, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import { useLogs } from '@/hooks/useLogs';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';

const MonitoringPanel = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const { logs, loading: logsLoading, refetch: refetchLogs } = useLogs();
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();

  // Автообновление каждые 10 секунд если включено
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchLogs]);

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

  // Фильтрация логов
  const filteredLogs = logs.filter(log => {
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesAccount = filterAccount === 'all' || log.account_id === filterAccount;
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesAccount && matchesSearch;
  });

  // Статистика
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    error: logs.filter(l => l.status === 'error').length,
    warning: logs.filter(l => l.status === 'warning').length,
    info: logs.filter(l => l.status === 'info').length
  };

  // Активные сценарии
  const activeScenarios = scenarios.filter(s => s.status === 'running' || s.status === 'waiting');
  
  // Аккаунты по статусам
  const accountStats = {
    idle: accounts.filter(a => a.status === 'idle').length,
    working: accounts.filter(a => a.status === 'working').length,
    error: accounts.filter(a => a.status === 'error').length
  };

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Активные сценарии</p>
                <p className="text-2xl font-bold text-white">{activeScenarios.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Работающие аккаунты</p>
                <p className="text-2xl font-bold text-white">{accountStats.working}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ошибки</p>
                <p className="text-2xl font-bold text-white">{stats.error}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Всего логов</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="logs" className="text-white">Логи активности</TabsTrigger>
          <TabsTrigger value="status" className="text-white">Статус системы</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Логи активности
                </CardTitle>
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
                    onClick={refetchLogs}
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Обновить
                  </Button>
                </div>
              </div>
              
              {/* Фильтры */}
              <div className="flex flex-wrap gap-3 mt-4">
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
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.username} ({account.platform})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  <span className="ml-2 text-gray-300">Загрузка логов...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Логи не найдены</p>
                  <p className="text-sm">Попробуйте изменить фильтры или запустить сценарии</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(log.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">{log.action}</span>
                              <Badge className={getStatusColor(log.status)} size="sm">
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Статус аккаунтов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Свободные</span>
                  <Badge className="bg-green-500">{accountStats.idle}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Работают</span>
                  <Badge className="bg-yellow-500">{accountStats.working}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ошибки</span>
                  <Badge className="bg-red-500">{accountStats.error}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Активные сценарии</CardTitle>
              </CardHeader>
              <CardContent>
                {activeScenarios.length === 0 ? (
                  <p className="text-gray-400">Нет активных сценариев</p>
                ) : (
                  <div className="space-y-2">
                    {activeScenarios.map((scenario) => (
                      <div key={scenario.id} className="bg-gray-900/50 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">{scenario.name}</span>
                          <Badge className={getStatusColor(scenario.status)} size="sm">
                            {scenario.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          {scenario.platform} • {scenario.accounts_count} аккаунт(ов)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringPanel;
