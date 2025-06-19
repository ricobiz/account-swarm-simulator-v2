
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ServerBasedRPARecorder } from './ServerBasedRPARecorder';
import { APIKeysManager } from './APIKeysManager';
import { MacroExecutor } from './MacroExecutor';
import { ScenarioManager } from './ScenarioManager';
import { ImprovedAdvancedScenarioBuilder } from '../scenario-flow/ImprovedAdvancedScenarioBuilder';
import { 
  Bot, 
  Settings, 
  Play, 
  Database,
  Server,
  ArrowLeft,
  Workflow
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Node, Edge } from '@xyflow/react';
import type { ServerRecordedAction, ServerSavedScenario } from '@/types/serverRPA';

export const VisualRPABuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('constructor');
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
      description: `"${scenarioName}" сохранен с ${actions.length} действиями`
    });
  }, [savedScenarios, toast]);

  const handleSaveFromConstructor = useCallback((nodes: Node[], edges: Edge[]) => {
    const scenarioName = prompt("Введите название сценария:");
    if (!scenarioName) return;

    const scenarioDescription = prompt("Введите описание сценария (опционально):") || "";
    const platform = prompt("Введите название платформы:") || "universal";

    // Конвертируем узлы в действия
    const actions: ServerRecordedAction[] = nodes
      .filter(node => node.type === 'action')
      .map((node, index) => ({
        id: node.id,
        type: node.data.type || 'click',
        timestamp: Date.now() + index * 1000,
        element: {
          selector: node.data.config?.selector || '',
          text: node.data.config?.text || '',
          coordinates: { x: 0, y: 0 }
        },
        url: node.data.config?.url || '',
        delay: node.data.config?.delay || 1000
      }));

    const newScenario: ServerSavedScenario = {
      id: `scenario_${Date.now()}`,
      name: scenarioName,
      description: scenarioDescription,
      actions,
      created_at: new Date().toISOString(),
      platform,
      browserResolution: { width: 1920, height: 1080 }
    };

    setSavedScenarios(prev => [...prev, newScenario]);
    localStorage.setItem('rpa_scenarios', JSON.stringify([...savedScenarios, newScenario]));

    toast({
      title: "Сценарий сохранен из конструктора",
      description: `"${scenarioName}" создан с ${actions.length} действиями`
    });

    // Переключаемся на вкладку сценариев
    setActiveTab('scenarios');
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
      title: "Запуск сценария",
      description: `Выполняется "${scenario.name}"`
    });

    try {
      console.log('Executing scenario:', scenario);
      
      // Симуляция выполнения
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Сценарий выполнен",
        description: `"${scenario.name}" успешно завершен`
      });
    } catch (error) {
      toast({
        title: "Ошибка выполнения",
        description: "Не удалось выполнить сценарий",
        variant: "destructive"
      });
    } finally {
      setExecutingScenario(null);
    }
  }, [executingScenario, toast]);

  const handleDeleteScenario = useCallback((id: string) => {
    setSavedScenarios(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('rpa_scenarios', JSON.stringify(updated));
      return updated;
    });
    
    toast({
      title: "Сценарий удален",
      description: "Сценарий успешно удален"
    });
  }, [toast]);

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
              Визуальный RPA Конструктор
            </h1>
            <p className="text-gray-400 mt-2">
              Создавайте автоматизированные сценарии с помощью визуального конструктора
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="constructor" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Конструктор
            </TabsTrigger>
            <TabsTrigger value="recorder" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Рекордер
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

          <TabsContent value="constructor">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-blue-400" />
                  Визуальный конструктор сценариев
                </CardTitle>
                <p className="text-gray-400">
                  Перетаскивайте блоки и соединяйте их для создания сценариев автоматизации
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[800px]">
                  <ImprovedAdvancedScenarioBuilder onSave={handleSaveFromConstructor} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recorder">
            <ServerBasedRPARecorder onSaveScenario={handleSaveScenario} />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioManager
              scenarios={savedScenarios}
              onExecute={handleExecuteScenario}
              onDelete={handleDeleteScenario}
              isExecuting={executingScenario}
            />
          </TabsContent>

          <TabsContent value="executor">
            <MacroExecutor
              scenarios={savedScenarios}
              onExecute={handleExecuteScenario}
              isExecuting={executingScenario}
            />
          </TabsContent>

          <TabsContent value="settings">
            <APIKeysManager />
          </TabsContent>
        </Tabs>

        {executingScenario && (
          <Card className="fixed bottom-4 right-4 bg-purple-900 border-purple-700 w-80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-purple-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white font-medium">Выполнение сценария</p>
                  <p className="text-purple-300 text-sm">
                    Сценарий выполняется...
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
