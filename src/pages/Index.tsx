
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Play, Settings, Monitor, Users, Shield, Database } from 'lucide-react';
import AccountsPanel from '@/components/AccountsPanel';
import ScenariosPanel from '@/components/ScenariosPanel';
import ScenarioLaunchPanel from '@/components/ScenarioLaunchPanel';
import MonitoringPanel from '@/components/MonitoringPanel';
import ProxiesPanel from '@/components/ProxiesPanel';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl mb-2">Добро пожаловать!</CardTitle>
            <p className="text-gray-300">Войдите в систему для доступа к панели управления</p>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Панель управления</h1>
            <p className="text-gray-300">Управление аккаунтами, сценариями и автоматизацией</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/launch')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Запустить сценарий
            </Button>
            <Button 
              onClick={() => navigate('/rpa')}
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-900"
            >
              <Monitor className="mr-2 h-4 w-4" />
              RPA Панель
            </Button>
          </div>
        </div>

        <Tabs defaultValue="launch" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 mb-6">
            <TabsTrigger value="launch" className="text-white flex items-center gap-2">
              <Play className="h-4 w-4" />
              Запуск
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="text-white flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Сценарии
            </TabsTrigger>
            <TabsTrigger value="accounts" className="text-white flex items-center gap-2">
              <Users className="h-4 w-4" />
              Аккаунты
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-white flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Мониторинг
            </TabsTrigger>
            <TabsTrigger value="proxies" className="text-white flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Прокси
            </TabsTrigger>
          </TabsList>

          <TabsContent value="launch">
            <ScenarioLaunchPanel />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenariosPanel />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountsPanel />
          </TabsContent>

          <TabsContent value="monitoring">
            <MonitoringPanel />
          </TabsContent>

          <TabsContent value="proxies">
            <ProxiesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
