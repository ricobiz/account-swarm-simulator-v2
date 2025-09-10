
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Key, Shield, Mail } from 'lucide-react';

const PasswordManagementPanel: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Пароль успешно изменен"
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить пароль",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Ошибка",
        description: "Введите email пользователя",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: `Письмо для сброса пароля отправлено на ${resetEmail}`
      });

      setResetEmail('');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить письмо",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Смена собственного пароля */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            Смена пароля
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <Label className="text-gray-300">Новый пароль</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Подтвердите пароль</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите новый пароль"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Изменение...' : 'Изменить пароль'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Сброс пароля для пользователей */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Сброс пароля пользователя
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendPasswordReset} className="space-y-4">
            <div>
              <Label className="text-gray-300">Email пользователя</Label>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Отправка...' : 'Отправить ссылку для сброса'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Текущие данные пользователя */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Текущий пользователь
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-300">
            <div>
              <span className="font-medium">Email:</span> {user?.email}
            </div>
            <div>
              <span className="font-medium">ID:</span> {user?.id}
            </div>
            <div>
              <span className="font-medium">Создан:</span>{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleString('ru-RU') : 'Неизвестно'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManagementPanel;
