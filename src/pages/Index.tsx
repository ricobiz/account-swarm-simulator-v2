
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
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

  // Main application interface for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
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

        <Tabs defaultValue="launch" className="w-full">
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
    </div>
  );
};

export default Index;
