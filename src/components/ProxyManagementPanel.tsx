
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, Upload, Link, Unlink, RefreshCw } from 'lucide-react';

interface Proxy {
  id: number;
  ip: string;
  port: number;
  username?: string;
  password?: string;
  country: string;
  status: 'online' | 'offline' | 'checking';
  speed: string;
  connectedAccounts: number;
}

const ProxyManagementPanel: React.FC = () => {
  const [proxies, setProxies] = useState<Proxy[]>([
    { id: 1, ip: '192.168.1.10', port: 8080, country: 'US', status: 'online', speed: '45ms', connectedAccounts: 3 },
    { id: 2, ip: '192.168.1.11', port: 8081, country: 'UK', status: 'online', speed: '62ms', connectedAccounts: 2 },
    { id: 3, ip: '192.168.1.12', port: 8082, country: 'DE', status: 'offline', speed: 'N/A', connectedAccounts: 0 },
  ]);

  const [newProxy, setNewProxy] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddProxy = () => {
    if (newProxy.trim()) {
      const parts = newProxy.split(':');
      if (parts.length >= 2) {
        const newProxyObj: Proxy = {
          id: Date.now(),
          ip: parts[0],
          port: parseInt(parts[1]),
          username: parts[2],
          password: parts[3],
          country: 'Unknown',
          status: 'checking',
          speed: 'Checking...',
          connectedAccounts: 0
        };
        setProxies([...proxies, newProxyObj]);
        setNewProxy('');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        const newProxies: Proxy[] = lines.map((line, index) => {
          const parts = line.trim().split(':');
          return {
            id: Date.now() + index,
            ip: parts[0] || '',
            port: parseInt(parts[1]) || 8080,
            username: parts[2],
            password: parts[3],
            country: 'Unknown',
            status: 'checking' as const,
            speed: 'Checking...',
            connectedAccounts: 0
          };
        });
        
        setProxies([...proxies, ...newProxies]);
      };
      reader.readAsText(file);
    }
  };

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
            <CardTitle className="text-blue-200 text-lg">Подключений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {proxies.reduce((sum, p) => sum + p.connectedAccounts, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Добавить прокси</CardTitle>
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
            
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button className="bg-green-500 hover:bg-green-600">
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Привязка к аккаунтам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Выберите аккаунт" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account1">@user1</SelectItem>
                <SelectItem value="account2">@user2</SelectItem>
                <SelectItem value="account3">@user3</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Выберите прокси" />
              </SelectTrigger>
              <SelectContent>
                {proxies.filter(p => p.status === 'online').map(proxy => (
                  <SelectItem key={proxy.id} value={proxy.id.toString()}>
                    {proxy.ip}:{proxy.port} ({proxy.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-500 hover:bg-green-600">
                <Link className="mr-2 h-4 w-4" />
                Привязать
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600">
                <Unlink className="mr-2 h-4 w-4" />
                Отвязать
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">IP:Port</TableHead>
                <TableHead className="text-gray-300">Страна</TableHead>
                <TableHead className="text-gray-300">Статус</TableHead>
                <TableHead className="text-gray-300">Скорость</TableHead>
                <TableHead className="text-gray-300">Подключений</TableHead>
                <TableHead className="text-gray-300">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proxies.map((proxy) => (
                <TableRow key={proxy.id} className="border-gray-700">
                  <TableCell className="text-white font-mono">
                    {proxy.ip}:{proxy.port}
                  </TableCell>
                  <TableCell className="text-gray-300">{proxy.country}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(proxy.status)} text-white`}>
                      {proxy.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{proxy.speed}</TableCell>
                  <TableCell className="text-gray-300">{proxy.connectedAccounts}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProxyManagementPanel;
