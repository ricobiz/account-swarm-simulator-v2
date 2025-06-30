
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Activity
} from 'lucide-react';

interface RPABotStatus {
  status: string;
  version: string;
  environment: string;
  capabilities: string[];
}

export const MultiloginStatus: React.FC = () => {
  const [status, setStatus] = useState<RPABotStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRPAStatus = async () => {
    setLoading(true);
    try {
      const rpaEndpoint = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8080' 
        : 'https://rpa-bot-cloud-production.up.railway.app';

      const response = await fetch(`${rpaEndpoint}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        
        toast({
          title: "RPA бот подключен",
          description: `Версия: ${data.version}`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Ошибка получения статуса RPA бота:', error);
      setStatus({
        status: 'error',
        version: 'unknown',
        environment: 'unknown',
        capabilities: []
      });
      
      toast({
        title: "Ошибка подключения",
        description: "Не удалось получить статус RPA бота",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRPAStatus();
  }, []);

  return (
    <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Статус RPA бота
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRPAStatus}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status ? (
          <>
            {/* Статус подключения */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Статус:</span>
              <Badge variant={status.status === 'healthy' ? "default" : "destructive"} className="flex items-center gap-1">
                {status.status === 'healthy' ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Работает
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Ошибка
                  </>
                )}
              </Badge>
            </div>

            {status.status === 'healthy' ? (
              <>
                {/* Версия */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Версия:</span>
                  <span className="text-white font-mono text-sm">{status.version}</span>
                </div>

                {/* Среда */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Среда:</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {status.environment}
                  </Badge>
                </div>

                {/* Возможности */}
                <div className="space-y-2">
                  <span className="text-gray-300">Возможности:</span>
                  <div className="flex flex-wrap gap-1">
                    {status.capabilities.map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Информация */}
                <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                  <p className="text-blue-200 text-sm">
                    ✅ RPA бот работает! Система использует антидетект браузер для безопасной автоматизации.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Ошибка подключения */}
                <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                  <p className="text-red-200 text-sm">
                    ❌ RPA бот недоступен или не отвечает
                  </p>
                </div>

                {/* Инструкции по настройке */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>Для восстановления работы:</strong>
                  </p>
                  <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
                    <li>Проверьте, что RPA-бот развернут на Railway</li>
                    <li>Убедитесь, что все переменные окружения настроены</li>
                    <li>Проверьте логи развертывания</li>
                  </ul>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
              <p className="text-gray-300">Загрузка статуса...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
