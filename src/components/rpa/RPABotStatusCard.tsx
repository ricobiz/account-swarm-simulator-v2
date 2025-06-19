
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const RPABotStatusCard = () => {
  const { data: status, isLoading, error, refetch } = useQuery({
    queryKey: ['rpa-bot-status'],
    queryFn: async () => {
      try {
        console.log('Проверяем статус RPA-бота через Edge Function...');
        
        const { data, error } = await supabase.functions.invoke('rpa-bot-status', {
          method: 'GET'
        });
        
        if (error) {
          console.error('Ошибка Edge Function:', error);
          throw new Error(`Edge Function error: ${error.message}`);
        }
        
        if (!data) {
          throw new Error('Нет данных от Edge Function');
        }
        
        console.log('Статус RPA-бота:', data);
        return data;
      } catch (err) {
        console.error('Критическая ошибка проверки статуса:', err);
        // Возвращаем базовый статус при ошибке
        return {
          status: 'unknown',
          online: false,
          error: err.message || 'Неизвестная ошибка',
          lastCheck: new Date().toISOString()
        };
      }
    },
    refetchInterval: 30000, // Проверяем каждые 30 секунд
    retry: 3,
    retryDelay: 1000
  });

  const getStatusColor = () => {
    if (isLoading) return 'default';
    if (error || !status?.online) return 'destructive';
    if (status?.status === 'healthy') return 'default';
    return 'secondary';
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (error || !status?.online) return <XCircle className="h-4 w-4" />;
    if (status?.status === 'healthy') return <CheckCircle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Проверка...';
    if (error) return 'Ошибка подключения';
    if (!status?.online) return 'Не в сети';
    if (status?.status === 'healthy') return 'В сети';
    return status?.status || 'Неизвестно';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Статус RPA-бота</CardTitle>
          <CardDescription>
            Облачный RPA-бот на Railway
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-3">
          {getStatusIcon()}
          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
        
        {status && !error && (
          <div className="space-y-2 text-sm text-muted-foreground">
            {status.url && (
              <div>
                <span className="font-medium">URL:</span> {status.url}
              </div>
            )}
            {status.version && (
              <div>
                <span className="font-medium">Версия:</span> {status.version}
              </div>
            )}
            {status.environment && (
              <div>
                <span className="font-medium">Среда:</span> {status.environment}
              </div>
            )}
            {status.system_resources && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center">
                  <div className="font-medium">CPU</div>
                  <div className="text-xs">{status.system_resources.cpu || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">RAM</div>
                  <div className="text-xs">{status.system_resources.memory || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Диск</div>
                  <div className="text-xs">{status.system_resources.disk || 'N/A'}</div>
                </div>
              </div>
            )}
            {status.supported_platforms && (
              <div>
                <span className="font-medium">Платформы:</span>{' '}
                {status.supported_platforms.join(', ')}
              </div>
            )}
            {status.lastCheck && (
              <div className="text-xs">
                Последняя проверка: {new Date(status.lastCheck).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-destructive mt-2">
            <div className="font-medium">Ошибка:</div>
            <div className="text-xs">{error.message || 'Неизвестная ошибка'}</div>
            {status?.error && (
              <div className="text-xs mt-1">Детали: {status.error}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RPABotStatusCard;
