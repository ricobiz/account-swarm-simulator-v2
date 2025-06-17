
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Settings, Clock, Users } from 'lucide-react';

interface ActiveScenario {
  id: number;
  name: string;
  platform: string;
  status: 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  accounts: number;
  startTime: string;
  estimatedEnd: string;
}

const ScenarioLaunchPanel: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [activeScenarios, setActiveScenarios] = useState<ActiveScenario[]>([
    {
      id: 1,
      name: 'Auto Like & Follow',
      platform: 'Instagram',
      status: 'running',
      progress: 65,
      accounts: 25,
      startTime: '14:30',
      estimatedEnd: '16:15'
    },
    {
      id: 2,
      name: 'Content Posting',
      platform: 'Twitter',
      status: 'paused',
      progress: 30,
      accounts: 15,
      startTime: '13:45',
      estimatedEnd: '17:30'
    },
    {
      id: 3,
      name: 'Story Viewing',
      platform: 'Instagram',
      status: 'completed',
      progress: 100,
      accounts: 40,
      startTime: '12:00',
      estimatedEnd: '14:00'
    },
  ]);

  const scenarios = [
    { id: 'like_follow', name: 'Auto Like & Follow', platform: 'Instagram' },
    { id: 'content_post', name: 'Content Posting', platform: 'Twitter' },
    { id: 'story_view', name: 'Story Viewing', platform: 'Instagram' },
    { id: 'video_engagement', name: 'Video Engagement', platform: 'TikTok' },
    { id: 'group_interaction', name: 'Group Interaction', platform: 'Facebook' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  const handleLaunchScenario = () => {
    if (selectedScenario) {
      const scenario = scenarios.find(s => s.id === selectedScenario);
      if (scenario) {
        const newScenario: ActiveScenario = {
          id: Date.now(),
          name: scenario.name,
          platform: scenario.platform,
          status: 'running',
          progress: 0,
          accounts: Math.floor(Math.random() * 50) + 10,
          startTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          estimatedEnd: new Date(Date.now() + Math.random() * 3 * 60 * 60 * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };
        setActiveScenarios([newScenario, ...activeScenarios]);
        setSelectedScenario('');
      }
    }
  };

  const handleScenarioAction = (id: number, action: 'pause' | 'resume' | 'stop') => {
    setActiveScenarios(prev => prev.map(scenario => {
      if (scenario.id === id) {
        switch (action) {
          case 'pause':
            return { ...scenario, status: 'paused' as const };
          case 'resume':
            return { ...scenario, status: 'running' as const };
          case 'stop':
            return { ...scenario, status: 'completed' as const, progress: 100 };
          default:
            return scenario;
        }
      }
      return scenario;
    }));
  };

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
            <div className="text-3xl font-bold text-white">
              {activeScenarios.filter(s => s.status === 'running').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-200 text-lg">На паузе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {activeScenarios.filter(s => s.status === 'paused').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-200 text-lg">Завершённые</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {activeScenarios.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-200 text-lg">Всего аккаунтов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {activeScenarios.reduce((sum, s) => sum + s.accounts, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Запуск нового сценария</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Выберите сценарий" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name} ({scenario.platform})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleLaunchScenario} 
              disabled={!selectedScenario}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600"
            >
              <Play className="mr-2 h-4 w-4" />
              Запустить сценарий
            </Button>
            
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              Настройки
            </Button>
          </div>
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
                <TableHead className="text-gray-300">Время</TableHead>
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
                    {scenario.accounts}
                  </TableCell>
                  <TableCell className="text-gray-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {scenario.startTime} - {scenario.estimatedEnd}
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
                      
                      {scenario.status !== 'completed' && (
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
