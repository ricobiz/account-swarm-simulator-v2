
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  LogOut, 
  Settings, 
  Eye,
  Zap,
  Shield,
  Users,
  Activity,
  Server,
  PlayCircle,
  BarChart3,
  UserCheck
} from 'lucide-react';

const Index: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="h-8 w-8 text-purple-400" />
              SMM Farm Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Добро пожаловать, {user.email}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>

        {/* Main Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Visual RPA Builder */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => navigate('/visual-rpa')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-400" />
                Визуальный RPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Создавайте и выполняйте автоматизированные сценарии с эмуляцией человеческого поведения
              </p>
              <div className="flex items-center text-purple-400 text-sm">
                <Zap className="h-4 w-4 mr-1" />
                Запустить конструктор
              </div>
            </CardContent>
          </Card>

          {/* Accounts Management */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => navigate('/accounts')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-400" />
                Управление аккаунтами
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Добавляйте и управляйте аккаунтами для автоматизации
              </p>
              <div className="flex items-center text-green-400 text-sm">
                <Users className="h-4 w-4 mr-1" />
                Открыть панель
              </div>
            </CardContent>
          </Card>

          {/* Scenario Launch */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => navigate('/scenario-launch')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-400" />
                Запуск сценариев
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Массовый запуск автоматизированных сценариев на множестве аккаунтов
              </p>
              <div className="flex items-center text-blue-400 text-sm">
                <PlayCircle className="h-4 w-4 mr-1" />
                Запустить задачи
              </div>
            </CardContent>
          </Card>

          {/* Monitoring */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => navigate('/monitoring')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-yellow-400" />
                Мониторинг
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Отслеживание активности аккаунтов и выполнения сценариев в реальном времени
              </p>
              <div className="flex items-center text-yellow-400 text-sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                Посмотреть статистику
              </div>
            </CardContent>
          </Card>

          {/* Proxy Management */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => navigate('/proxies')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-400" />
                Управление прокси
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Настройка и управление прокси-серверами для безопасной автоматизации
              </p>
              <div className="flex items-center text-orange-400 text-sm">
                <Server className="h-4 w-4 mr-1" />
                Настроить прокси
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => navigate('/admin')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-red-400" />
                Администрирование
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Управление пользователями, подписками и системными настройками
              </p>
              <div className="flex items-center text-red-400 text-sm">
                <Settings className="h-4 w-4 mr-1" />
                Панель админа
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-gray-400 text-sm">Активных сценариев</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-gray-400 text-sm">Аккаунтов</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-gray-400 text-sm">Выполнено задач</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">100%</div>
                <div className="text-gray-400 text-sm">Успешность</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
