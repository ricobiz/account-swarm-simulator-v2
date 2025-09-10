
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Users, Target, Download, RefreshCw } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';
import { useLogs } from '@/hooks/useLogs';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

const MetricsPanel = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();
  const { logs } = useLogs();

  // Фильтрация данных по времени
  const filterByTimeRange = (data: any[], dateField: string) => {
    const now = new Date();
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(item => new Date(item[dateField]) >= cutoff);
  };

  // Метрики аккаунтов
  const accountMetrics = useMemo(() => {
    const filteredAccounts = selectedPlatform === 'all' 
      ? accounts 
      : accounts.filter(a => a.platform === selectedPlatform);

    const statusCounts = filteredAccounts.reduce((acc, account) => {
      acc[account.status] = (acc[account.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const platformCounts = accounts.reduce((acc, account) => {
      acc[account.platform] = (acc[account.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: filteredAccounts.length,
      statusCounts,
      platformCounts,
      byPlatform: Object.entries(platformCounts).map(([platform, count]) => ({
        platform,
        count,
        percentage: Math.round((count / accounts.length) * 100)
      }))
    };
  }, [accounts, selectedPlatform]);

  // Метрики сценариев
  const scenarioMetrics = useMemo(() => {
    const filteredScenarios = filterByTimeRange(scenarios, 'created_at');
    const templates = scenarios.filter(s => s.status === 'template');
    const activeScenarios = scenarios.filter(s => s.status !== 'template');

    const statusCounts = activeScenarios.reduce((acc, scenario) => {
      acc[scenario.status] = (acc[scenario.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const platformCounts = filteredScenarios.reduce((acc, scenario) => {
      acc[scenario.platform] = (acc[scenario.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: filteredScenarios.length,
      templates: templates.length,
      active: activeScenarios.length,
      statusCounts,
      platformCounts,
      byStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / activeScenarios.length) * 100) || 0
      }))
    };
  }, [scenarios, timeRange]);

  // Метрики активности
  const activityMetrics = useMemo(() => {
    const filteredLogs = filterByTimeRange(logs, 'created_at');
    
    const statusCounts = filteredLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Активность по дням
    const dailyActivity = filteredLogs.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activityByDay = Object.entries(dailyActivity)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(),
        count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      total: filteredLogs.length,
      statusCounts,
      successRate: filteredLogs.length > 0 ? Math.round((statusCounts.success || 0) / filteredLogs.length * 100) : 0,
      errorRate: filteredLogs.length > 0 ? Math.round((statusCounts.error || 0) / filteredLogs.length * 100) : 0,
      activityByDay
    };
  }, [logs, timeRange]);

  const platforms = [...new Set(accounts.map(a => a.platform))];

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Аналитика и метрики
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="24h">24 часа</SelectItem>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                  <SelectItem value="90d">90 дней</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Все платформы</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Обновить
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Всего аккаунтов</p>
                <p className="text-2xl font-bold text-white">{accountMetrics.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Активные сценарии</p>
                <p className="text-2xl font-bold text-white">{scenarioMetrics.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Успешность</p>
                <p className="text-2xl font-bold text-white">{activityMetrics.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Активность</p>
                <p className="text-2xl font-bold text-white">{activityMetrics.total}</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="accounts" className="text-white">Аккаунты</TabsTrigger>
          <TabsTrigger value="scenarios" className="text-white">Сценарии</TabsTrigger>
          <TabsTrigger value="activity" className="text-white">Активность</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Распределение по платформам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accountMetrics.byPlatform}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ platform, percentage }) => `${platform} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {accountMetrics.byPlatform.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Статусы аккаунтов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(accountMetrics.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{status}</span>
                    <Badge 
                      className={
                        status === 'idle' ? 'bg-green-500' :
                        status === 'working' ? 'bg-yellow-500' :
                        status === 'error' ? 'bg-red-500' :
                        'bg-gray-500'
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Статусы сценариев</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioMetrics.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="status" tick={{ fill: '#9CA3AF' }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Сводка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Всего сценариев</span>
                  <Badge className="bg-blue-500">{scenarioMetrics.total}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Шаблоны</span>
                  <Badge className="bg-purple-500">{scenarioMetrics.templates}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Активные</span>
                  <Badge className="bg-green-500">{scenarioMetrics.active}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Активность по дням</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityMetrics.activityByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Статистика операций</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Успешные</span>
                  <Badge className="bg-green-500">{activityMetrics.statusCounts.success || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ошибки</span>
                  <Badge className="bg-red-500">{activityMetrics.statusCounts.error || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Предупреждения</span>
                  <Badge className="bg-yellow-500">{activityMetrics.statusCounts.warning || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Информация</span>
                  <Badge className="bg-blue-500">{activityMetrics.statusCounts.info || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Показатели эффективности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Успешность</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">{activityMetrics.successRate}%</Badge>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ошибки</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500">{activityMetrics.errorRate}%</Badge>
                    {activityMetrics.errorRate > 10 ? (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsPanel;
