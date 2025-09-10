
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRPAService } from '@/hooks/useRPAService';
import { Loader2, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { RPATaskInfo, RPATaskStatus } from '@/types/rpa';

interface RPATaskMonitorProps {
  tasks: RPATaskInfo[];
  onRefresh: () => void;
}

const getStatusIcon = (status: RPATaskStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    case 'timeout':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status: RPATaskStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'processing':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'timeout':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: RPATaskStatus) => {
  switch (status) {
    case 'pending':
      return 'Ожидание';
    case 'processing':
      return 'Выполняется';
    case 'completed':
      return 'Выполнено';
    case 'failed':
      return 'Ошибка';
    case 'timeout':
      return 'Таймаут';
    default:
      return status;
  }
};

export const RPATaskMonitor: React.FC<RPATaskMonitorProps> = ({ tasks, onRefresh }) => {
  const { getRPATaskStatus } = useRPAService();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) {
      return `${duration}с`;
    } else if (duration < 3600) {
      return `${Math.round(duration / 60)}м`;
    } else {
      return `${Math.round(duration / 3600)}ч`;
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            RPA Задачи ({tasks.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Нет RPA задач</p>
            <p className="text-sm">RPA задачи будут отображаться здесь</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className="text-white font-medium">
                      Задача {task.taskId}
                    </span>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                </div>

                <div className="text-sm text-gray-400 space-y-1">
                  <div>URL: {task.task.url}</div>
                  <div>Действий: {task.task.actions.length}</div>
                  <div>
                    Длительность: {formatDuration(task.createdAt, task.updatedAt)}
                  </div>
                  {task.result && (
                    <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                      <div className="text-white mb-1">Результат:</div>
                      <div>{task.result.message}</div>
                      {task.result.error && (
                        <div className="text-red-400 mt-1">Ошибка: {task.result.error}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
