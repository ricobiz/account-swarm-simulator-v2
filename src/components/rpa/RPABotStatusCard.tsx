
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Cloud, Activity, CheckCircle, XCircle, RefreshCw, ExternalLink, Settings, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BotStatus {
  online: boolean;
  version?: string;
  environment?: string;
  capabilities?: string[];
  lastCheck?: string;
  url?: string;
  error?: string;
}

export const RPABotStatusCard: React.FC = () => {
  const [status, setStatus] = useState<BotStatus>({ online: false });
  const [loading, setLoading] = useState(false);
  const [botUrl, setBotUrl] = useState<string>('');
  const { toast } = useToast();

  const checkBotStatus = async () => {
    setLoading(true);
    
    try {
      console.log('Проверяем статус RPA-бота через Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('rpa-bot-status');
      
      if (error) {
        console.error('Ошибка Edge Function:', error);
        throw new Error(error.message);
      }

      console.log('Статус RPA-бота:', data);
      
      if (data.online) {
        setStatus({
          online: true,
          version: data.version,
          environment: data.environment,
          capabilities: data.capabilities,
          lastCheck: new Date().toLocaleString(),
          url: data.url
        });
        setBotUrl(data.url || '');
        
        toast({
          title: "🚀 RPA-бот онлайн",
          description: `Версия: ${data.version}, Среда: ${data.environment}`,
        });
      } else {
        setStatus({
          online: false,
          lastCheck: new Date().toLocaleString(),
          error: data.error || 'Бот недоступен'
        });
        
        toast({
          title: "❌ RPA-бот офлайн",
          description: data.error || "Проверьте настройки RPA_BOT_ENDPOINT",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Критическая ошибка проверки статуса:', error);
      
      setStatus({
        online: false,
        lastCheck: new Date().toLocaleString(),
        error: error.message
      });
      
      toast({
        title: "Ошибка проверки статуса",
        description: "Не удалось подключиться к RPA-боту",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBotStatus();
    
    // Автопроверка каждые 30 секунд
    const interval = setInterval(checkBotStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-400" />
            Облачный RPA-бот
          </div>
          <Badge 
            variant={status.online ? "default" : "destructive"} 
            className={status.online ? "bg-green-600" : "bg-red-600"}
          >
            {status.online ? "Онлайн" : "Офлайн"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.online ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-gray-300">
              {status.online ? "Готов к выполнению задач" : "Недоступен"}
            </span>
          </div>
          
          <Button
            onClick={checkBotStatus}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Проверить
          </Button>
        </div>

        {status.online && (
          <>
            <Separator className="bg-gray-700" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Версия:</p>
                <p className="text-white font-mono">{status.version || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Среда:</p>
                <p className="text-white font-mono">{status.environment || 'N/A'}</p>
              </div>
            </div>

            {status.capabilities && status.capabilities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Поддерживаемые платформы:</p>
                <div className="flex flex-wrap gap-1">
                  {status.capabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-blue-900 text-blue-200">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => window.open('/rpa', '_blank')}
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                RPA Dashboard
              </Button>
              
              {status.url && (
                <Button
                  onClick={() => window.open(status.url, '_blank')}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}

        {!status.online && status.error && (
          <>
            <Separator className="bg-gray-700" />
            <div className="p-3 bg-red-900/20 rounded-lg border border-red-800">
              <p className="text-red-300 text-sm">{status.error}</p>
              <Button
                onClick={() => window.open('https://supabase.com/dashboard/project/izmgzstdgoswlozinmyk/settings/functions', '_blank')}
                size="sm"
                variant="outline"
                className="mt-2 border-red-600 text-red-400 hover:bg-red-900"
              >
                <Settings className="h-4 w-4 mr-2" />
                Настроить RPA_BOT_ENDPOINT
              </Button>
            </div>
          </>
        )}

        {status.lastCheck && (
          <p className="text-xs text-gray-500 text-center">
            Последняя проверка: {status.lastCheck}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
