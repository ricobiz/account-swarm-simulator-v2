
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Zap, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { RPATaskMonitor } from './RPATaskMonitor';
import { useRPAService } from '@/hooks/useRPAService';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchRPATasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-rpa-tasks');

      if (error) {
        console.error('Ошибка загрузки RPA задач:', error);
        return;
      }

      const tasks = data || [];
      setRpaTasks(tasks);

      // Подсчитываем статистику
      const newStats = {
        total: tasks.length,
        pending: tasks.filter((t: any) => t.status === 'pending').length,
        processing: tasks.filter((t: any) => t.status === 'processing').length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
        failed: tasks.filter((t: any) => t.status === 'failed').length
      };
      setStats(newStats);

    } catch (error) {
      console.error('Ошибка при загрузке RPA задач:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRPATasks();
    
    // Обновляем каждые 10 секунд
    const interval = setInterval(fetchRPATasks, 10000);
    
    return () => clearInterval(interval);
  }, []);

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
            tasks={rpaTasks.filter((t: any) => t.status === 'pending' || t.status === 'processing')} 
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
            tasks={rpaTasks.filter((t: any) => t.status === 'failed' || t.status === 'timeout')} 
            onRefresh={fetchRPATasks} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
