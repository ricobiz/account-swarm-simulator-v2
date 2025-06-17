
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Square, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  platform: string;
  status: string;
  accounts_count: number;
  progress: number;
}

interface ActiveScenariosProps {
  scenarios: Scenario[];
  onStopScenario: (scenarioId: string) => void;
}

const ActiveScenarios: React.FC<ActiveScenariosProps> = ({
  scenarios,
  onStopScenario
}) => {
  if (scenarios.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Активные сценарии ({scenarios.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-white font-medium">{scenario.name}</h4>
                <p className="text-sm text-gray-400">
                  {scenario.accounts_count} аккаунт • {scenario.platform}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={scenario.status === 'running' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {scenario.status === 'running' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : scenario.status === 'completed' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : scenario.status === 'waiting' ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {scenario.status === 'waiting' ? 'В очереди' : scenario.status}
                </Badge>
                {(scenario.status === 'running' || scenario.status === 'waiting') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900"
                    onClick={() => onStopScenario(scenario.id)}
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Прогресс</span>
                <span className="text-white">{scenario.progress || 0}%</span>
              </div>
              <Progress value={scenario.progress || 0} className="w-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveScenarios;
