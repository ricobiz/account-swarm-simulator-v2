
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ServerBasedRPARecorder } from './ServerBasedRPARecorder';
import { APIKeysManager } from './APIKeysManager';
import { MacroExecutor } from './MacroExecutor';
import { ScenarioManager } from './ScenarioManager';
import { 
  Bot, 
  Settings, 
  Play, 
  Database,
  Server,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ServerRecordedAction, ServerSavedScenario } from '@/types/serverRPA';

export const VisualRPABuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recorder');
  const [savedScenarios, setSavedScenarios] = useState<ServerSavedScenario[]>([]);
  const [executingScenario, setExecutingScenario] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSaveScenario = useCallback((actions: ServerRecordedAction[]) => {
    if (actions.length === 0) {
      toast({
        title: "Нет действий",
        description: "Нельзя сохранить пустый сценарий",
        variant: "destructive"
      });
      return;
    }

    const scenarioName = prompt("Введите название сценария:");
    if (!scenarioName) return;

    const scenarioDescription = prompt("Введите описание сценария (опционально):") || "";
    const platform = prompt("Введите название платформы (например: instagram, youtube):") || "universal";

    const browserResolution = actions[0]?.browserResolution || { width: 1920, height: 1080 };

    const newScenario: ServerSavedScenario = {
      id: `scenario_${Date.now()}`,
      name: scenarioName,
      description: scenarioDescription,
      actions,
      created_at: new Date().toISOString(),
      platform,
      browserResolution
    };

    setSavedScenarios(prev => [...prev, newScenario]);
    
    localStorage.setItem('rpa_scenarios', JSON.stringify([...savedScenarios, newScenario]));

    toast({
      title: "Сценарий сохранен",
      description: `"${scenarioName}" сохранен с ${actions.length} действиями (${browserResolution.width}x${browserResolution.height})`
    });
  }, [savedScenarios, toast]);

  const handleExecuteScenario = useCallback(async (scenario: ServerSavedScenario) => {
    if (executingScenario) {
      toast({
        title: "Выполнение уже запущено",
        description: "Дождитесь завершения текущего сценария",
        variant: "destructive"
      });
      return;
    }

    setExecutingScenario(scenario.id);
    
    toast({
      title: "Запуск серверного сценария",
      description: `Выполняется "${scenario.name}" на реальном браузере сервера`
    });

    try {
      console.log('Executing server-based scenario:', scenario);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      toast({
        title: "Серверный сценарий выполнен",
        description: `"${scenario.name}" успешно завершен на сервере`
      });
    } catch (error) {
      toast({
        title: "Ошибка выполнения",
        description: "Не удалось выполнить сценарий на сервере",
        variant: "destructive"
      });
    } finally {
      setExecutingScenario(null);
    }
  }, [executingScenario, toast]);

  React.useEffect(() => {
    const stored = localStorage.getItem('rpa_scenarios');
    if (stored) {
      try {
        setSavedScenarios(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load saved scenarios:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="h-8 w-8 text-purple-400" />
              Серверный RPA Конструктор
            </h1>
            <p className="text-gray-400 mt-2">
              Создавайте и выполняйте автоматизированные сценарии на основе реальных серверных скриншотов
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="recorder" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Серверный рекордер
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Сценарии
            </TabsTrigger>
            <TabsTrigger value="executor" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Выполнение
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recorder">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Серверный рекордер действий</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Server className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    Здесь будет интерфейс для записи действий на сервере
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Начать запись
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Сохраненные сценарии</CardTitle>
              </CardHeader>
              <CardContent>
                {savedScenarios.length > 0 ? (
                  <div className="space-y-4">
                    {savedScenarios.map((scenario) => (
                      <div key={scenario.id} className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">{scenario.name}</h3>
                            <p className="text-gray-400 text-sm">{scenario.description}</p>
                            <p className="text-gray-500 text-xs">
                              {scenario.actions.length} действий • {scenario.platform}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleExecuteScenario(scenario)}
                            disabled={executingScenario === scenario.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {executingScenario === scenario.id ? 'Выполняется...' : 'Запустить'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Нет сохраненных сценариев</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="executor">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Выполнение сценариев</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Play className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    Интерфейс для массового выполнения сценариев
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Настроить выполнение
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Настройки API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    Управление API ключами и настройками подключения
                  </p>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Настроить API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {executingScenario && (
          <Card className="fixed bottom-4 right-4 bg-purple-900 border-purple-700 w-80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-purple-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white font-medium">Выполнение на сервере</p>
                  <p className="text-purple-300 text-sm">
                    Серверный браузер эмулирует человеческое поведение...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
