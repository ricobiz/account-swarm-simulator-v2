
import React from 'react';
import MonitoringPanel from '@/components/monitoring/MonitoringPanel';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity } from 'lucide-react';

const Monitoring = () => {
  const { user, loading } = useAuth();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-400" />
                Мониторинг системы
              </h1>
            </div>
            <p className="text-gray-300">Отслеживание активности аккаунтов и выполнения сценариев</p>
          </div>
        </div>
        <MonitoringPanel />
      </div>
    </div>
  );
};

export default Monitoring;
