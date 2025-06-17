
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { AccountsPanel } from "@/components/AccountsPanel";
import { ScenariosPanel } from "@/components/ScenariosPanel";
import { ProxiesPanel } from "@/components/ProxiesPanel";
import { MonitoringPanel } from "@/components/MonitoringPanel";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ScenarioTemplateManager } from "@/components/ScenarioTemplateManager";
import { UserManagementPanel } from "@/components/admin/UserManagementPanel";
import { SubscriptionManagementPanel } from "@/components/admin/SubscriptionManagementPanel";
import { PasswordManagementPanel } from "@/components/admin/PasswordManagementPanel";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Users, 
  Play, 
  Wifi, 
  BarChart3, 
  Activity, 
  FileText, 
  UserCog, 
  CreditCard, 
  KeyRound, 
  Settings,
  Menu,
  X
} from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState("accounts");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const isAdmin = profile?.role === 'admin';

  const tabs = [
    { id: "accounts", label: "Аккаунты", icon: Users, component: AccountsPanel },
    { id: "scenarios", label: "Сценарии", icon: Play, component: ScenariosPanel },
    { id: "proxies", label: "Прокси", icon: Wifi, component: ProxiesPanel },
    { id: "monitoring", label: "Мониторинг", icon: Activity, component: MonitoringPanel },
    { id: "metrics", label: "Метрики", icon: BarChart3, component: MetricsPanel },
    { id: "templates", label: "Шаблоны", icon: FileText, component: ScenarioTemplateManager },
  ];

  const adminTabs = [
    { id: "admin-dashboard", label: "Панель админа", icon: Settings, component: AdminDashboard },
    { id: "users", label: "Пользователи", icon: UserCog, component: UserManagementPanel },
    { id: "subscriptions", label: "Подписки", icon: CreditCard, component: SubscriptionManagementPanel },
    { id: "passwords", label: "Пароли", icon: KeyRound, component: PasswordManagementPanel },
  ];

  const allTabs = isAdmin ? [...tabs, ...adminTabs] : tabs;
  const activeTabData = allTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  const TabButton = ({ tab, isActive, onClick }: { tab: any, isActive: boolean, onClick: () => void }) => {
    const IconComponent = tab.icon;
    return (
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }
          ${isMobile ? 'w-full justify-start' : ''}
        `}
      >
        <IconComponent className="h-4 w-4 flex-shrink-0" />
        <span className={isMobile ? 'block' : 'hidden sm:block'}>{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Мобильная шапка */}
      {isMobile && (
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold">Account Swarm</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-white"
          >
            Выход
          </Button>
        </div>
      )}

      <div className="flex h-screen">
        {/* Боковая панель */}
        <div className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-64'
          }
          bg-gray-800 border-r border-gray-700 flex flex-col
        `}>
          {/* Десктопная шапка */}
          {!isMobile && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Account Swarm</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-white hover:bg-gray-700"
                >
                  Выход
                </Button>
              </div>
              <SubscriptionStatus />
            </div>
          )}

          {/* Мобильный статус подписки */}
          {isMobile && (
            <div className="p-4 border-b border-gray-700">
              <SubscriptionStatus />
            </div>
          )}

          {/* Навигация */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {allTabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Десктопная шапка с активной вкладкой */}
          {!isMobile && (
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <div className="flex items-center gap-2">
                {activeTabData && <activeTabData.icon className="h-5 w-5" />}
                <h2 className="text-lg font-semibold">{activeTabData?.label}</h2>
              </div>
            </div>
          )}

          {/* Контент вкладки */}
          <div className="flex-1 overflow-auto p-4">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>

      {/* Мобильный оверлей */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;
