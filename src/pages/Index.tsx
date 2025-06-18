
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Users, 
  Settings, 
  BarChart3, 
  Monitor,
  Workflow,
  Zap
} from 'lucide-react';
import { QuickAccountCheck } from '@/components/account-check/QuickAccountCheck';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Добро пожаловать в Automation Platform</h1>
          <p className="text-gray-300 mb-8">Автоматизация социальных сетей нового уровня</p>
          <Link to="/auth">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Войти в систему
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Панель управления</h1>
          <p className="text-gray-300">Управление автоматизацией социальных сетей</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-400" />
                    Запуск сценариев
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">
                    Запустить автоматизированные сценарии для ваших аккаунтов
                  </p>
                  <Link to="/scenario-launch">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Запустить сценарии
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-blue-400" />
                    Создание шаблонов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">
                    Создать новые шаблоны сценариев для автоматизации
                  </p>
                  <Link to="/scenario-templates">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Создать шаблон
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    Аккаунты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">
                    Управление аккаунтами социальных сетей
                  </p>
                  <Link to="/accounts">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Управление аккаунтами
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-400" />
                    RPA Автоматизация
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">
                    Роботизированная автоматизация процессов
                  </p>
                  <Link to="/rpa">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      RPA Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Monitoring Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-cyan-400" />
                    Мониторинг
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">
                    Отслеживание активности и логов системы
                  </p>
                  <Link to="/monitoring">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                      Открыть мониторинг
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    Метрики
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">
                    Анализ производительности и статистика
                  </p>
                  <Link to="/metrics">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Посмотреть метрики
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar with Quick Check */}
          <div className="space-y-6">
            <QuickAccountCheck />
            
            {/* Settings Card */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  Быстрые настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/proxies">
                  <Button variant="outline" className="w-full text-sm">
                    Управление прокси
                  </Button>
                </Link>
                <Link to="/scenarios">
                  <Button variant="outline" className="w-full text-sm">
                    Активные сценарии
                  </Button>
                </Link>
                <Link to="/user-management">
                  <Button variant="outline" className="w-full text-sm">
                    Профиль пользователя
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
