
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Eye, Ban, AlertTriangle, CheckCircle } from 'lucide-react';

interface Account {
  id: number;
  username: string;
  platform: string;
  status: 'alive' | 'working' | 'banned' | 'error';
  lastAction: string;
  proxy: string;
  scenario: string;
  actionsCount: number;
  errors: number;
}

const MonitoringPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const [accounts] = useState<Account[]>([
    {
      id: 1,
      username: '@user1_instagram',
      platform: 'Instagram',
      status: 'working',
      lastAction: '2 мин назад',
      proxy: '192.168.1.1',
      scenario: 'Auto Like & Follow',
      actionsCount: 45,
      errors: 0
    },
    {
      id: 2,
      username: '@user2_twitter',
      platform: 'Twitter',
      status: 'alive',
      lastAction: '5 мин назад',
      proxy: '192.168.1.2',
      scenario: 'Content Posting',
      actionsCount: 23,
      errors: 1
    },
    {
      id: 3,
      username: '@user3_tiktok',
      platform: 'TikTok',
      status: 'banned',
      lastAction: '1 час назад',
      proxy: '192.168.1.3',
      scenario: 'Video Engagement',
      actionsCount: 12,
      errors: 5
    },
    {
      id: 4,
      username: '@user4_instagram',
      platform: 'Instagram',
      status: 'error',
      lastAction: '10 мин назад',
      proxy: '192.168.1.4',
      scenario: 'Story Viewing',
      actionsCount: 8,
      errors: 3
    },
    {
      id: 5,
      username: '@user5_facebook',
      platform: 'Facebook',
      status: 'working',
      lastAction: '1 мин назад',
      proxy: '192.168.1.5',
      scenario: 'Group Interaction',
      actionsCount: 67,
      errors: 0
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive': return 'bg-blue-500';
      case 'working': return 'bg-green-500';
      case 'banned': return 'bg-red-500';
      case 'error': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alive': return <CheckCircle className="h-3 w-3" />;
      case 'working': return <Eye className="h-3 w-3" />;
      case 'banned': return <Ban className="h-3 w-3" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'bg-pink-500';
      case 'Twitter': return 'bg-blue-500';
      case 'TikTok': return 'bg-black';
      case 'Facebook': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.scenario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || account.platform.toLowerCase() === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const statusCounts = {
    alive: accounts.filter(a => a.status === 'alive').length,
    working: accounts.filter(a => a.status === 'working').length,
    banned: accounts.filter(a => a.status === 'banned').length,
    error: accounts.filter(a => a.status === 'error').length,
  };

  const handleExportReport = () => {
    const csvContent = [
      'Username,Platform,Status,Last Action,Proxy,Scenario,Actions,Errors',
      ...filteredAccounts.map(account => 
        `${account.username},${account.platform},${account.status},${account.lastAction},${account.proxy},${account.scenario},${account.actionsCount},${account.errors}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Мониторинг аккаунтов</h3>
          <p className="text-gray-400">Отслеживание состояния и активности аккаунтов</p>
        </div>
        <Button onClick={handleExportReport} className="bg-blue-500 hover:bg-blue-600">
          <Download className="mr-2 h-4 w-4" />
          Экспорт отчёта
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-200 text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Живые
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{statusCounts.alive}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-200 text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              В работе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{statusCounts.working}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-200 text-lg flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Заблокированы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{statusCounts.banned}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-200 text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ошибки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{statusCounts.error}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск аккаунтов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="alive">Живые</SelectItem>
                <SelectItem value="working">В работе</SelectItem>
                <SelectItem value="banned">Заблокированы</SelectItem>
                <SelectItem value="error">Ошибки</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Платформа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все платформы</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-400 flex items-center">
              Найдено: {filteredAccounts.length} из {accounts.length}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Аккаунт</TableHead>
                <TableHead className="text-gray-300">Платформа</TableHead>
                <TableHead className="text-gray-300">Статус</TableHead>
                <TableHead className="text-gray-300">Последнее действие</TableHead>
                <TableHead className="text-gray-300">Прокси</TableHead>
                <TableHead className="text-gray-300">Сценарий</TableHead>
                <TableHead className="text-gray-300">Действия</TableHead>
                <TableHead className="text-gray-300">Ошибки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{account.username}</TableCell>
                  <TableCell>
                    <Badge className={`${getPlatformColor(account.platform)} text-white`}>
                      {account.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(account.status)} text-white flex items-center gap-1 w-fit`}>
                      {getStatusIcon(account.status)}
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{account.lastAction}</TableCell>
                  <TableCell className="text-gray-300 font-mono">{account.proxy}</TableCell>
                  <TableCell className="text-gray-300">{account.scenario}</TableCell>
                  <TableCell className="text-gray-300">{account.actionsCount}</TableCell>
                  <TableCell className={account.errors > 0 ? "text-red-400" : "text-green-400"}>
                    {account.errors}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringPanel;
