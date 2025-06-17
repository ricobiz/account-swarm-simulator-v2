
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';

const ProxiesPanel: React.FC = () => {
  const [proxies] = useState([
    { id: 1, ip: '192.168.1.1', port: 8080, country: 'US', status: 'online', speed: '45ms', usage: 75 },
    { id: 2, ip: '192.168.1.2', port: 8081, country: 'UK', status: 'online', speed: '62ms', usage: 43 },
    { id: 3, ip: '192.168.1.3', port: 8082, country: 'DE', status: 'offline', speed: 'N/A', usage: 0 },
    { id: 4, ip: '192.168.1.4', port: 8083, country: 'CA', status: 'online', speed: '38ms', usage: 89 },
    { id: 5, ip: '192.168.1.5', port: 8084, country: 'AU', status: 'online', speed: '95ms', usage: 22 },
  ]);

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-400';
    if (usage >= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Proxy Management</h3>
          <p className="text-gray-400">Manage your proxy servers and connections</p>
        </div>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Proxy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-200 text-lg">Online Proxies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">4</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-200 text-lg">Offline Proxies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-200 text-lg">Avg Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">60ms</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-200 text-lg">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">46%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">IP Address</TableHead>
                <TableHead className="text-gray-300">Port</TableHead>
                <TableHead className="text-gray-300">Country</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Speed</TableHead>
                <TableHead className="text-gray-300">Usage</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proxies.map((proxy) => (
                <TableRow key={proxy.id} className="border-gray-700">
                  <TableCell className="text-white font-mono">{proxy.ip}</TableCell>
                  <TableCell className="text-gray-300">{proxy.port}</TableCell>
                  <TableCell className="text-gray-300">{proxy.country}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(proxy.status)} text-white`}>
                      {proxy.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{proxy.speed}</TableCell>
                  <TableCell className={getUsageColor(proxy.usage)}>{proxy.usage}%</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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

export default ProxiesPanel;
