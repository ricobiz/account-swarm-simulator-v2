
import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Users, Globe, Activity, BarChart3, Shield, Upload, Zap, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountsPanel from '@/components/AccountsPanel';
import ProxiesPanel from '@/components/ProxiesPanel';
import ScenariosPanel from '@/components/ScenariosPanel';
import MetricsPanel from '@/components/MetricsPanel';
import ImportAccountsPanel from '@/components/ImportAccountsPanel';
import ProxyManagementPanel from '@/components/ProxyManagementPanel';
import ScenarioLaunchPanel from '@/components/ScenarioLaunchPanel';
import MonitoringPanel from '@/components/MonitoringPanel';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    totalAccounts: 1247,
    activeAccounts: 892,
    proxiesOnline: 156,
    successRate: 94.2,
    runningScenarios: 23
  });

  const toggleFarm = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">SSM Farm</h1>
            <p className="text-gray-300">Social Media Management & Automation Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isRunning ? "default" : "secondary"} className="text-lg px-4 py-2">
              {isRunning ? "Running" : "Stopped"}
            </Badge>
            <Button 
              onClick={toggleFarm}
              size="lg"
              className={`${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isRunning ? "Stop Farm" : "Start Farm"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-200 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalAccounts}</div>
              <p className="text-blue-200 text-sm">{stats.activeAccounts} active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-200 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Proxies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.proxiesOnline}</div>
              <p className="text-green-200 text-sm">online</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
              <Progress value={stats.successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-200 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.runningScenarios}</div>
              <p className="text-orange-200 text-sm">running</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-200 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Secure</div>
              <p className="text-red-200 text-sm">all systems</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-black/20 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="accounts" className="w-full">
              <TabsList className="grid w-full grid-cols-8 bg-gray-800/50">
                <TabsTrigger value="accounts" className="text-white data-[state=active]:bg-blue-500">
                  <Users className="mr-2 h-4 w-4" />
                  Accounts
                </TabsTrigger>
                <TabsTrigger value="import" className="text-white data-[state=active]:bg-purple-500">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </TabsTrigger>
                <TabsTrigger value="proxies" className="text-white data-[state=active]:bg-green-500">
                  <Globe className="mr-2 h-4 w-4" />
                  Proxies
                </TabsTrigger>
                <TabsTrigger value="proxy-mgmt" className="text-white data-[state=active]:bg-teal-500">
                  <Settings className="mr-2 h-4 w-4" />
                  Proxy Mgmt
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="text-white data-[state=active]:bg-purple-500">
                  <Settings className="mr-2 h-4 w-4" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="launch" className="text-white data-[state=active]:bg-yellow-500">
                  <Zap className="mr-2 h-4 w-4" />
                  Launch
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="text-white data-[state=active]:bg-cyan-500">
                  <Monitor className="mr-2 h-4 w-4" />
                  Monitor
                </TabsTrigger>
                <TabsTrigger value="metrics" className="text-white data-[state=active]:bg-orange-500">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Metrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="accounts" className="mt-6">
                <AccountsPanel isRunning={isRunning} />
              </TabsContent>

              <TabsContent value="import" className="mt-6">
                <ImportAccountsPanel />
              </TabsContent>

              <TabsContent value="proxies" className="mt-6">
                <ProxiesPanel />
              </TabsContent>

              <TabsContent value="proxy-mgmt" className="mt-6">
                <ProxyManagementPanel />
              </TabsContent>

              <TabsContent value="scenarios" className="mt-6">
                <ScenariosPanel />
              </TabsContent>

              <TabsContent value="launch" className="mt-6">
                <ScenarioLaunchPanel />
              </TabsContent>

              <TabsContent value="monitoring" className="mt-6">
                <MonitoringPanel />
              </TabsContent>

              <TabsContent value="metrics" className="mt-6">
                <MetricsPanel />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
