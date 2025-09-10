
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, Upload, Link, Unlink, RefreshCw, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useProxies } from '@/hooks/useProxies';
import { useAccounts } from '@/hooks/useAccounts';
import { toast } from 'sonner';

const ProxyManagementPanel: React.FC = () => {
  const { proxies, addProxy, updateProxy, deleteProxy, loading } = useProxies();
  const { accounts } = useAccounts();
  const [newProxy, setNewProxy] = useState('');
  const [importText, setImportText] = useState('');
  const [validationResults, setValidationResults] = useState<{
    valid: string[];
    invalid: string[];
  }>({ valid: [], invalid: [] });
  const [importing, setImporting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const validateProxies = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const valid: string[] = [];
    const invalid: string[] = [];

    lines.forEach(line => {
      const parts = line.trim().split(':');
      if (parts.length >= 2 && parts[0] && !isNaN(Number(parts[1]))) {
        valid.push(line.trim());
      } else {
        invalid.push(line.trim());
      }
    });

    setValidationResults({ valid, invalid });
  };

  const handleTextChange = (text: string) => {
    setImportText(text);
    validateProxies(text);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportText(content);
        validateProxies(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImportProxies = async () => {
    if (validationResults.valid.length === 0) {
      toast.error('Нет валидных прокси для импорта');
      return;
    }

    setImporting(true);
    let successCount = 0;

    try {
      for (const proxyLine of validationResults.valid) {
        const parts = proxyLine.split(':');
        const ip = parts[0];
        const port = parseInt(parts[1]);
        const username = parts[2] || undefined;
        const password = parts[3] || undefined;

        const { error } = await addProxy({
          ip,
          port,
          username,
          password,
          country: null,
          status: 'offline',
          speed: null,
          usage: 0,
        });

        if (!error) {
          successCount++;
        }
      }

      toast.success(`Импортировано ${successCount} прокси`);
      setImportText('');
      setValidationResults({ valid: [], invalid: [] });
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка при импорте прокси');
    } finally {
      setImporting(false);
    }
  };

  const handleAddProxy = async () => {
    if (newProxy.trim()) {
      const parts = newProxy.split(':');
      if (parts.length >= 2) {
        const { error } = await addProxy({
          ip: parts[0],
          port: parseInt(parts[1]),
          username: parts[2],
          password: parts[3],
          country: null,
          status: 'offline',
          speed: null,
          usage: 0,
        });
        
        if (!error) {
          setNewProxy('');
          toast.success('Прокси добавлен');
        } else {
          toast.error('Ошибка при добавлении прокси');
        }
      } else {
        toast.error('Неверный формат прокси. Используйте: ip:port:username:password');
      }
    }
  };

  const handleDeleteProxy = async (id: string) => {
    const { error } = await deleteProxy(id);
    if (!error) {
      toast.success('Прокси удален');
    } else {
      toast.error('Ошибка при удалении прокси');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Загрузка прокси...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Управление прокси</h3>
        <p className="text-gray-400">Добавление и настройка прокси-серверов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-200 text-lg">Онлайн</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {proxies.filter(p => p.status === 'online').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-200 text-lg">Офлайн</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {proxies.filter(p => p.status === 'offline').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-200 text-lg">Всего</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{proxies.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Импорт прокси</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Upload className="mr-2 h-4 w-4" />
                  Загрузить
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                Поддерживаемые форматы: .txt, .csv<br/>
                Формат: ip:port:username:password
              </div>
            </div>
            
            <div className="text-center">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">{validationResults.valid.length}</div>
                  <div className="text-sm text-gray-400">Валидных</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{validationResults.invalid.length}</div>
                  <div className="text-sm text-gray-400">Ошибочных</div>
                </div>
              </div>
            </div>
          </div>

          <Textarea
            placeholder="ip:port:username:password&#10;192.168.1.1:8080:user:pass&#10;..."
            value={importText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[100px] bg-gray-700 border-gray-600 text-white"
          />
          
          <Button 
            onClick={handleImportProxies}
            disabled={validationResults.valid.length === 0 || importing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {importing ? 'Импорт...' : `Импортировать прокси (${validationResults.valid.length})`}
          </Button>
        </CardContent>
      </Card>

      {(validationResults.valid.length > 0 || validationResults.invalid.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {validationResults.valid.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Валидные прокси ({validationResults.valid.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {validationResults.valid.map((proxy, index) => (
                    <div key={index} className="text-sm text-gray-300 font-mono">
                      {proxy}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {validationResults.invalid.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Ошибочные строки ({validationResults.invalid.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {validationResults.invalid.map((proxy, index) => (
                    <div key={index} className="text-sm text-red-300 font-mono">
                      {proxy}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Добавить прокси вручную</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ip:port:username:password"
              value={newProxy}
              onChange={(e) => setNewProxy(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button onClick={handleAddProxy} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">IP:Port</TableHead>
                <TableHead className="text-gray-300">Страна</TableHead>
                <TableHead className="text-gray-300">Статус</TableHead>
                <TableHead className="text-gray-300">Скорость</TableHead>
                <TableHead className="text-gray-300">Использование</TableHead>
                <TableHead className="text-gray-300">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proxies.length === 0 ? (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    Нет добавленных прокси. Добавьте прокси с помощью формы выше.
                  </TableCell>
                </TableRow>
              ) : (
                proxies.map((proxy) => (
                  <TableRow key={proxy.id} className="border-gray-700">
                    <TableCell className="text-white font-mono">
                      {proxy.ip}:{proxy.port}
                    </TableCell>
                    <TableCell className="text-gray-300">{proxy.country || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(proxy.status)} text-white`}>
                        {proxy.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{proxy.speed || 'N/A'}</TableCell>
                    <TableCell className="text-gray-300">{proxy.usage}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-400 hover:bg-red-900"
                          onClick={() => handleDeleteProxy(proxy.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProxyManagementPanel;
