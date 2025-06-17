
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  Users, 
  Globe,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';
import { useLogs } from '@/hooks/useLogs';
import { useToast } from '@/hooks/use-toast';

const AVAILABLE_SCENARIOS = [
  { id: 'telegram_warmup', name: 'Прогрев Telegram', platform: 'telegram' },
  { id: 'tiktok_upload', name: 'Заливка TikTok', platform: 'tiktok' },
  { id: 'youtube_comment', name: 'Авто-коммент YouTube', platform: 'youtube' },
  { id: 'instagram_like', name: 'Лайки Instagram', platform: 'instagram' },
  { id: 'twitter_retweet', name: 'Ретвиты Twitter', platform: 'twitter' }
];

const ScenarioLaunchPanel = () => {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { accounts, updateAccount } = useAccounts();
  const { scenarios, addScenario, updateScenario } = useScenarios();
  const { addLog } = useLogs();
  const { toast } = useToast();

  // Фильтруем аккаунты по платформе выбранного сценария
  const getAvailableAccounts = () => {
    if (!selectedScenario) return accounts;
    
    const scenario = AVAILABLE_SCENARIOS.find(s => s.id === selectedScenario);
    if (!scenario) return accounts;
    
    return accounts.filter(account => 
      account.platform === scenario.platform && 
      account.status === 'idle'
    );
  };

  const handleAccountSelection = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts(prev => [...prev, accountId]);
    } else {
      setSelectedAccounts(prev => prev.filter(id => id !== accountId));
    }
  };

  const selectAllAccounts = () => {
    const availableAccounts = getAvailableAccounts();
    setSelectedAccounts(availableAccounts.map(acc => acc.id));
  };

  const clearSelection = () => {
    setSelectedAccounts([]);
  };

  const launchScenario = async () => {
    if (!selectedScenario || selectedAccounts.length === 0) return;

    const scenarioInfo = AVAILABLE_SCENARIOS.find(s => s.id === selectedScenario);
    if (!scenarioInfo) return;

    setIsRunning(true);

    try {
      // Создаём сценарий в базе данных
      const scenarioResult = await addScenario({
        name: scenarioInfo.name,
        platform: scenarioInfo.platform,
        status: 'running',
        accounts_count: selectedAccounts.length,
        progress: 0,
        next_run: null,
        config: {
          scenario_type: selectedScenario,
          account_ids: selectedAccounts
        }
      });

      if (scenarioResult.error) {
        throw new Error('Ошибка создания сценария');
      }

      const scenarioId = scenarioResult.data?.id;

      // Логируем запуск сценария
      await addLog({
        scenario_id: scenarioId,
        action: 'Запуск сценария',
        details: `Запущен сценарий "${scenarioInfo.name}" для ${selectedAccounts.length} аккаунтов`,
        status: 'info'
      });

      // Обновляем статус аккаунтов на "working"
      for (const accountId of selectedAccounts) {
        await updateAccount(accountId, { 
          status: 'working',
          last_action: new Date().toISOString()
        });
        
        await addLog({
          account_id: accountId,
          scenario_id: scenarioId,
          action: 'Смена статуса',
          details: `Аккаунт переведён в статус "в работе"`,
          status: 'info'
        });
      }

      // Симуляция выполнения сценария
      await simulateScenarioExecution(scenarioId, selectedAccounts, scenarioInfo.name);

      toast({
        title: "Сценарий запущен",
        description: `Запущен сценарий "${scenarioInfo.name}" для ${selectedAccounts.length} аккаунтов`,
      });

      // Очищаем выбор
      setSelectedAccounts([]);
      setSelectedScenario('');

    } catch (error) {
      console.error('Error launching scenario:', error);
      
      await addLog({
        action: 'Ошибка сценария',
        details: `Ошибка при запуске сценария "${scenarioInfo.name}": ${error}`,
        status: 'error'
      });

      toast({
        title: "Ошибка",
        description: "Не удалось запустить сценарий",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const simulateScenarioExecution = async (scenarioId: string, accountIds: string[], scenarioName: string) => {
    const totalSteps = accountIds.length;
    let completedSteps = 0;

    for (const accountId of accountIds) {
      // Симуляция времени выполнения
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const isSuccess = Math.random() > 0.2; // 80% успеха
      const newStatus = isSuccess ? 'idle' : 'error';
      
      // Обновляем статус аккаунта
      await updateAccount(accountId, { 
        status: newStatus,
        last_action: new Date().toISOString()
      });

      // Логируем результат
      await addLog({
        account_id: accountId,
        scenario_id: scenarioId,
        action: `Выполнение ${scenarioName}`,
        details: isSuccess ? 'Сценарий выполнен успешно' : 'Ошибка при выполнении сценария',
        status: isSuccess ? 'success' : 'error'
      });

      completedSteps++;
      const progress = Math.round((completedSteps / totalSteps) * 100);
      
      // Обновляем прогресс сценария
      await updateScenario(scenarioId, { 
        progress,
        status: progress === 100 ? 'completed' : 'running'
      });
    }

    // Финальное обновление сценария
    await updateScenario(scenarioId, { 
      status: 'completed',
      progress: 100
    });

    await addLog({
      scenario_id: scenarioId,
      action: 'Завершение сценария',
      details: `Сценарий "${scenarioName}" завершён. Обработано ${totalSteps} аккаунтов`,
      status: 'success'
    });
  };

  const availableAccounts = getAvailableAccounts();
  const runningScenarios = scenarios.filter(s => s.status === 'running');

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5" />
            Запуск сценариев
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Выбор сценария */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Выберите сценарий
            </label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Выберите сценарий для запуска" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {AVAILABLE_SCENARIOS.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    <div className="flex items-center gap-2">
                      <span>{scenario.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {scenario.platform}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Выбор аккаунтов */}
          {selectedScenario && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Выберите аккаунты ({availableAccounts.length} доступно)
                </label>
                <div className="flex gap-2">
                  <Button 
                    onClick={selectAllAccounts}
                    variant="outline" 
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                  >
                    Выбрать все
                  </Button>
                  <Button 
                    onClick={clearSelection}
                    variant="outline" 
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:bg-gray-700"
                  >
                    Очистить
                  </Button>
                </div>
              </div>

              {availableAccounts.length > 0 ? (
                <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-2">
                  {availableAccounts.map((account) => (
                    <div key={account.id} className="flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded">
                      <Checkbox
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={(checked) => handleAccountSelection(account.id, !!checked)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{account.username}</div>
                          <div className="text-xs text-gray-400">{account.platform}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {account.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Нет доступных аккаунтов для данной платформы</p>
                </div>
              )}

              {selectedAccounts.length > 0 && (
                <Button 
                  onClick={launchScenario}
                  disabled={isRunning}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Запуск...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Запустить сценарий ({selectedAccounts.length} аккаунтов)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Активные сценарии */}
      {runningScenarios.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Активные сценарии
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningScenarios.map((scenario) => (
              <div key={scenario.id} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-white font-medium">{scenario.name}</h4>
                    <p className="text-sm text-gray-400">
                      {scenario.accounts_count} аккаунтов • {scenario.platform}
                    </p>
                  </div>
                  <Badge 
                    variant={scenario.status === 'running' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {scenario.status === 'running' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : scenario.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {scenario.status}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Прогресс</span>
                    <span className="text-white">{scenario.progress}%</span>
                  </div>
                  <Progress value={scenario.progress} className="w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScenarioLaunchPanel;
