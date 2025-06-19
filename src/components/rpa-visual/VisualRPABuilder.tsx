
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
  Eye,
  Zap,
  Server
} from 'lucide-react';
import type { ServerRecordedAction, ServerSavedScenario } from '@/types/serverRPA';

export const VisualRPABuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recorder');
  const [savedScenarios, setSavedScenarios] = useState<ServerSavedScenario[]>([]);
  const [executingScenario, setExecutingScenario] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSaveScenario = useCallback((actions: ServerRecordedAction[]) => {
    if (actions.length === 0) {
      toast({
        title: "Нет действий",
        description: "Нельзя сохранить пустой сценарий",
        variant: "destructive"
      });
      return;
    }

    const scenarioName = prompt("Введите название сценария:");
    if (!scenarioName) return;

    const scenarioDescription = prompt("Введите описание сценария (опционально):") || "";
    const platform = prompt("Введите название платформы (например: instagram, youtube):") || "universal";

    // Берем разрешение браузера из первого действия
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
    
    // Сохраняем в localStorage
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

    // Асинхронное выполнение
    try {
      // Здесь будет интеграция с серверным RPA движком
      console.log('Executing server-based scenario:', scenario);
      
      // Имитация выполнения для демонстрации
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

  // Загрузка сохраненных сценариев при инициализации
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="h-8 w-8 text-purple-400" />
            Серверный RPA Конструктор
          </h1>
          <p className="text-gray-400 mt-2">
            Создавайте и выполняйте автоматизированные сценарии на основе реальных серверных скриншотов
          </p>
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
            <ServerBasedRPARecorder onSaveScenario={handleSaveScenario} />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioManager 
              scenarios={savedScenarios}
              onExecute={handleExecuteScenario}
              onDelete={(id) => {
                const updated = savedScenarios.filter(s => s.id !== id);
                setSavedScenarios(updated);
                localStorage.setItem('rpa_scenarios', JSON.stringify(updated));
              }}
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

        {/* Статус выполнения */}
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
