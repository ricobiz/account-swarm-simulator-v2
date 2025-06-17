
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Download, 
  Filter, 
  RefreshCw,
  Calendar,
  User,
  Play
} from 'lucide-react';
import { useLogs } from '@/hooks/useLogs';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';

const MonitoringPanel = () => {
  const { logs, loading, fetchLogs, exportToCsv } = useLogs();
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();
  
  const [filters, setFilters] = useState({
    accountId: '',
    scenarioId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    fetchLogs(activeFilters);
  };

  const clearFilters = () => {
    setFilters({
      accountId: '',
      scenarioId: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    fetchLogs();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Логи и отчёты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-900/50 rounded-lg">
            <Select value={filters.accountId} onValueChange={(value) => handleFilterChange('accountId', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Аккаунт" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="">Все аккаунты</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.username} ({account.platform})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.scenarioId} onValueChange={(value) => handleFilterChange('scenarioId', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Сценарий" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="">Все сценарии</SelectItem>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="">Все статусы</SelectItem>
                <SelectItem value="info">Информация</SelectItem>
                <SelectItem value="success">Успех</SelectItem>
                <SelectItem value="warning">Предупреждение</SelectItem>
                <SelectItem value="error">Ошибка</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="От даты"
            />

            <Input
              type="datetime-local"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="До даты"
            />

            <div className="flex gap-2">
              <Button 
                onClick={applyFilters}
                variant="outline" 
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
              >
                <Filter className="mr-2 h-4 w-4" />
                Фильтр
              </Button>
              <Button 
                onClick={clearFilters}
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-gray-700"
              >
                Сброс
              </Button>
            </div>
          </div>

          {/* Действия */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                onClick={() => fetchLogs()}
                variant="outline" 
                size="sm"
                disabled={loading}
                className="border-green-500 text-green-400 hover:bg-green-500/20"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
            
            <Button 
              onClick={() => exportToCsv(logs)}
              variant="outline" 
              size="sm"
              disabled={logs.length === 0}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              <Download className="mr-2 h-4 w-4" />
              Экспорт CSV
            </Button>
          </div>

          {/* Таблица логов */}
          <div className="bg-gray-900/50 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Загрузка логов...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-gray-400">
                <Calendar className="h-6 w-6 mr-2" />
                Логи не найдены
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Дата</TableHead>
                    <TableHead className="text-gray-300">Действие</TableHead>
                    <TableHead className="text-gray-300">Аккаунт</TableHead>
                    <TableHead className="text-gray-300">Сценарий</TableHead>
                    <TableHead className="text-gray-300">Статус</TableHead>
                    <TableHead className="text-gray-300">Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-gray-700 hover:bg-gray-800/30">
                      <TableCell className="text-gray-300 font-mono text-sm">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {log.accounts ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{log.accounts.username}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.accounts.platform}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {log.scenarios ? (
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            <span>{log.scenarios.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 max-w-xs truncate">
                        {log.details || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">{logs.length}</div>
                <div className="text-sm text-blue-200">Всего записей</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">
                  {logs.filter(l => l.status === 'success').length}
                </div>
                <div className="text-sm text-green-200">Успешных</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">
                  {logs.filter(l => l.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-200">Предупреждений</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">
                  {logs.filter(l => l.status === 'error').length}
                </div>
                <div className="text-sm text-red-200">Ошибок</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringPanel;
