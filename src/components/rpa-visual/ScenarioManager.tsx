
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Trash2, 
  Eye, 
  Clock,
  Globe,
  MousePointer,
  Type,
  Hand,
  MoreHorizontal,
  Monitor,
  Server
} from 'lucide-react';

interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'wait' | 'scroll' | 'hover';
  coordinates: { x: number; y: number };
  browserResolution: { width: number; height: number };
  description: string;
  value?: string;
  timestamp: number;
}

interface SavedScenario {
  id: string;
  name: string;
  description: string;
  actions: RecordedAction[];
  created_at: string;
  platform: string;
  browserResolution: { width: number; height: number };
}

interface ScenarioManagerProps {
  scenarios: SavedScenario[];
  onExecute: (scenario: SavedScenario) => void;
  onDelete: (id: string) => void;
  isExecuting: string | null;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  onExecute,
  onDelete,
  isExecuting
}) => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'click': return <MousePointer className="h-3 w-3" />;
      case 'type': return <Type className="h-3 w-3" />;
      case 'hover': return <Hand className="h-3 w-3" />;
      case 'wait': return <Clock className="h-3 w-3" />;
      default: return <MoreHorizontal className="h-3 w-3" />;
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'click': return 'bg-blue-500';
      case 'type': return 'bg-green-500';
      case 'hover': return 'bg-yellow-500';
      case 'wait': return 'bg-purple-500';
      case 'scroll': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (scenarios.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400">
            <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">Нет серверных сценариев</h3>
            <p>Используйте серверный рекордер для создания сценариев на основе реальных скриншотов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Серверные сценарии ({scenarios.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    {scenario.name}
                    <Badge variant="outline" className="ml-2">
                      <Globe className="h-3 w-3 mr-1" />
                      {scenario.platform}
                    </Badge>
                    <Badge variant="secondary" className="ml-1">
                      <Monitor className="h-3 w-3 mr-1" />
                      {scenario.browserResolution.width}x{scenario.browserResolution.height}
                    </Badge>
                  </CardTitle>
                  {scenario.description && (
                    <p className="text-gray-400 text-sm mt-1">{scenario.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Создан: {new Date(scenario.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onExecute(scenario)}
                    disabled={isExecuting !== null}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isExecuting === scenario.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )
                     : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => onDelete(scenario.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    Действий: <span className="text-white font-medium">{scenario.actions.length}</span>
                  </span>
                  <span className="text-gray-400">
                    Длительность: <span className="text-white font-medium">
                      ~{Math.ceil(scenario.actions.length * 2.5)}с
                    </span>
                  </span>
                  <span className="text-gray-400">
                    Разрешение: <span className="text-white font-medium">
                      {scenario.browserResolution.width}x{scenario.browserResolution.height}
                    </span>
                  </span>
                </div>

                <Separator className="bg-gray-600" />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Последовательность действий:</h4>
                  <div className="flex flex-wrap gap-2">
                    {scenario.actions.slice(0, 10).map((action, index) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-gray-700 text-xs"
                      >
                        <div className={`h-2 w-2 rounded-full ${getActionTypeColor(action.type)}`} />
                        {getActionIcon(action.type)}
                        <span className="text-gray-300">{index + 1}</span>
                      </div>
                    ))}
                    {scenario.actions.length > 10 && (
                      <div className="flex items-center px-2 py-1 rounded bg-gray-700 text-xs text-gray-400">
                        +{scenario.actions.length - 10} еще
                      </div>
                    )}
                  </div>
                </div>

                {/* Предварительный просмотр первых действий с координатами */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-300">Первые серверные действия:</h4>
                  {scenario.actions.slice(0, 3).map((action, index) => (
                    <div key={action.id} className="text-xs text-gray-400 pl-4">
                      {index + 1}. {action.type} - {action.description}
                      <span className="text-gray-500 ml-2">
                        ({action.coordinates.x}, {action.coordinates.y})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Информация о совместимости */}
                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                  <div className="flex items-center gap-2 text-xs">
                    <Server className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">Серверный сценарий:</span>
                    <Badge variant="outline" className="text-xs">
                      Координаты записаны относительно серверного браузера
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Сценарий будет выполнен на сервере с разрешением {scenario.browserResolution.width}x{scenario.browserResolution.height}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
