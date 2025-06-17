
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AccountsPanel from "@/components/AccountsPanel";
import ScenariosPanel from "@/components/ScenariosPanel";
import ProxiesPanel from "@/components/ProxiesPanel";
import MonitoringPanel from "@/components/MonitoringPanel";
import MetricsPanel from "@/components/MetricsPanel";
import ScenarioTemplateManager from "@/components/ScenarioTemplateManager";
import UserManagementPanel from "@/components/UserManagementPanel";
import SubscriptionManagementPanel from "@/components/admin/SubscriptionManagementPanel";
import PasswordManagementPanel from "@/components/admin/PasswordManagementPanel";
import AdminDashboard from "@/components/admin/AdminDashboard";
import SubscriptionStatus from "@/components/SubscriptionStatus";
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
  const { profile } = useProfile();
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
          flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }
        `}
      >
        <IconComponent className="h-5 w-5 flex-shrink-0" />
        <span>{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile header */}
      {isMobile && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {activeTabData && <activeTabData.icon className="h-5 w-5 text-blue-400" />}
            <h1 className="text-lg font-semibold">{activeTabData?.label || "Account Swarm"}</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Desktop header */}
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

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {allTabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Menu */}
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Compact Menu */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 rounded-t-xl max-h-[80vh] flex flex-col">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Навигация</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Subscription Status */}
              <div className="p-3 border-b border-gray-700">
                <SubscriptionStatus />
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-2">
                  {allTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          flex flex-col items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                          }
                        `}
                      >
                        <IconComponent className="h-6 w-6" />
                        <span className="text-xs text-center">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop header with active tab */}
          {!isMobile && (
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <div className="flex items-center gap-2">
                {activeTabData && <activeTabData.icon className="h-5 w-5" />}
                <h2 className="text-lg font-semibold">{activeTabData?.label}</h2>
              </div>
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-auto p-4">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
