import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { 
  Bot, 
  Users, 
  BarChart3, 
  Settings, 
  Zap, 
  Shield,
  Globe,
  Activity,
  PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RPABotStatusCard from '@/components/rpa/RPABotStatusCard';
import { TestRPAButton } from '@/components/TestRPAButton';

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Bot className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Универсальная RPA платформа
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Автоматизация социальных сетей с использованием искусственного интеллекта
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Globe className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                <h3 className="text-white font-semibold mb-2">Мультиплатформенность</h3>
                <p className="text-gray-400 text-sm">
                  Instagram, YouTube, Twitter, TikTok и другие платформы
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
                <h3 className="text-white font-semibold mb-2">Облачная автоматизация</h3>
                <p className="text-gray-400 text-sm">
                  RPA-боты работают 24/7 в облаке
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-3 text-green-400" />
                <h3 className="text-white font-semibold mb-2">Безопасность</h3>
                <p className="text-gray-400 text-sm">
                  Антидетект технологии и безопасное хранение данных
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Начать работу
              </Button>
            </Link>
            <Link to="/rpa">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                RPA Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Добро пожаловать, {profile?.full_name || user.email}! 👋
          </h1>
          <p className="text-gray-400">
            Панель управления автоматизацией социальных сетей
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RPABotStatusCard />
          </div>
          <div>
            <TestRPAButton />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="text-white">Обзор</TabsTrigger>
            <TabsTrigger value="quick-actions" className="text-white">Быстрые действия</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/accounts">
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-blue-400" />
                      <div>
                        <p className="text-white font-semibold">Аккаунты</p>
                        <p className="text-gray-400 text-sm">Управление профилями</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/scenario-launch">
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="h-8 w-8 text-green-400" />
                      <div>
                        <p className="text-white font-semibold">Запуск</p>
                        <p className="text-gray-400 text-sm">Сценарии автоматизации</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/rpa">
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Bot className="h-8 w-8 text-purple-400" />
                      <div>
                        <p className="text-white font-semibold">RPA</p>
                        <p className="text-gray-400 text-sm">Мониторинг ботов</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-orange-400" />
                    <div>
                      <p className="text-white font-semibold">Аналитика</p>
                      <p className="text-gray-400 text-sm">Статистика работы</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quick-actions" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/accounts">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Добавить аккаунт
                    </Button>
                  </Link>
                  <Link to="/scenario-launch">
                    <Button className="w-full justify-start" variant="outline">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Запустить сценарий
                    </Button>
                  </Link>
                  <Link to="/rpa">
                    <Button className="w-full justify-start" variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Мониторинг RPA
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Система</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Статус подписки:</span>
                    <span className="text-green-400">{profile?.subscription_status || 'trial'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Роль:</span>
                    <span className="text-blue-400">{profile?.role || 'basic'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Статистика использования</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Аналитика будет доступна после начала работы с аккаунтами и сценариями.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
