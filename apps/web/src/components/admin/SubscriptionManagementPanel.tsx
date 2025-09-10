
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Settings, CreditCard } from 'lucide-react';

const SubscriptionManagementPanel: React.FC = () => {
  const { users, refetch } = useAdminUsers();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');
  const [subscriptionTier, setSubscriptionTier] = useState<string>('');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string>('');
  const [trialEnd, setTrialEnd] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const updateSubscription = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const updates: any = {
        subscription_status: subscriptionStatus,
        updated_at: new Date().toISOString()
      };

      if (subscriptionTier) updates.subscription_tier = subscriptionTier;
      if (subscriptionEnd) updates.subscription_end = new Date(subscriptionEnd).toISOString();
      if (trialEnd) updates.trial_end = new Date(trialEnd).toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Подписка пользователя обновлена"
      });

      refetch();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить подписку",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const extendTrial = async (userId: string, days: number) => {
    try {
      const newTrialEnd = new Date();
      newTrialEnd.setDate(newTrialEnd.getDate() + days);

      const { error } = await supabase
        .from('profiles')
        .update({
          trial_end: newTrialEnd.toISOString(),
          subscription_status: 'trial',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: `Пробный период продлен на ${days} дней`
      });

      refetch();
    } catch (error) {
      console.error('Error extending trial:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось продлить пробный период",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-orange-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Управление подписками
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">
                    {user.full_name || 'Без имени'}
                  </div>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(user.subscription_status)}>
                      {user.subscription_status === 'trial' ? 'Пробный' :
                       user.subscription_status === 'active' ? 'Активная' :
                       user.subscription_status === 'expired' ? 'Истекла' : 'Неактивная'}
                    </Badge>
                    {user.subscription_tier && (
                      <Badge variant="outline">{user.subscription_tier}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => extendTrial(user.id, 7)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    +7 дней
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setSubscriptionStatus(user.subscription_status);
                          setSubscriptionTier(user.subscription_tier || '');
                          setSubscriptionEnd(formatDate(user.subscription_end));
                          setTrialEnd(formatDate(user.trial_end));
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Настроить
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Управление подпиской: {user.full_name || user.email}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Статус подписки</Label>
                          <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="trial">Пробный период</SelectItem>
                              <SelectItem value="active">Активная</SelectItem>
                              <SelectItem value="expired">Истекла</SelectItem>
                              <SelectItem value="inactive">Неактивная</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-gray-300">Тарифный план</Label>
                          <Input
                            value={subscriptionTier}
                            onChange={(e) => setSubscriptionTier(e.target.value)}
                            placeholder="basic, premium, enterprise"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-gray-300">Окончание подписки</Label>
                          <Input
                            type="date"
                            value={subscriptionEnd}
                            onChange={(e) => setSubscriptionEnd(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-gray-300">Окончание пробного периода</Label>
                          <Input
                            type="date"
                            value={trialEnd}
                            onChange={(e) => setTrialEnd(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedUser(null)}
                          >
                            Отмена
                          </Button>
                          <Button
                            onClick={updateSubscription}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {(user.subscription_end || user.trial_end) && (
                <div className="mt-3 text-sm text-gray-400">
                  {user.subscription_status === 'trial' && user.trial_end && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Пробный до: {new Date(user.trial_end).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                  {user.subscription_end && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Подписка до: {new Date(user.subscription_end).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagementPanel;
