
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Pause, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useScenarios } from '@/hooks/useScenarios';
import { useAuth } from '@/hooks/useAuth';

const ScenariosPanel: React.FC = () => {
  const { scenarios, loading } = useScenarios();
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'bg-pink-500';
      case 'Twitter': return 'bg-blue-500';
      case 'TikTok': return 'bg-black';
      case 'Facebook': return 'bg-blue-600';
      case 'Reddit': return 'bg-orange-500';
      case 'YouTube': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusStats = () => {
    const stats = {
      running: scenarios.filter(s => s.status === 'running').length,
      waiting: scenarios.filter(s => s.status === 'waiting').length,
      stopped: scenarios.filter(s => s.status === 'stopped').length,
      completed: scenarios.filter(s => s.status === 'completed').length,
    };
    return stats;
  };

  if (loading) {
    return <div className="text-white">Загрузка сценариев...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Для работы со сценариями необходимо войти в систему</p>
      </div>
    );
  }

  const stats = getStatusStats();
  const activeScenarios = scenarios.filter(s => s.status !== 'template');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Управление сценариями</h3>
          <p className="text-gray-400">Мониторинг и управление активными сценариями</p>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          Запустить сценарий
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-200 text-lg">Активные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.running}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-200 text-lg">В очереди</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.waiting}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-200 text-lg">Остановлены</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.stopped}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-gray-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg">Завершены</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {activeScenarios.length > 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Сценарий</TableHead>
                  <TableHead className="text-gray-300">Платформа</TableHead>
                  <TableHead className="text-gray-300">Статус</TableHead>
                  <TableHead className="text-gray-300">Аккаунты</TableHead>
                  <TableHead className="text-gray-300">Прогресс</TableHead>
                  <TableHead className="text-gray-300">Создан</TableHead>
                  <TableHead className="text-gray-300">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeScenarios.map((scenario) => (
                  <TableRow key={scenario.id} className="border-gray-700">
                    <TableCell className="text-white font-medium">{scenario.name}</TableCell>
                    <TableCell>
                      <Badge className={`${getPlatformColor(scenario.platform)} text-white`}>
                        {scenario.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(scenario.status)} text-white`}>
                        {scenario.status === 'waiting' ? 'В очереди' : 
                         scenario.status === 'running' ? 'Активен' :
                         scenario.status === 'stopped' ? 'Остановлен' :
                         scenario.status === 'completed' ? 'Завершен' : scenario.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{scenario.accounts_count || 0}</TableCell>
                    <TableCell className="text-gray-300">{scenario.progress || 0}%</TableCell>
                    <TableCell className="text-gray-300 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(scenario.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          {scenario.status === 'running' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-8">
            <div className="text-center text-gray-400">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-2">Нет активных сценариев</h3>
              <p>Создайте и запустите сценарий для начала автоматизации</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScenariosPanel;
