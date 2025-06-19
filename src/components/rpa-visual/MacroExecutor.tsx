
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Settings } from 'lucide-react';

interface MacroExecutorProps {
  scenarios: any[];
  onExecute: (scenario: any) => void;
  isExecuting: string | null;
}

export const MacroExecutor: React.FC<MacroExecutorProps> = ({
  scenarios,
  onExecute,
  isExecuting
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Play className="h-5 w-5 text-blue-400" />
          Выполнение макросов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenarios.length > 0 ? (
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{scenario.name}</h3>
                    <p className="text-gray-400 text-sm">{scenario.description}</p>
                  </div>
                  <Button
                    onClick={() => onExecute(scenario)}
                    disabled={isExecuting === scenario.id}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isExecuting === scenario.id ? 'Выполняется...' : 'Запустить'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Нет доступных сценариев для выполнения</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
