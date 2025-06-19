
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Server
} from 'lucide-react';
import type { ServerSavedScenario } from '@/types/serverRPA';

interface MacroExecutorProps {
  scenarios: ServerSavedScenario[];
  onExecute: (scenario: ServerSavedScenario) => Promise<void>;
  isExecuting: string | null;
}

export const MacroExecutor: React.FC<MacroExecutorProps> = ({
  scenarios,
  onExecute,
  isExecuting
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  const handleExecute = async () => {
    if (!selectedScenarioData) return;

    setExecutionStatus('running');
    setExecutionProgress(0);

    try {
      // Симуляция прогресса выполнения
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await onExecute(selectedScenarioData);
      
      clearInterval(progressInterval);
      setExecutionProgress(100);
      setExecutionStatus('completed');
    } catch (error) {
      setExecutionStatus('error');
    }
  };

  const resetExecution = () => {
    setExecutionStatus('idle');
    setExecutionProgress(0);
  };

  if (scenarios.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400">
            <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">Нет доступных сценариев</h3>
            <p>Создайте серверные сценарии с помощью рекордера для их выполнения</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Выбор сценария */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5" />
            Выполнение серверного макроса
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Выберите сценарий:</label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Выберите сценарий для выполнения" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <span>{scenario.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {scenario.actions.length} действий
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedScenarioData && (
            <div className="bg-gray-700 p-4 rounded border border-gray-600">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{selectedScenarioData.name}</h4>
                  <Badge variant="secondary">
                    {selectedScenarioData.platform}
                  </Badge>
                </div>
                {selectedScenarioData.description && (
                  <p className="text-sm text-gray-400">{selectedScenarioData.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Действий: {selectedScenarioData.actions.length}</span>
                  <span>Разрешение: {selectedScenarioData.browserResolution.width}x{selectedScenarioData.browserResolution.height}</span>
                  <span>Создан: {new Date(selectedScenarioData.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleExecute}
              disabled={!selectedScenario || executionStatus === 'running' || isExecuting !== null}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {executionStatus === 'running' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Выполняется на сервере...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Запустить на сервере
                </>
              )}
            </Button>
            
            {executionStatus !== 'idle' && (
              <Button
                onClick={resetExecution}
                variant="outline"
                className="border-gray-600"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Прогресс выполнения */}
      {executionStatus !== 'idle' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {executionStatus === 'running' && <Clock className="h-5 w-5 animate-spin" />}
              {executionStatus === 'completed' && <CheckCircle className="h-5 w-5 text-green-400" />}
              {executionStatus === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
              Статус выполнения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Прогресс:</span>
                <span className="text-white">{executionProgress}%</span>
              </div>
              <Progress value={executionProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-xs text-gray-400">Статус</div>
                <div className="text-sm font-medium text-white">
                  {executionStatus === 'running' && 'Выполняется на сервере'}
                  {executionStatus === 'completed' && 'Успешно завершено'}
                  {executionStatus === 'error' && 'Ошибка выполнения'}
                </div>
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-xs text-gray-400">Действий выполнено</div>
                <div className="text-sm font-medium text-white">
                  {Math.floor((executionProgress / 100) * (selectedScenarioData?.actions.length || 0))} / {selectedScenarioData?.actions.length || 0}
                </div>
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-xs text-gray-400">Время выполнения</div>
                <div className="text-sm font-medium text-white">
                  ~{Math.ceil((selectedScenarioData?.actions.length || 0) * 2.5)}с
                </div>
              </div>
            </div>

            {executionStatus === 'completed' && (
              <div className="bg-green-900 border border-green-600 p-4 rounded">
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle className="h-5 w-5" />
                  Серверный макрос успешно выполнен
                </div>
                <p className="text-green-300 text-sm mt-1">
                  Все действия были эмулированы на сервере с человекоподобным поведением
                </p>
              </div>
            )}

            {executionStatus === 'error' && (
              <div className="bg-red-900 border border-red-600 p-4 rounded">
                <div className="flex items-center gap-2 text-red-400 font-medium">
                  <XCircle className="h-5 w-5" />
                  Ошибка выполнения сценария
                </div>
                <p className="text-red-300 text-sm mt-1">
                  Не удалось выполнить макрос на сервере. Проверьте соединение и повторите попытку.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Информация о серверном выполнении */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="h-5 w-5" />
            Информация о серверном выполнении
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <Eye className="h-4 w-4 mt-0.5 text-blue-400" />
            <div>
              <div className="font-medium">Реальный браузер</div>
              <div className="text-gray-400">Макрос выполняется в настоящем браузере на сервере</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-green-400" />
            <div>
              <div className="font-medium">Человекоподобное поведение</div>
              <div className="text-gray-400">Добавляются естественные задержки и движения мыши</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Server className="h-4 w-4 mt-0.5 text-purple-400" />
            <div>
              <div className="font-medium">Серверные координаты</div>
              <div className="text-gray-400">Координаты точно соответствуют серверному экрану</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
