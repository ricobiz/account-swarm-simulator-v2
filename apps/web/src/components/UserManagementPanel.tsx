
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useProfile } from '@/hooks/useProfile';
import { Users, Crown, Shield, User, Edit, Calendar, Loader2 } from 'lucide-react';

const UserManagementPanel: React.FC = () => {
  const { users, loading, updateUserRole, updateUserLimits } = useAdminUsers();
  const { profile } = useProfile();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newAccountsLimit, setNewAccountsLimit] = useState<number>(5);
  const [newScenariosLimit, setNewScenariosLimit] = useState<number>(2);

  if (profile?.role !== 'admin') {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Доступ запрещен</h3>
            <p className="text-gray-400">Только администраторы могут управлять пользователями</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'premium': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'premium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      default: return 'destructive';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getDaysUntilExpiry = (dateString: string | null) => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleUpdateLimits = async (userId: string) => {
    await updateUserLimits(userId, newAccountsLimit, newScenariosLimit);
    setEditingUser(null);
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Управление пользователями
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Пользователь</TableHead>
                  <TableHead className="text-gray-300">Роль</TableHead>
                  <TableHead className="text-gray-300">Статус</TableHead>
                  <TableHead className="text-gray-300">Лимиты</TableHead>
                  <TableHead className="text-gray-300">Истекает</TableHead>
                  <TableHead className="text-gray-300">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-gray-700">
                    <TableCell>
                      <div>
                        <div className="text-white font-medium">
                          {user.full_name || 'Без имени'}
                        </div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => updateUserRole(user.id, value as any)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="basic">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Basic
                              </div>
                            </SelectItem>
                            <SelectItem value="premium">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Premium
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.subscription_status)}>
                        {user.subscription_status === 'trial' ? 'Пробный' :
                         user.subscription_status === 'active' ? 'Активная' :
                         user.subscription_status === 'expired' ? 'Истекла' : 'Неактивная'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-white">
                          Аккаунты: {user.accounts_limit}
                        </div>
                        <div className="text-gray-400">
                          Сценарии: {user.scenarios_limit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.subscription_status === 'trial' && user.trial_end ? (
                          <div>
                            <div className="text-white">
                              {formatDate(user.trial_end)}
                            </div>
                            <div className="text-orange-400">
                              {getDaysUntilExpiry(user.trial_end)} дн.
                            </div>
                          </div>
                        ) : user.subscription_end ? (
                          <div>
                            <div className="text-white">
                              {formatDate(user.subscription_end)}
                            </div>
                            <div className="text-green-400">
                              {getDaysUntilExpiry(user.subscription_end)} дн.
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(user.id);
                              setNewAccountsLimit(user.accounts_limit);
                              setNewScenariosLimit(user.scenarios_limit);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Редактировать лимиты пользователя
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-300">
                                Лимит аккаунтов
                              </label>
                              <Input
                                type="number"
                                value={newAccountsLimit}
                                onChange={(e) => setNewAccountsLimit(parseInt(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-300">
                                Лимит сценариев
                              </label>
                              <Input
                                type="number"
                                value={newScenariosLimit}
                                onChange={(e) => setNewScenariosLimit(parseInt(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white"
                                min="0"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                              >
                                Отмена
                              </Button>
                              <Button
                                onClick={() => handleUpdateLimits(user.id)}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                Сохранить
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPanel;
