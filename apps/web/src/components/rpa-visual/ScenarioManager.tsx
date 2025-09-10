
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Trash2, Play } from 'lucide-react';

interface ScenarioManagerProps {
  scenarios: any[];
  onExecute: (scenario: any) => void;
  onDelete: (id: string) => void;
  isExecuting: string | null;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  onExecute,
  onDelete,
  isExecuting
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-green-400" />
          Управление сценариями
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scenarios.length > 0 ? (
          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{scenario.name}</h3>
                    <p className="text-gray-400 text-sm">{scenario.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{scenario.actions?.length || 0} действий</span>
                      <span>{scenario.platform}</span>
                      <span>{new Date(scenario.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onExecute(scenario)}
                      disabled={isExecuting === scenario.id}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {isExecuting === scenario.id ? 'Выполняется' : 'Запустить'}
                    </Button>
                    <Button
                      onClick={() => onDelete(scenario.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Нет сохраненных сценариев</p>
            <p className="text-gray-500 text-sm mt-2">
              Создайте новый сценарий используя рекордер
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
