
import React from 'react';
import ProxiesPanel from '@/components/ProxiesPanel';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

const Proxies = () => {
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
                <Shield className="h-8 w-8 text-purple-400" />
                Управление прокси
              </h1>
            </div>
            <p className="text-gray-300">Настройка и управление прокси-серверами для безопасной автоматизации</p>
          </div>
        </div>
        <ProxiesPanel />
      </div>
    </div>
  );
};

export default Proxies;
