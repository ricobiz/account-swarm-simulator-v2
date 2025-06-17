
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Pause, Square, Settings, Clock, Users } from 'lucide-react';
import { useScenarios } from '@/hooks/useScenarios';
import { useAccounts } from '@/hooks/useAccounts';
import { toast } from 'sonner';

const ScenarioLaunchPanel: React.FC = () => {
  const { scenarios, addScenario, updateScenario } = useScenarios();
  const { accounts, updateAccount } = useAccounts();
  const [selectedScenario, setSelectedScenario] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const scenarioTemplates = [
    { id: 'telegram_warmup', name: 'Прогрев Telegram', platform: 'Telegram' },
    { id: 'tiktok_upload', name: 'Заливка TikTok', platform: 'TikTok' },
    { id: 'youtube_comment', name: 'Авто-коммент YouTube', platform: 'YouTube' },
    { id: 'instagram_like', name: 'Лайки Instagram', platform: 'Instagram' },
    { id: 'twitter_retweet', name: 'Ретвиты Twitter', platform: 'Twitter' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'stopped': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAccountSelection = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts(prev => [...prev, accountId]);
    } else {
      setSelectedAccounts(prev => prev.filter(id => id !== accountId));
    }
  };

  const handleLaunchScenario = async () => {
    if (!selectedScenario || selectedAccounts.length === 0) {
      toast.error('Выберите сценарий и аккаунты');
      return;
    }

    const template = scenarioTemplates.find(s => s.id === selectedScenario);
    if (!template) return;

    try {
      // Создаем новый сценарий
      const { data: scenario } = await addScenario({
        name: template.name,
        platform: template.platform,
        status: 'running',
        accounts_count: selectedAccounts.length,
        progress: 0,
        next_run: null,
        config: {
          selectedAccounts,
          template: selectedScenario
        }
      });

      if (scenario) {
        // Обновляем статус выбранных аккаунтов
        for (const accountId of selectedAccounts) {
          await updateAccount(accountId, { status: 'working' });
        }

        // Симуляция выполнения сценария
        setTimeout(async () => {
          const progress = Math.floor(Math.random() * 50) + 25;
          await updateScenario(scenario.id, { progress });
          
          setTimeout(async () => {
            const finalStatus = Math.random() > 0.2 ? 'completed' : 'error';
            await updateScenario(scenario.id, { 
              progress: 100, 
              status: finalStatus 
            });

            // Обновляем статус аккаунтов
            for (const accountId of selectedAccounts) {
              await updateAccount(accountId, { 
                status: finalStatus === 'completed' ? 'completed' : 'error' 
              });
            }
          }, 3000);
        }, 2000);

        toast.success('Сценарий запущен');
        setSelectedScenario('');
        setSelectedAccounts([]);
      }
    } catch (error) {
      console.error('Error launching scenario:', error);
      toast.error('Ошибка запуска сценария');
    }
  };

  const handleScenarioAction = async (id: string, action: 'pause' | 'resume' | 'stop') => {
    let newStatus = '';
    switch (action) {
      case 'pause':
        newStatus = 'paused';
        break;
      case 'resume':
        newStatus = 'running';
        break;
      case 'stop':
        newStatus = 'stopped';
        break;
    }

    await updateScenario(id, { status: newStatus });
    toast.success(`Сценарий ${action === 'pause' ? 'приостановлен' : action === 'resume' ? 'возобновлен' : 'остановлен'}`);
  };

  const runningScenarios = scenarios.filter(s => s.status === 'running');
  const pausedScenarios = scenarios.filter(s => s.status === 'paused');
  const completedScenarios = scenarios.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Запуск сценариев</h3>
        <p className="text-gray-400">Управление автоматизированными сценариями</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-200 text-lg">Активные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{runningScenarios.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-200 text-lg">На паузе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pausedScenarios.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-200 text-lg">Завершённые</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{completedScenarios.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-200 text-lg">Всего аккаунтов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{accounts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Запуск нового сценария</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Выберите сценарий" />
              </SelectTrigger>
              <SelectContent>
                {scenarioTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.platform})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleLaunchScenario} 
              disabled={!selectedScenario || selectedAccounts.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600"
            >
              <Play className="mr-2 h-4 w-4" />
              Запустить сценарий
            </Button>
          </div>

          {selectedScenario && (
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Выберите аккаунты ({selectedAccounts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={account.id}
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={(checked) => handleAccountSelection(account.id, checked as boolean)}
                      />
                      <label
                        htmlFor={account.id}
                        className="text-sm text-gray-300 cursor-pointer flex-1"
                      >
                        {account.username} ({account.platform}) - {account.status}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Активные сценарии</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Сценарий</TableHead>
                <TableHead className="text-gray-300">Платформа</TableHead>
                <TableHead className="text-gray-300">Статус</TableHead>
                <TableHead className="text-gray-300">Прогресс</TableHead>
                <TableHead className="text-gray-300">Аккаунты</TableHead>
                <TableHead className="text-gray-300">Создан</TableHead>
                <TableHead className="text-gray-300">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow key={scenario.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{scenario.name}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500 text-white">
                      {scenario.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(scenario.status)} text-white`}>
                      {scenario.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-32">
                    <div className="space-y-1">
                      <Progress value={scenario.progress} className="h-2" />
                      <div className="text-xs text-gray-400">{scenario.progress}%</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {scenario.accounts_count}
                  </TableCell>
                  <TableCell className="text-gray-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(scenario.created_at).toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {scenario.status === 'running' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleScenarioAction(scenario.id, 'pause')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      ) : scenario.status === 'paused' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleScenarioAction(scenario.id, 'resume')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      ) : null}
                      
                      {scenario.status !== 'completed' && scenario.status !== 'stopped' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleScenarioAction(scenario.id, 'stop')}
                          className="border-red-600 text-red-400 hover:bg-red-900"
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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

export default ScenarioLaunchPanel;
