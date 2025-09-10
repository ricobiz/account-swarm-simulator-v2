
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Scenario {
  id: string;
  name: string;
  status: string;
  platform: string;
  accounts_count: number;
}

interface StatusTabProps {
  accountStats: {
    idle: number;
    working: number;
    error: number;
  };
  activeScenarios: Scenario[];
}

const StatusTab = ({ accountStats, activeScenarios }: StatusTabProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': 
      case 'running': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': 
      case 'waiting': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Статус аккаунтов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Свободные</span>
            <Badge className="bg-green-500">{accountStats.idle}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Работают</span>
            <Badge className="bg-yellow-500">{accountStats.working}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Ошибки</span>
            <Badge className="bg-red-500">{accountStats.error}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Активные сценарии</CardTitle>
        </CardHeader>
        <CardContent>
          {activeScenarios.length === 0 ? (
            <p className="text-gray-400">Нет активных сценариев</p>
          ) : (
            <div className="space-y-2">
              {activeScenarios.map((scenario) => (
                <div key={scenario.id} className="bg-gray-900/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">{scenario.name}</span>
                    <Badge className={getStatusColor(scenario.status)}>
                      {scenario.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {scenario.platform} • {scenario.accounts_count} аккаунт(ов)
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusTab;
