
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Loader2, 
  XCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useProcessMonitorContext, type ProcessStatus } from '@/components/ProcessMonitorProvider';

const ProcessStatusWindow: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { processes, clearCompleted } = useProcessMonitorContext();

  const getStatusIcon = (status: ProcessStatus['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'stuck': return <AlertCircle className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProcessStatus['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'stuck': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: ProcessStatus['status']) => {
    switch (status) {
      case 'pending': return 'Ожидание';
      case 'running': return 'Выполняется';
      case 'completed': return 'Завершено';
      case 'failed': return 'Ошибка';
      case 'stuck': return 'Застрял';
      default: return 'Неизвестно';
    }
  };

  const getTypeText = (type: ProcessStatus['type']) => {
    switch (type) {
      case 'scenario_save': return 'Сохранение сценария';
      case 'scenario_launch': return 'Запуск сценария';
      case 'account_update': return 'Обновление аккаунта';
      case 'template_create': return 'Создание шаблона';
      default: return 'Процесс';
    }
  };

  const formatDuration = (startTime: Date) => {
    const duration = Date.now() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}м ${seconds % 60}с`;
    }
    return `${seconds}с`;
  };

  const activeProcesses = processes.filter(p => p.status === 'running' || p.status === 'stuck' || p.status === 'pending');

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Показать процессы ({activeProcesses.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-gray-800/95 border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Состояние процессов ({processes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {processes.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет активных процессов</p>
            </div>
          ) : (
            <>
              {processes.map((process) => (
                <div key={process.id} className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(process.status)}
                      <span className="text-white text-sm font-medium">{process.name}</span>
                    </div>
                    <Badge className={getStatusColor(process.status)}>
                      {getStatusText(process.status)}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {getTypeText(process.type)} • {formatDuration(process.startTime)}
                  </div>
                  
                  {process.status === 'running' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Прогресс</span>
                        <span className="text-white">{Math.round(process.progress)}%</span>
                      </div>
                      <Progress value={process.progress} className="w-full h-1" />
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-300">{process.details}</div>
                  
                  {process.status === 'stuck' && process.stuckStage && (
                    <div className="bg-orange-900/30 border border-orange-600/50 rounded p-2 text-xs">
                      <div className="text-orange-400 font-medium">Застрял на этапе:</div>
                      <div className="text-orange-300">{process.stuckStage}</div>
                      <div className="text-orange-200 mt-1">
                        Последнее обновление: {formatDuration(process.lastUpdate)} назад
                      </div>
                    </div>
                  )}
                  
                  {process.status === 'failed' && process.error && (
                    <div className="bg-red-900/30 border border-red-600/50 rounded p-2 text-xs">
                      <div className="text-red-400 font-medium">Ошибка:</div>
                      <div className="text-red-300">{process.error}</div>
                    </div>
                  )}
                </div>
              ))}
              
              {processes.some(p => p.status === 'completed' || p.status === 'failed') && (
                <div className="pt-2 border-t border-gray-700">
                  <Button
                    onClick={clearCompleted}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Очистить завершенные
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function getStatusIcon(status: ProcessStatus['status']) {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'stuck': return <AlertCircle className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  }

  function getStatusColor(status: ProcessStatus['status']) {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'stuck': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  }

  function getStatusText(status: ProcessStatus['status']) {
    switch (status) {
      case 'pending': return 'Ожидание';
      case 'running': return 'Выполняется';
      case 'completed': return 'Завершено';
      case 'failed': return 'Ошибка';
      case 'stuck': return 'Застрял';
      default: return 'Неизвестно';
    }
  }

  function getTypeText(type: ProcessStatus['type']) {
    switch (type) {
      case 'scenario_save': return 'Сохранение сценария';
      case 'scenario_launch': return 'Запуск сценария';
      case 'account_update': return 'Обновление аккаунта';
      case 'template_create': return 'Создание шаблона';
      default: return 'Процесс';
    }
  }

  function formatDuration(startTime: Date) {
    const duration = Date.now() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}м ${seconds % 60}с`;
    }
    return `${seconds}с`;
  }
};

export default ProcessStatusWindow;
