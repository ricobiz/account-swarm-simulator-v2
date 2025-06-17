import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Pause, Plus, Search, Filter } from 'lucide-react';

const AccountsPanel: React.FC = () => {
  const [accounts] = useState([
    { id: 1, username: '@socialmedia_user1', platform: 'Instagram', status: 'active', proxy: '192.168.1.1', lastAction: '2 min ago' },
    { id: 2, username: '@twitter_account2', platform: 'Twitter', status: 'idle', proxy: '192.168.1.2', lastAction: '5 min ago' },
    { id: 3, username: '@tiktok_creator3', platform: 'TikTok', status: 'active', proxy: '192.168.1.3', lastAction: '1 min ago' },
    { id: 4, username: '@facebook_page4', platform: 'Facebook', status: 'error', proxy: '192.168.1.4', lastAction: '10 min ago' },
    { id: 5, username: '@youtube_channel5', platform: 'YouTube', status: 'active', proxy: '192.168.1.5', lastAction: '3 min ago' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'bg-pink-500';
      case 'Twitter': return 'bg-blue-500';
      case 'TikTok': return 'bg-black';
      case 'Facebook': return 'bg-blue-600';
      case 'YouTube': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Account Management</h3>
          <p className="text-gray-400">Manage and monitor your social media accounts</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search accounts..."
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Account</TableHead>
                <TableHead className="text-gray-300">Platform</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Proxy</TableHead>
                <TableHead className="text-gray-300">Last Action</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{account.username}</TableCell>
                  <TableCell>
                    <Badge className={`${getPlatformColor(account.platform)} text-white`}>
                      {account.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(account.status)} text-white`}>
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{account.proxy}</TableCell>
                  <TableCell className="text-gray-300">{account.lastAction}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        {account.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
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

export default AccountsPanel;
