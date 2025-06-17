
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Trash2, Edit, Eye, EyeOff, Users, Loader2 } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useProxies } from '@/hooks/useProxies';
import { useToast } from '@/hooks/use-toast';

const PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'reddit', label: 'Reddit' }
];

const AccountsPanel = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newAccount, setNewAccount] = useState({
    username: '',
    password: '',
    platform: '',
    proxy_id: null as string | null
  });
  const [importData, setImportData] = useState('');

  const { accounts, loading, addAccount, deleteAccount, refetch } = useAccounts();
  const { proxies } = useProxies();
  const { toast } = useToast();

  const handleAddAccount = async () => {
    if (!newAccount.username || !newAccount.password || !newAccount.platform) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const result = await addAccount({
      username: newAccount.username,
      password: newAccount.password,
      platform: newAccount.platform,
      status: 'idle',
      proxy_id: newAccount.proxy_id,
      last_action: new Date().toISOString()
    });

    if (result.error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить аккаунт",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Успех",
        description: "Аккаунт успешно добавлен"
      });
      setNewAccount({ username: '', password: '', platform: '', proxy_id: null });
      setIsAddDialogOpen(false);
    }
  };

  const handleImportAccounts = async () => {
    const lines = importData.trim().split('\n');
    let successCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 3) {
        const [platform, username, password] = parts;
        const result = await addAccount({
          username: username.trim(),
          password: password.trim(),
          platform: platform.trim().toLowerCase(),
          status: 'idle',
          proxy_id: null,
          last_action: new Date().toISOString()
        });

        if (result.error) {
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    toast({
      title: "Импорт завершен",
      description: `Добавлено: ${successCount}, ошибок: ${errorCount}`
    });

    setImportData('');
    setIsImportDialogOpen(false);
  };

  const handleDeleteAccount = async (id: string) => {
    const result = await deleteAccount(id);
    if (result.error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аккаунт",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Успех",
        description: "Аккаунт удален"
      });
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-500';
      case 'working': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="ml-2 text-gray-300">Загрузка аккаунтов...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление аккаунтами ({accounts.length})
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/20">
                    <Upload className="h-4 w-4 mr-2" />
                    Импорт
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Импорт аккаунтов</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Введите данные в формате: платформа:логин:пароль (по одному на строку)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="telegram:username1:password1&#10;tiktok:username2:password2"
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={6}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleImportAccounts} className="bg-blue-600 hover:bg-blue-700">
                        Импортировать
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить аккаунт
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Добавить новый аккаунт</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Введите данные аккаунта для добавления в систему
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Платформа</label>
                      <Select value={newAccount.platform} onValueChange={(value) => setNewAccount(prev => ({ ...prev, platform: value }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Выберите платформу" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {PLATFORMS.map((platform) => (
                            <SelectItem key={platform.value} value={platform.value}>
                              {platform.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Логин/Username</label>
                      <Input
                        value={newAccount.username}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Введите логин"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Пароль</label>
                      <Input
                        type="password"
                        value={newAccount.password}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Введите пароль"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Прокси (опционально)</label>
                      <Select value={newAccount.proxy_id || ''} onValueChange={(value) => setNewAccount(prev => ({ ...prev, proxy_id: value || null }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Выберите прокси" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="">Без прокси</SelectItem>
                          {proxies.map((proxy) => (
                            <SelectItem key={proxy.id} value={proxy.id}>
                              {proxy.ip}:{proxy.port} ({proxy.country || 'Unknown'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleAddAccount} className="bg-purple-500 hover:bg-purple-600">
                        Добавить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Аккаунты не найдены</p>
              <p className="text-sm">Добавьте аккаунты для начала работы</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Платформа</th>
                    <th className="text-left py-3 px-4 text-gray-300">Логин</th>
                    <th className="text-left py-3 px-4 text-gray-300">Пароль</th>
                    <th className="text-left py-3 px-4 text-gray-300">Статус</th>
                    <th className="text-left py-3 px-4 text-gray-300">Прокси</th>
                    <th className="text-left py-3 px-4 text-gray-300">Последнее действие</th>
                    <th className="text-left py-3 px-4 text-gray-300">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {account.platform}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{account.username}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">
                            {showPasswords[account.id] ? account.password : '••••••••'}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility(account.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showPasswords[account.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(account.status)}>
                          {account.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {account.proxy_id ? (
                          proxies.find(p => p.id === account.proxy_id)?.ip || 'Unknown'
                        ) : (
                          'Нет'
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(account.last_action).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="border-red-600 text-red-400 hover:bg-red-900"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPanel;
