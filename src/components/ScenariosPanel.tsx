
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScenarioTemplateManager from './ScenarioTemplateManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Square, Trash2, Settings, Loader2 } from 'lucide-react';
import { useScenarios } from '@/hooks/useScenarios';
import { useToast } from '@/hooks/use-toast';

const ScenariosPanel = () => {
  const { scenarios, loading, deleteScenario, updateScenario } = useScenarios();
  const { toast } = useToast();

  const handleDeleteScenario = async (id: string) => {
    const result = await deleteScenario(id);
    if (result.error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сценарий",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Успех",
        description: "Сценарий удален"
      });
    }
  };

  const handleStopScenario = async (id: string) => {
    const result = await updateScenario(id, { status: 'stopped' });
    if (result.error) {
      toast({
        title: "Ошибка",
        description: "Не удалось остановить сценарий",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Успех",
        description: "Сценарий остановлен"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'stopped': return 'bg-gray-500';
      case 'template': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Выполняется';
      case 'waiting': return 'В очереди';
      case 'completed': return 'Завершен';
      case 'failed': return 'Ошибка';
      case 'stopped': return 'Остановлен';
      case 'template': return 'Шаблон';
      default: return status;
    }
  };

  // Разделяем сценарии на шаблоны и активные
  const templates = scenarios.filter(s => s.status === 'template');
  const activeScenarios = scenarios.filter(s => s.status !== 'template');

  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
        <TabsTrigger value="templates" className="text-white">
          Шаблоны сценариев ({templates.length})
        </TabsTrigger>
        <TabsTrigger value="active" className="text-white">
          Активные сценарии ({activeScenarios.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="templates" className="space-y-6">
        <ScenarioTemplateManager />
      </TabsContent>

      <TabsContent value="active" className="space-y-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Активные сценарии
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                <span className="ml-2 text-gray-300">Загрузка сценариев...</span>
              </div>
            ) : activeScenarios.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Нет активных сценариев</p>
                <p className="text-sm">Запустите сценарии на вкладке "Запуск"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeScenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{scenario.name}</h3>
                        <p className="text-sm text-gray-400">
                          {scenario.platform} • {scenario.accounts_count} аккаунт(ов)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(scenario.status)}>
                          {getStatusText(scenario.status)}
                        </Badge>
                        <div className="flex gap-1">
                          {(scenario.status === 'running' || scenario.status === 'waiting') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStopScenario(scenario.id)}
                              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900"
                            >
                              <Square className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteScenario(scenario.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {scenario.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Прогресс</span>
                          <span className="text-white">{scenario.progress || 0}%</span>
                        </div>
                        <Progress value={scenario.progress || 0} className="w-full" />
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-400">
                      Создан: {new Date(scenario.created_at).toLocaleString()}
                      {scenario.updated_at !== scenario.created_at && (
                        <span className="ml-4">
                          Обновлен: {new Date(scenario.updated_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ScenariosPanel;
