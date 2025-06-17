
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, LogOut, Crown } from "lucide-react";

// Импортируем все панели
import AccountsPanel from "@/components/AccountsPanel";
import ProxiesPanel from "@/components/ProxiesPanel";
import ScenariosPanel from "@/components/ScenariosPanel";
import ScenarioLaunchPanel from "@/components/ScenarioLaunchPanel";
import MonitoringPanel from "@/components/MonitoringPanel";
import MetricsPanel from "@/components/MetricsPanel";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("accounts");

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  // Если пользователь админ, показываем админ-панель по умолчанию
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto p-4">
        {/* Заголовок */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl text-white">SMM Farm</CardTitle>
                {isAdmin && (
                  <div className="flex items-center gap-1 bg-yellow-600 px-2 py-1 rounded-full text-xs text-white">
                    <Crown className="h-3 w-3" />
                    Администратор
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-300">{user.email}</span>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Статус подписки */}
        <div className="mb-6">
          <SubscriptionStatus />
        </div>

        {/* Основной контент */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gray-800/50 mb-6">
            {isAdmin && (
              <TabsTrigger value="admin" className="text-white">
                <Crown className="h-4 w-4 mr-2" />
                Админ
              </TabsTrigger>
            )}
            <TabsTrigger value="accounts" className="text-white">Аккаунты</TabsTrigger>
            <TabsTrigger value="proxies" className="text-white">Прокси</TabsTrigger>
            <TabsTrigger value="scenarios" className="text-white">Сценарии</TabsTrigger>
            <TabsTrigger value="launch" className="text-white">Запуск</TabsTrigger>
            <TabsTrigger value="monitoring" className="text-white">Мониторинг</TabsTrigger>
            <TabsTrigger value="metrics" className="text-white">Метрики</TabsTrigger>
          </TabsList>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          )}

          <TabsContent value="accounts">
            <AccountsPanel />
          </TabsContent>

          <TabsContent value="proxies">
            <ProxiesPanel />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenariosPanel />
          </TabsContent>

          <TabsContent value="launch">
            <ScenarioLaunchPanel />
          </TabsContent>

          <TabsContent value="monitoring">
            <MonitoringPanel />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
