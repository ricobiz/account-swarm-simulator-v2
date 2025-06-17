
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfile } from '@/hooks/useProfile';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';
import { 
  Crown, 
  Shield, 
  User, 
  Calendar, 
  Users, 
  Play, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const SubscriptionStatus: React.FC = () => {
  const { profile, loading, getDaysUntilTrialEnd, isSubscriptionActive, isTrialExpired } = useProfile();
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();

  if (loading || !profile) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="animate-pulse p-6">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = () => {
    switch (profile.role) {
      case 'admin': return <Crown className="h-5 w-5 text-yellow-400" />;
      case 'premium': return <Shield className="h-5 w-5 text-purple-400" />;
      default: return <User className="h-5 w-5 text-blue-400" />;
    }
  };

  const getRoleTitle = () => {
    switch (profile.role) {
      case 'admin': return 'Администратор';
      case 'premium': return 'Премиум';
      default: return 'Базовый';
    }
  };

  const getStatusIcon = () => {
    if (profile.subscription_status === 'active') {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else if (profile.subscription_status === 'trial' && !isTrialExpired()) {
      return <Clock className="h-5 w-5 text-orange-400" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusText = () => {
    if (profile.subscription_status === 'active') {
      return 'Активная подписка';
    } else if (profile.subscription_status === 'trial' && !isTrialExpired()) {
      const days = getDaysUntilTrialEnd();
      return `Пробный период (${days} дн.)`;
    } else if (isTrialExpired()) {
      return 'Пробный период истек';
    } else {
      return 'Подписка неактивна';
    }
  };

  const accountsUsed = accounts.length;
  const scenariosUsed = scenarios.filter(s => s.status !== 'template').length;
  const accountsProgress = (accountsUsed / profile.accounts_limit) * 100;
  const scenariosProgress = (scenariosUsed / profile.scenarios_limit) * 100;

  const isLimitReached = (used: number, limit: number) => used >= limit;

  return (
    <div className="space-y-4">
      {/* Статус подписки */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {getRoleIcon()}
            План: {getRoleTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-white font-medium">{getStatusText()}</span>
          </div>
          
          {profile.subscription_status === 'trial' && !isTrialExpired() && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Пробный период</span>
              </div>
              <p className="text-orange-300 text-sm">
                У вас осталось {getDaysUntilTrialEnd()} дней пробного периода. 
                Обновите подписку, чтобы продолжить пользоваться всеми функциями.
              </p>
              <Button className="mt-3 bg-orange-600 hover:bg-orange-700 text-white">
                Обновить подписку
              </Button>
            </div>
          )}

          {(isTrialExpired() || profile.subscription_status === 'expired') && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Требуется подписка</span>
              </div>
              <p className="text-red-300 text-sm">
                Ваш пробный период истек. Оформите подписку для продолжения работы.
              </p>
              <Button className="mt-3 bg-red-600 hover:bg-red-700 text-white">
                Оформить подписку
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Использование лимитов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Аккаунты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">
                  {accountsUsed} из {profile.accounts_limit}
                </span>
                <Badge variant={isLimitReached(accountsUsed, profile.accounts_limit) ? "destructive" : "outline"}>
                  {Math.round(accountsProgress)}%
                </Badge>
              </div>
              <Progress 
                value={accountsProgress} 
                className="h-2"
              />
              {isLimitReached(accountsUsed, profile.accounts_limit) && (
                <p className="text-red-400 text-xs">
                  Достигнут лимит аккаунтов
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Play className="h-4 w-4" />
              Сценарии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">
                  {scenariosUsed} из {profile.scenarios_limit}
                </span>
                <Badge variant={isLimitReached(scenariosUsed, profile.scenarios_limit) ? "destructive" : "outline"}>
                  {Math.round(scenariosProgress)}%
                </Badge>
              </div>
              <Progress 
                value={scenariosProgress} 
                className="h-2"
              />
              {isLimitReached(scenariosUsed, profile.scenarios_limit) && (
                <p className="text-red-400 text-xs">
                  Достигнут лимит сценариев
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
