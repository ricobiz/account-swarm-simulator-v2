
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

interface MonitoringStatsProps {
  activeScenarios: number;
  workingAccounts: number;
  errorCount: number;
  totalLogs: number;
}

const MonitoringStats = ({ 
  activeScenarios, 
  workingAccounts, 
  errorCount, 
  totalLogs 
}: MonitoringStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Активные сценарии</p>
              <p className="text-2xl font-bold text-white">{activeScenarios}</p>
            </div>
            <Activity className="h-8 w-8 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Работающие аккаунты</p>
              <p className="text-2xl font-bold text-white">{workingAccounts}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ошибки</p>
              <p className="text-2xl font-bold text-white">{errorCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Всего логов</p>
              <p className="text-2xl font-bold text-white">{totalLogs}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringStats;
