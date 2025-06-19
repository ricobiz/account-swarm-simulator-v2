
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { VisualRPARecorder } from './VisualRPARecorder';
import { APIKeysManager } from './APIKeysManager';
import { MacroExecutor } from './MacroExecutor';
import { ScenarioManager } from './ScenarioManager';
import { 
  Bot, 
  Settings, 
  Play, 
  Database,
  Eye,
  Zap
} from 'lucide-react';

interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'wait' | 'scroll' | 'hover';
  element: {
    x: number;
    y: number;
    selector?: string;
    text?: string;
    description: string;
  };
  value?: string;
  delay?: number;
  timestamp: number;
}

interface SavedScenario {
  id: string;
  name: string;
  description: string;
  actions: RecordedAction[];
  created_at: string;
  platform: string;
}

export const VisualRPABuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recorder');
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [executingScenario, setExecutingScenario] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSaveScenario = useCallback((actions: RecordedAction[]) => {
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

    const newScenario: SavedScenario = {
      id: `scenario_${Date.now()}`,
      name: scenarioName,
      description: scenarioDescription,
      actions,
      created_at: new Date().toISOString(),
      platform
    };

    setSavedScenarios(prev => [...prev, newScenario]);
    
    // Сохраняем в localStorage
    localStorage.setItem('rpa_scenarios', JSON.stringify([...savedScenarios, newScenario]));

    toast({
      title: "Сценарий сохранен",
      description: `"${scenarioName}" успешно сохранен с ${actions.length} действиями`
    });
  }, [savedScenarios, toast]);

  const handleExecuteScenario = useCallback(async (scenario: SavedScenario) => {
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
      description: `Выполняется "${scenario.name}" с человекоподобным поведением`
    });

    try {
      // Здесь будет интеграция с Python RPA движком
      console.log('Executing scenario with human behavior:', scenario);
      
      // Имитация выполнения для демонстрации
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
            Визуальный RPA Конструктор
          </h1>
          <p className="text-gray-400 mt-2">
            Создавайте и выполняйте автоматизированные сценарии с полной эмуляцией человеческого поведения
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="recorder" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
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

          <TabsContent value="recorder">
            <VisualRPARecorder onSaveScenario={handleSaveScenario} />
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
                  <p className="text-white font-medium">Выполнение сценария</p>
                  <p className="text-purple-300 text-sm">
                    Эмулируется человеческое поведение...
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
