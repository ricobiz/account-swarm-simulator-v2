
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Zap, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle, User } from 'lucide-react';
import { RPATaskMonitor } from './RPATaskMonitor';
import { useRPAService } from '@/hooks/useRPAService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const RPADashboard: React.FC = () => {
  const [rpaTasks, setRpaTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();

  // Проверяем авторизацию пользователя
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Проверка авторизации:', { user: !!user, error });
        setUser(user);
        setAuthLoading(false);
      } catch (error: any) {
        console.error('Ошибка проверки авторизации:', error);
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Изменение состояния авторизации:', event, !!session?.user);
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRPATasks = async () => {
    if (!user) {
      console.log('Пользователь не авторизован, пропускаем загрузку задач');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Загрузка RPA задач для пользователя:', user.id);
      
      const { data, error } = await supabase.functions.invoke('get-rpa-tasks');

      if (error) {
        console.error('Ошибка Edge Function:', error);
        setError(`Ошибка загрузки: ${error.message}`);
        toast({
          title: "Ошибка загрузки RPA задач",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Получены RPA задачи:', data);
      
      const tasks = Array.isArray(data) ? data : [];
      setRpaTasks(tasks);

      // Подсчитываем статистику
      const newStats = {
        total: tasks.length,
        pending: tasks.filter((t: any) => t.status === 'pending').length,
        processing: tasks.filter((t: any) => t.status === 'processing').length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
        failed: tasks.filter((t: any) => ['failed', 'timeout'].includes(t.status)).length
      };
      setStats(newStats);

    } catch (error: any) {
      console.error('Критическая ошибка при загрузке RPA задач:', error);
      setError(`Критическая ошибка: ${error.message}`);
      toast({
        title: "Критическая ошибка",
        description: "Не удалось загрузить RPA задачи",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRPATasks();
      
      // Обновляем каждые 5 секунд только если пользователь авторизован
      const interval = setInterval(fetchRPATasks, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-purple-400" />
            <p className="text-white">Проверка авторизации...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">RPA Dashboard</h2>
            <p className="text-gray-400">Управление и мониторинг RPA задач</p>
          </div>
        </div>

        <Card className="bg-orange-900/20 border-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-orange-400" />
              <div>
                <h3 className="text-white font-bold mb-2">Требуется авторизация</h3>
                <p className="text-orange-300 mb-4">Для доступа к RPA Dashboard необходимо войти в систему</p>
                <Button onClick={() => window.location.href = '/auth'} className="bg-orange-600 hover:bg-orange-700">
                  Войти в систему
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">RPA Dashboard</h2>
            <p className="text-gray-400">Управление и мониторинг RPA задач</p>
          </div>
        </div>

        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-white font-bold mb-2">Ошибка загрузки RPA задач</h3>
                <p className="text-red-300 mb-4">{error}</p>
                <Button onClick={fetchRPATasks} className="bg-red-600 hover:bg-red-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Попробовать снова
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">RPA Dashboard</h2>
          <p className="text-gray-400">Управление и мониторинг RPA задач</p>
        </div>
        <Button onClick={fetchRPATasks} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Всего задач</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-gray-400">Ожидание</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.processing}</p>
                <p className="text-xs text-gray-400">Выполняется</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-xs text-gray-400">Выполнено</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.failed}</p>
                <p className="text-xs text-gray-400">Ошибки</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки с задачами */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all" className="text-white">Все задачи</TabsTrigger>
          <TabsTrigger value="active" className="text-white">Активные</TabsTrigger>
          <TabsTrigger value="completed" className="text-white">Завершенные</TabsTrigger>
          <TabsTrigger value="failed" className="text-white">Ошибки</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <RPATaskMonitor tasks={rpaTasks} onRefresh={fetchRPATasks} />
        </TabsContent>

        <TabsContent value="active">
          <RPATaskMonitor 
            tasks={rpaTasks.filter((t: any) => ['pending', 'processing'].includes(t.status))} 
            onRefresh={fetchRPATasks} 
          />
        </TabsContent>

        <TabsContent value="completed">
          <RPATaskMonitor 
            tasks={rpaTasks.filter((t: any) => t.status === 'completed')} 
            onRefresh={fetchRPATasks} 
          />
        </TabsContent>

        <TabsContent value="failed">
          <RPATaskMonitor 
            tasks={rpaTasks.filter((t: any) => ['failed', 'timeout'].includes(t.status))} 
            onRefresh={fetchRPATasks} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
