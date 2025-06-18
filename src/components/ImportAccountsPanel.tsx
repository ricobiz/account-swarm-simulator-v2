
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  AlertCircle,
  Users,
  Loader2
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useLogs } from '@/hooks/useLogs';
import { useToast } from '@/hooks/use-toast';

interface AccountData {
  username: string;
  password: string;
  platform: string;
  status: 'pending' | 'success' | 'error' | 'duplicate';
  error?: string;
}

const ImportAccountsPanel = () => {
  const [textData, setTextData] = useState('');
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { addAccount, accounts: existingAccounts } = useAccounts();
  const { addLog } = useLogs();
  const { toast } = useToast();

  const parseAccountData = (data: string): AccountData[] => {
    const lines = data.trim().split('\n').filter(line => line.trim());
    const parsed: AccountData[] = [];

    console.log('Parsing account data:', lines);

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Поддерживаем форматы: username:password:platform, username:password или просто username
      let parts: string[];
      
      if (trimmedLine.includes(':')) {
        parts = trimmedLine.split(':');
      } else if (trimmedLine.includes(',')) {
        parts = trimmedLine.split(',');
      } else {
        // Если только username без разделителей
        parts = [trimmedLine];
      }

      console.log(`Line ${index + 1}: ${trimmedLine} -> parts:`, parts);

      if (parts.length >= 1) {
        const username = parts[0]?.trim();
        const password = parts[1]?.trim() || 'defaultpass123'; // Дефолтный пароль если не указан
        const platform = parts[2]?.trim() || 'telegram'; // Дефолтная платформа

        if (username && username.length >= 3) {
          parsed.push({
            username,
            password,
            platform: platform.toLowerCase(),
            status: 'pending'
          });
        } else {
          parsed.push({
            username: trimmedLine,
            password: '',
            platform: 'telegram',
            status: 'error',
            error: 'Неверное имя пользователя (минимум 3 символа)'
          });
        }
      }
    });

    console.log('Parsed accounts:', parsed);
    return parsed;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      console.log('File content:', content);
      setTextData(content);
      const parsed = parseAccountData(content);
      setAccounts(parsed);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (value: string) => {
    console.log('Text input changed:', value);
    setTextData(value);
    if (value.trim()) {
      const parsed = parseAccountData(value);
      setAccounts(parsed);
    } else {
      setAccounts([]);
    }
  };

  const processAccounts = async () => {
    if (accounts.length === 0) {
      toast({
        title: "Ошибка",
        description: "Нет аккаунтов для импорта",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting account processing...', accounts);
    setIsProcessing(true);
    setProgress(0);

    const results: AccountData[] = [...accounts];
    let processed = 0;
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < results.length; i++) {
      const account = results[i];
      
      console.log(`Processing account ${i + 1}:`, account);

      if (account.status === 'error') {
        errorCount++;
        processed++;
        setProgress((processed / results.length) * 100);
        continue;
      }

      // Проверяем дубликаты
      const isDuplicate = existingAccounts.some(
        existing => existing.username.toLowerCase() === account.username.toLowerCase() && 
                   existing.platform.toLowerCase() === account.platform.toLowerCase()
      );

      if (isDuplicate) {
        console.log('Duplicate found:', account.username);
        results[i] = { ...account, status: 'duplicate', error: 'Аккаунт уже существует' };
        duplicateCount++;
        
        if (addLog) {
          await addLog({
            action: 'Импорт аккаунта',
            details: `Попытка добавить дубликат: ${account.username} (${account.platform})`,
            status: 'warning'
          });
        }
      } else {
        try {
          console.log('Adding account to database:', account);
          
          const result = await addAccount({
            username: account.username,
            password: account.password,
            platform: account.platform,
            status: 'idle',
            proxy_id: null,
            last_action: new Date().toISOString()
          });

          console.log('Add account result:', result);

          if (result.error) {
            console.error('Error adding account:', result.error);
            results[i] = { ...account, status: 'error', error: result.error.message || 'Ошибка сохранения' };
            errorCount++;
            
            if (addLog) {
              await addLog({
                action: 'Импорт аккаунта',
                details: `Ошибка при добавлении ${account.username}: ${result.error.message}`,
                status: 'error'
              });
            }
          } else {
            console.log('Account added successfully');
            results[i] = { ...account, status: 'success' };
            successCount++;
            
            if (addLog) {
              await addLog({
                account_id: result.data?.id,
                action: 'Импорт аккаунта',
                details: `Успешно добавлен аккаунт ${account.username} (${account.platform})`,
                status: 'success'
              });
            }
          }
        } catch (error: any) {
          console.error('Exception adding account:', error);
          results[i] = { ...account, status: 'error', error: error.message || 'Неизвестная ошибка' };
          errorCount++;
          
          if (addLog) {
            await addLog({
              action: 'Импорт аккаунта',
              details: `Критическая ошибка при добавлении ${account.username}: ${error.message}`,
              status: 'error'
            });
          }
        }
      }

      processed++;
      setProgress((processed / results.length) * 100);
      setAccounts([...results]);

      // Небольшая задержка для UX
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsProcessing(false);
    
    console.log('Import completed:', { successCount, errorCount, duplicateCount });

    toast({
      title: "Импорт завершён",
      description: `Добавлено: ${successCount}, Ошибок: ${errorCount}, Дубликатов: ${duplicateCount}`,
      variant: successCount > 0 ? "default" : "destructive"
    });

    // Очищаем данные после успешного импорта
    if (successCount > 0) {
      setTimeout(() => {
        setTextData('');
        setAccounts([]);
      }, 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'duplicate':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-400">Добавлен</Badge>;
      case 'error':
        return <Badge variant="destructive">Ошибка</Badge>;
      case 'duplicate':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Дубликат</Badge>;
      default:
        return <Badge variant="outline">Ожидание</Badge>;
    }
  };

  const successCount = accounts.filter(a => a.status === 'success').length;
  const errorCount = accounts.filter(a => a.status === 'error').length;
  const duplicateCount = accounts.filter(a => a.status === 'duplicate').length;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Импорт аккаунтов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Загрузить файл (.txt/.csv)
              </label>
              <Input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Или вставить данные
              </label>
              <Textarea
                value={textData}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="username:password:platform&#10;user1:pass1:telegram&#10;user2:pass2:tiktok&#10;&#10;Или просто usernames:&#10;user1&#10;user2"
                className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
              />
            </div>
          </div>

          {accounts.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Найдено аккаунтов: {accounts.length}
                </div>
                
                <Button 
                  onClick={processAccounts}
                  disabled={isProcessing || accounts.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Импортировать аккаунты
                    </>
                  )}
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <div className="text-xs text-gray-400 text-center">
                    {Math.round(progress)}% завершено
                  </div>
                </div>
              )}

              {(successCount > 0 || errorCount > 0 || duplicateCount > 0) && (
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-green-400">{successCount}</div>
                      <div className="text-xs text-green-300">Добавлено</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-500/10 border-yellow-500/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-yellow-400">{duplicateCount}</div>
                      <div className="text-xs text-yellow-300">Дубликатов</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-red-400">{errorCount}</div>
                      <div className="text-xs text-red-300">Ошибок</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto bg-gray-900/50 rounded-lg">
                <div className="space-y-1 p-3">
                  {accounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-gray-700">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(account.status)}
                        <div>
                          <div className="text-white font-medium">
                            {account.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {account.platform} • {account.password ? 'Пароль установлен' : 'Без пароля'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(account.status)}
                        {account.error && (
                          <div className="text-xs text-red-400 max-w-xs truncate">
                            {account.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="text-xs text-gray-500">
            <p><strong>Поддерживаемые форматы:</strong></p>
            <p>• username:password:platform (например: user1:pass123:telegram)</p>
            <p>• username:password (платформа по умолчанию: telegram)</p>
            <p>• username (пароль по умолчанию: defaultpass123, платформа: telegram)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportAccountsPanel;
