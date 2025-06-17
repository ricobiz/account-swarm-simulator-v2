
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, LogOut, Crown, AlertCircle } from "lucide-react";

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

  console.log('Auth state:', { user: !!user, authLoading, profile: !!profile, profileLoading });

  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Проверка аутентификации...</p>
          {showLoadingTimeout && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 text-sm">Загрузка занимает слишком много времени</p>
              <Button 
                onClick={() => window.location.href = '/auth'} 
                className="mt-2 bg-red-600 hover:bg-red-700"
              >
                Перейти к входу
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Загрузка профиля пользователя...</p>
          <p className="text-gray-400 text-sm mt-2">Создаем профиль если необходимо...</p>
        </div>
      </div>
    );
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
                {profile && (
                  <div className="flex items-center gap-1 bg-green-600 px-2 py-1 rounded-full text-xs text-white">
                    Профиль загружен
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

        {/* Основной контент */}
        {profile ? (
          <>
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
          </>
        ) : (
          <Card className="bg-yellow-900/20 border-yellow-500 mb-6">
            <CardContent className="p-6 text-center">
              <Loader2 className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-white mb-2">Создание профиля...</h3>
              <p className="text-gray-400 mb-4">
                Пожалуйста, подождите, мы создаем ваш профиль пользователя.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
