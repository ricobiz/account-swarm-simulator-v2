
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Globe, 
  Play, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  FileText
} from 'lucide-react';
import ImportAccountsPanel from '@/components/ImportAccountsPanel';
import ProxyManagementPanel from '@/components/ProxyManagementPanel';
import ScenarioLaunchPanel from '@/components/ScenarioLaunchPanel';
import MonitoringPanel from '@/components/MonitoringPanel';
import ScenarioTemplateManager from '@/components/ScenarioTemplateManager';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useProxies } from '@/hooks/useProxies';
import { useScenarios } from '@/hooks/useScenarios';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const { user, loading, signOut } = useAuth();
  const { accounts } = useAccounts();
  const { proxies } = useProxies();
  const { scenarios } = useScenarios();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeAccounts = accounts.filter(a => a.status === 'working' || a.status === 'idle').length;
  const onlineProxies = proxies.filter(p => p.status === 'online').length;
  const runningScenarios = scenarios.filter(s => s.status === 'running').length;
  const templateCount = scenarios.filter(s => s.status === 'template').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">SMM Farm</div>
              <Badge variant="outline" className="border-green-500 text-green-400">
                v2.0
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Панель управления SMM автоматизацией
          </h1>
          <p className="text-gray-400 text-lg">
            Управляйте аккаунтами, прокси и сценариями из единого интерфейса
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-200 text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Аккаунты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeAccounts}</div>
              <div className="text-sm text-blue-200">Активных аккаунтов</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-200 text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Прокси
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{onlineProxies}</div>
              <div className="text-sm text-green-200">Онлайн прокси</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-200 text-lg flex items-center gap-2">
                <Play className="h-5 w-5" />
                Сценарии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{runningScenarios}</div>
              <div className="text-sm text-purple-200">Запущенных</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-200 text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Шаблоны
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{templateCount}</div>
              <div className="text-sm text-orange-200">Шаблонов сценариев</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="accounts" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              <Users className="mr-2 h-4 w-4" />
              Аккаунты
            </TabsTrigger>
            <TabsTrigger 
              value="proxies" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300"
            >
              <Globe className="mr-2 h-4 w-4" />
              Прокси
            </TabsTrigger>
            <TabsTrigger 
              value="scenarios" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Play className="mr-2 h-4 w-4" />
              Сценарии
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-300"
            >
              <FileText className="mr-2 h-4 w-4" />
              Шаблоны
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-300"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Мониторинг
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="accounts" className="space-y-6">
              <ImportAccountsPanel />
            </TabsContent>

            <TabsContent value="proxies" className="space-y-6">
              <ProxyManagementPanel />
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <ScenarioLaunchPanel />
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <ScenarioTemplateManager />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <MonitoringPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
