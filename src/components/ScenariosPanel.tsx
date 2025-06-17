
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Pause, Plus, Edit, Trash2, Clock } from 'lucide-react';

const ScenariosPanel: React.FC = () => {
  const [scenarios] = useState([
    { 
      id: 1, 
      name: 'Auto Like & Follow', 
      platform: 'Instagram', 
      status: 'running', 
      accounts: 45, 
      progress: 78,
      nextRun: '15:30'
    },
    { 
      id: 2, 
      name: 'Content Posting', 
      platform: 'Twitter', 
      status: 'scheduled', 
      accounts: 32, 
      progress: 0,
      nextRun: '16:00'
    },
    { 
      id: 3, 
      name: 'Story Viewing', 
      platform: 'Instagram', 
      status: 'paused', 
      accounts: 28, 
      progress: 45,
      nextRun: 'Paused'
    },
    { 
      id: 4, 
      name: 'Video Engagement', 
      platform: 'TikTok', 
      status: 'running', 
      accounts: 67, 
      progress: 23,
      nextRun: '14:45'
    },
    { 
      id: 5, 
      name: 'Group Interaction', 
      platform: 'Facebook', 
      status: 'completed', 
      accounts: 15, 
      progress: 100,
      nextRun: 'Tomorrow'
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'bg-pink-500';
      case 'Twitter': return 'bg-blue-500';
      case 'TikTok': return 'bg-black';
      case 'Facebook': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Scenario Management</h3>
          <p className="text-gray-400">Create and manage automation scenarios</p>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          Create Scenario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-200 text-lg">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">2</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-200 text-lg">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-200 text-lg">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-gray-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Scenario</TableHead>
                <TableHead className="text-gray-300">Platform</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Accounts</TableHead>
                <TableHead className="text-gray-300">Progress</TableHead>
                <TableHead className="text-gray-300">Next Run</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow key={scenario.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{scenario.name}</TableCell>
                  <TableCell>
                    <Badge className={`${getPlatformColor(scenario.platform)} text-white`}>
                      {scenario.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(scenario.status)} text-white`}>
                      {scenario.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{scenario.accounts}</TableCell>
                  <TableCell className="text-gray-300">{scenario.progress}%</TableCell>
                  <TableCell className="text-gray-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {scenario.nextRun}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        {scenario.status === 'running' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Edit className="h-3 w-3" />
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

export default ScenariosPanel;
