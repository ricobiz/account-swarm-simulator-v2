
import React, { useState, useEffect } from 'react';
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
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';
import { useLogs } from '@/hooks/useLogs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAutomationService } from '@/hooks/useAutomationService';
import { supabase } from '@/integrations/supabase/client';

interface ScenarioTemplate {
  id: string;
  name: string;
  platform: string;
  config?: {
    steps: any[];
    settings: any;
  };
}

const ScenarioLaunchPanel = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  const { accounts, updateAccount } = useAccounts();
  const { scenarios, refetch: refetchScenarios } = useScenarios();
  const { addLog } = useLogs();
  const { user } = useAuth();
  const { toast } = useToast();
  const { launchScenario, stopScenario, isLaunching } = useAutomationService();

  // Загружаем шаблоны сценариев
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('status', 'template')
          .not('config', 'is', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Ошибка загрузки шаблонов:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить шаблоны сценариев",
          variant: "destructive"
        });
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  // Фильтруем аккаунты по платформе выбранного шаблона
  const getAvailableAccounts = () => {
    if (!selectedTemplate) return accounts;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return accounts;
    
    return accounts.filter(account => 
      account.platform === template.platform && 
      (account.status === 'idle' || account.status === 'working')
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

  const handleLaunchScenario = async () => {
    if (!selectedTemplate || selectedAccounts.length === 0 || !user) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      const result = await launchScenario({
        templateId: selectedTemplate,
        accountIds: selectedAccounts,
        userId: user.id
      });

      if (result.success) {
        toast({
          title: "Сценарии запущены",
          description: result.message,
        });

        // Обновляем данные
        refetchScenarios();
        
        // Очищаем выбор
        setSelectedAccounts([]);
        setSelectedTemplate('');
      } else {
        toast({
          title: "Ошибка запуска",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Ошибка при запуске сценариев:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при запуске сценариев",
        variant: "destructive"
      });
    }
  };

  const handleStopScenario = async (scenarioId: string) => {
    const success = await stopScenario(scenarioId);
    if (success) {
      refetchScenarios();
    }
  };

  const availableAccounts = getAvailableAccounts();
  const runningScenarios = scenarios.filter(s => s.status === 'running' || s.status === 'waiting');

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
          {/* Выбор шаблона */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Выберите шаблон сценария
            </label>
            {loadingTemplates ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Загрузка шаблонов...
              </div>
            ) : (
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите шаблон для запуска" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.platform}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Показываем информацию о выбранном шаблоне */}
          {selectedTemplate && (
            <div className="bg-gray-900/50 rounded-lg p-4">
              {(() => {
                const template = templates.find(t => t.id === selectedTemplate);
                if (!template) return null;
                
                const stepsCount = template.config?.steps?.length || 0;
                return (
                  <div className="text-sm text-gray-300">
                    <div className="font-medium text-white mb-1">{template.name}</div>
                    <div>Платформа: {template.platform}</div>
                    <div>Шагов в сценарии: {stepsCount}</div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Выбор аккаунтов */}
          {selectedTemplate && (
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
                    disabled={availableAccounts.length === 0}
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
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            account.status === 'idle' ? 'border-green-500 text-green-400' :
                            account.status === 'working' ? 'border-yellow-500 text-yellow-400' :
                            'border-gray-500 text-gray-400'
                          }`}
                        >
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
                  <p className="text-sm">Импортируйте аккаунты или проверьте их статус</p>
                </div>
              )}

              {selectedAccounts.length > 0 && (
                <Button 
                  onClick={handleLaunchScenario}
                  disabled={isLaunching}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLaunching ? (
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
              Активные сценарии ({runningScenarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningScenarios.map((scenario) => (
              <div key={scenario.id} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-white font-medium">{scenario.name}</h4>
                    <p className="text-sm text-gray-400">
                      {scenario.accounts_count} аккаунт • {scenario.platform}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={scenario.status === 'running' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {scenario.status === 'running' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : scenario.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : scenario.status === 'waiting' ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {scenario.status === 'waiting' ? 'В очереди' : scenario.status}
                    </Badge>
                    {(scenario.status === 'running' || scenario.status === 'waiting') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-900"
                        onClick={() => handleStopScenario(scenario.id)}
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Прогресс</span>
                    <span className="text-white">{scenario.progress || 0}%</span>
                  </div>
                  <Progress value={scenario.progress || 0} className="w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && !loadingTemplates && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-8">
            <div className="text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-2">Нет шаблонов сценариев</h3>
              <p>Создайте шаблон сценария на вкладке "Шаблоны", чтобы начать запуск автоматизации</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScenarioLaunchPanel;
