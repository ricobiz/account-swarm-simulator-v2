
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import main app components
import AccountsPanel from '@/components/AccountsPanel';
import ProxiesPanel from '@/components/ProxiesPanel';
import ScenariosPanel from '@/components/ScenariosPanel';
import ScenarioLaunchPanel from '@/components/ScenarioLaunchPanel';
import MonitoringPanel from '@/components/MonitoringPanel';
import SubscriptionStatus from '@/components/SubscriptionStatus';

const Index = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('launch');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('Index render - User:', !!user, 'Loading:', loading);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать!"
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Регистрация успешна",
        description: "Проверьте email для подтверждения аккаунта"
      });
    }
    
    setIsLoading(false);
  };

  if (loading) {
    console.log('Showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('User not authenticated, showing login');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl mb-2">
              Добро пожаловать
            </CardTitle>
            <p className="text-gray-300">
              Войдите в систему или создайте новый аккаунт
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="signin" className="text-white">
                  Вход
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white">
                  Регистрация
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">
                      Пароль
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Войти
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">
                      Пароль
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      minLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Создать аккаунт
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('User authenticated, showing main app');

  // Main application interface for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800/50 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-bold text-white truncate mx-4">
            Панель управления
          </h1>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs px-2"
          >
            Выйти
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Навигация</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {[
                { id: 'launch', label: 'Запуск' },
                { id: 'scenarios', label: 'Сценарии' },
                { id: 'accounts', label: 'Аккаунты' },
                { id: 'proxies', label: 'Прокси' },
                { id: 'monitoring', label: 'Мониторинг' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    activeTab === tab.id 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'text-white hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Панель управления автоматизацией
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Добро пожаловать, {user.email}
            </span>
            <Button
              onClick={signOut}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Выйти
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <SubscriptionStatus />
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 mb-6">
              <TabsTrigger value="launch" className="text-white">
                Запуск
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="text-white">
                Сценарии
              </TabsTrigger>
              <TabsTrigger value="accounts" className="text-white">
                Аккаунты
              </TabsTrigger>
              <TabsTrigger value="proxies" className="text-white">
                Прокси
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="text-white">
                Мониторинг
              </TabsTrigger>
            </TabsList>

            <TabsContent value="launch" className="space-y-6">
              <ScenarioLaunchPanel />
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <ScenariosPanel />
            </TabsContent>

            <TabsContent value="accounts" className="space-y-6">
              <AccountsPanel />
            </TabsContent>

            <TabsContent value="proxies" className="space-y-6">
              <ProxiesPanel />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <MonitoringPanel />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden">
          <div className="space-y-6">
            {activeTab === 'launch' && <ScenarioLaunchPanel />}
            {activeTab === 'scenarios' && <ScenariosPanel />}
            {activeTab === 'accounts' && <AccountsPanel />}
            {activeTab === 'proxies' && <ProxiesPanel />}
            {activeTab === 'monitoring' && <MonitoringPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
