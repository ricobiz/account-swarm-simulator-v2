import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Подтвердите email перед входом. Проверьте почту.');
          setShowResendOption(true);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Добро пожаловать!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.warning('Пользователь уже зарегистрирован. Попробуйте войти или повторно отправить письмо подтверждения.');
          setShowResendOption(true);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Регистрация успешна! Проверьте email для подтверждения.');
        setShowResendOption(true);
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Введите email адрес');
      return;
    }

    setResendLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast.error('Ошибка при отправке письма: ' + error.message);
      } else {
        toast.success('Письмо подтверждения отправлено повторно!');
      }
    } catch (error) {
      toast.error('Произошла ошибка при отправке письма');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">
            SMM Farm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="signin" className="text-white">Вход</TabsTrigger>
              <TabsTrigger value="signup" className="text-white">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Загрузка...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Пароль</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {showResendOption && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
              <p className="text-blue-300 text-sm mb-3">
                Не получили письмо? Отправим повторно:
              </p>
              <Button 
                onClick={handleResendConfirmation}
                disabled={resendLoading || !email}
                variant="outline"
                className="w-full border-blue-500 text-blue-300 hover:bg-blue-900/30"
              >
                {resendLoading ? 'Отправка...' : 'Отправить письмо повторно'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
