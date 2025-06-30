
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  User, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Users,
  Globe,
  Activity
} from 'lucide-react';

interface MultiloginStatusData {
  connected: boolean;
  workspace_id?: string;
  email?: string;
  plan?: string;
  profiles_count?: number;
  active_profiles?: number;
  error?: string;
}

export const MultiloginStatus: React.FC = () => {
  const [status, setStatus] = useState<MultiloginStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMultiloginStatus = async () => {
    setLoading(true);
    try {
      const rpaEndpoint = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8080' 
        : 'https://account-swarm-simulator-production.up.railway.app';

      const response = await fetch(`${rpaEndpoint}/multilogin/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        
        if (data.connected) {
          toast({
            title: "Multilogin подключен",
            description: `Workspace: ${data.workspace_id}`,
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Ошибка получения статуса Multilogin:', error);
      setStatus({
        connected: false,
        error: error.message
      });
      
      toast({
        title: "Ошибка подключения",
        description: "Не удалось получить статус Multilogin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMultiloginStatus();
  }, []);

  return (
    <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Статус Multilogin
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMultiloginStatus}
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
              <span className="text-gray-300">Подключение:</span>
              <Badge variant={status.connected ? "default" : "destructive"} className="flex items-center gap-1">
                {status.connected ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Подключен
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Отключен
                  </>
                )}
              </Badge>
            </div>

            {status.connected ? (
              <>
                {/* Информация о пользователе */}
                {status.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Email:
                    </span>
                    <span className="text-white font-mono text-sm">{status.email}</span>
                  </div>
                )}

                {/* План подписки */}
                {status.plan && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      План:
                    </span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {status.plan}
                    </Badge>
                  </div>
                )}

                {/* Workspace ID */}
                {status.workspace_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Workspace:</span>
                    <span className="text-white font-mono text-xs">
                      {status.workspace_id.substring(0, 8)}...
                    </span>
                  </div>
                )}

                {/* Количество профилей */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-300 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Профили</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {status.profiles_count || 0}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-300 mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Активные</span>
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {status.active_profiles || 0}
                    </div>
                  </div>
                </div>

                {/* Подсказки */}
                <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                  <p className="text-blue-200 text-sm">
                    ✅ Multilogin интегрирован! RPA-бот будет использовать антидетект браузеры для максимальной безопасности.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Ошибка подключения */}
                <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                  <p className="text-red-200 text-sm">
                    ❌ {status.error || 'Multilogin не подключен'}
                  </p>
                </div>

                {/* Инструкции по настройке */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>Для подключения Multilogin:</strong>
                  </p>
                  <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
                    <li>Убедитесь, что токен добавлен в секреты Supabase</li>
                    <li>Проверьте, что RPA-бот запущен и доступен</li>
                    <li>Убедитесь, что Multilogin клиент работает</li>
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
