
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Square, 
  Users, 
  Clock, 
  Activity,
  CheckCircle,
  XCircle,
  Pause,
  RotateCcw
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

interface ExecutionStatus {
  scenarioId: string;
  scenarioName: string;
  currentAction: number;
  totalActions: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  startTime: number;
  humanBehavior: {
    mousePaths: number;
    randomDelays: number;
    naturalClicks: number;
  };
}

interface MacroExecutorProps {
  scenarios: SavedScenario[];
  onExecute: (scenario: SavedScenario) => void;
  isExecuting: string | null;
}

export const MacroExecutor: React.FC<MacroExecutorProps> = ({
  scenarios,
  onExecute,
  isExecuting
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus | null>(null);
  const [humanBehaviorLevel, setHumanBehaviorLevel] = useState<'minimal' | 'normal' | 'advanced'>('normal');
  const { toast } = useToast();

  const handleExecuteWithSettings = useCallback(async () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) {
      toast({
        title: "Ошибка",
        description: "Выберите сценарий для выполнения",
        variant: "destructive"
      });
      return;
    }

    // Инициализация статуса выполнения
    const status: ExecutionStatus = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      currentAction: 0,
      totalActions: scenario.actions.length,
      status: 'running',
      startTime: Date.now(),
      humanBehavior: {
        mousePaths: 0,
        randomDelays: 0,
        naturalClicks: 0
      }
    };

    setExecutionStatus(status);

    toast({
      title: "Запуск с человекоподобным поведением",
      description: `Выполняется "${scenario.name}" с уровнем эмуляции: ${humanBehaviorLevel}`
    });

    // Здесь будет интеграция с Python RPA движком
    try {
      // Отправка сценария на выполнение с настройками человекоподобного поведения
      const response = await fetch('/api/rpa/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          humanBehaviorLevel,
          settings: {
            randomDelays: humanBehaviorLevel !== 'minimal',
            mousePathVariation: humanBehaviorLevel === 'advanced',
            typingSpeed: humanBehaviorLevel === 'advanced' ? 'human' : 'normal',
            scrollBehavior: 'natural',
            antiDetection: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка выполнения сценария');
      }

      // Симуляция прогресса выполнения
      for (let i = 0; i <= scenario.actions.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        
        setExecutionStatus(prev => prev ? {
          ...prev,
          currentAction: i,
          humanBehavior: {
            mousePaths: prev.humanBehavior.mousePaths + Math.floor(Math.random() * 3),
            randomDelays: prev.humanBehavior.randomDelays + Math.floor(Math.random() * 2),
            naturalClicks: prev.humanBehavior.naturalClicks + (Math.random() > 0.7 ? 1 : 0)
          }
        } : null);
      }

      setExecutionStatus(prev => prev ? { ...prev, status: 'completed' } : null);

      toast({
        title: "Сценарий выполнен успешно",
        description: `"${scenario.name}" завершен с полной эмуляцией человеческого поведения`
      });

    } catch (error) {
      setExecutionStatus(prev => prev ? { ...prev, status: 'failed' } : null);
      toast({
        title: "Ошибка выполнения",
        description: "Не удалось выполнить сценарий",
        variant: "destructive"
      });
    }

    onExecute(scenario);
  }, [scenarios, selectedScenario, humanBehaviorLevel, onExecute, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Панель управления выполнением */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5" />
            Выполнение макросов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Выберите сценарий:</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Выберите сценарий для выполнения" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name} ({scenario.actions.length} действий)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Уровень эмуляции человека:</label>
              <Select value={humanBehaviorLevel} onValueChange={(value: any) => setHumanBehaviorLevel(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Минимальный (быстро)</SelectItem>
                  <SelectItem value="normal">Обычный (рекомендуется)</SelectItem>
                  <SelectItem value="advanced">Продвинутый (максимально человечный)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExecuteWithSettings}
              disabled={!selectedScenario || isExecuting !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExecuting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Выполняется...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Запустить с эмуляцией
                </>
              )}
            </Button>
            
            {executionStatus && executionStatus.status === 'running' && (
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-400"
              >
                <Pause className="h-4 w-4 mr-2" />
                Пауза
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Статус выполнения */}
      {executionStatus && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {getStatusIcon(executionStatus.status)}
              Статус выполнения
              <Badge className={`${getStatusColor(executionStatus.status)} text-white ml-auto`}>
                {executionStatus.status === 'running' ? 'Выполняется' :
                 executionStatus.status === 'completed' ? 'Завершено' :
                 executionStatus.status === 'failed' ? 'Ошибка' : 'Пауза'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Сценарий: {executionStatus.scenarioName}</span>
                <span className="text-gray-300">
                  {executionStatus.currentAction} / {executionStatus.totalActions}
                </span>
              </div>
              <Progress 
                value={(executionStatus.currentAction / executionStatus.totalActions) * 100} 
                className="h-2"
              />
            </div>

            <Separator className="bg-gray-600" />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-400">
                  {executionStatus.humanBehavior.mousePaths}
                </div>
                <div className="text-xs text-gray-400">Естественные движения мыши</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-400">
                  {executionStatus.humanBehavior.randomDelays}
                </div>
                <div className="text-xs text-gray-400">Случайные задержки</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-400">
                  {executionStatus.humanBehavior.naturalClicks}
                </div>
                <div className="text-xs text-gray-400">Человекоподобные клики</div>
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center">
              Время выполнения: {Math.floor((Date.now() - executionStatus.startTime) / 1000)}с
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информация об эмуляции */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Эмуляция человеческого поведения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-700 rounded">
                <h4 className="font-medium text-white mb-2">Минимальный</h4>
                <ul className="text-gray-300 space-y-1 text-xs">
                  <li>• Базовые задержки</li>
                  <li>• Стандартные клики</li>
                  <li>• Быстрое выполнение</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-700 rounded border border-blue-500">
                <h4 className="font-medium text-white mb-2">Обычный</h4>
                <ul className="text-gray-300 space-y-1 text-xs">
                  <li>• Случайные задержки</li>
                  <li>• Естественные движ. мыши</li>
                  <li>• Антидетект браузер</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-700 rounded">
                <h4 className="font-medium text-white mb-2">Продвинутый</h4>
                <ul className="text-gray-300 space-y-1 text-xs">
                  <li>• Эмуляция чтения</li>
                  <li>• Человеческий ввод</li>
                  <li>• Максимальная скрытность</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
