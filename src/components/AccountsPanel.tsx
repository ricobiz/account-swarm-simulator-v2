import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Globe,
  User,
  Key,
  Loader2
} from 'lucide-react';

interface AccountsPanelProps {
  onAccountAdded?: () => void;
}

const AccountsPanel: React.FC<AccountsPanelProps> = ({ onAccountAdded }) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isAdding, setIsAdding] = useState(false);
  
  const [newAccount, setNewAccount] = useState({
    platform: '',
    username: '',
    password: ''
  });
  
  const { toast } = useToast();

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Аккаунт удален",
        description: "Аккаунт успешно удален"
      });

      loadAccounts();
      onAccountAdded?.();
    } catch (error: any) {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAccount.platform || !newAccount.username || !newAccount.password) {
      toast({
        title: "Заполните все поля",
        description: "Все поля обязательны для заполнения",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAdding(true);
      
      const { error } = await supabase
        .from('accounts')
        .insert([{
          platform: newAccount.platform,
          username: newAccount.username,
          password: newAccount.password,
          status: 'idle'
        }]);

      if (error) throw error;

      toast({
        title: "Аккаунт добавлен",
        description: `${newAccount.username} добавлен для ${newAccount.platform}`
      });

      setNewAccount({ platform: '', username: '', password: '' });
      setShowAddForm(false);
      loadAccounts();
      onAccountAdded?.();

    } catch (error: any) {
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Аккаунты ({accounts.length})
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Форма добавления */}
        {showAddForm && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <form onSubmit={addAccount} className="space-y-3">
                <Select value={newAccount.platform} onValueChange={(value) => setNewAccount(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                    <SelectValue placeholder="Выберите платформу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={newAccount.username}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Логин/Email"
                  className="bg-gray-600 border-gray-500 text-white"
                />

                <Input
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Пароль"
                  className="bg-gray-600 border-gray-500 text-white"
                />

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Добавляем...
                      </>
                    ) : (
                      'Добавить аккаунт'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="border-gray-500 text-gray-300"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Список аккаунтов */}
        {isLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-400">Загружаем аккаунты...</p>
          </div>
        ) : accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">{account.platform}</span>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                      {account.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAccount(account.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-300 text-sm">{account.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-300 text-sm font-mono">
                      {showPasswords[account.id] ? account.password : '••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(account.id)}
                      className="p-1 h-auto text-gray-400 hover:text-white"
                    >
                      {showPasswords[account.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Нет добавленных аккаунтов</p>
            <p className="text-sm mt-2">Нажмите "Добавить" чтобы создать первый аккаунт</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsPanel;
