
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import UserManagementPanel from '../UserManagementPanel';
import SubscriptionManagementPanel from './SubscriptionManagementPanel';
import PasswordManagementPanel from './PasswordManagementPanel';
import { Shield, Users, CreditCard, Key } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { profile } = useProfile();

  if (profile?.role !== 'admin') {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Доступ запрещен</h3>
            <p className="text-gray-400">Только администраторы могут управлять системой</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Панель администратора</h1>
        <p className="text-gray-400">Управление пользователями, подписками и системой</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="users" className="text-white">
            <Users className="h-4 w-4 mr-2" />
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Подписки
          </TabsTrigger>
          <TabsTrigger value="passwords" className="text-white">
            <Key className="h-4 w-4 mr-2" />
            Пароли
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-white">
            <Shield className="h-4 w-4 mr-2" />
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionManagementPanel />
        </TabsContent>

        <TabsContent value="passwords" className="space-y-4">
          <PasswordManagementPanel />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Системные настройки</h3>
                <p className="text-gray-400">
                  Здесь можно будет настроить системные параметры, 
                  интеграции и общие настройки приложения
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
