
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Settings } from 'lucide-react';

interface TemplateAction {
  id: string;
  templateId: string;
  name: string;
  description: string;
  category: string;
  settings: Record<string, any>;
  type: 'template';
}

interface ActionTemplatesListProps {
  actions: TemplateAction[];
  onRemoveAction: (actionId: string) => void;
  onEditAction?: (action: TemplateAction) => void;
}

export const ActionTemplatesList: React.FC<ActionTemplatesListProps> = ({
  actions,
  onRemoveAction,
  onEditAction
}) => {
  if (actions.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Действия не добавлены</p>
          <p className="text-sm text-gray-500 mt-1">
            Выберите готовые шаблоны действий выше
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatSettingValue = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'string' && value.length > 30) {
      return value.substring(0, 30) + '...';
    }
    return value;
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-4">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div key={action.id} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{action.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {action.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">
                    {action.description}
                  </p>
                  
                  {/* Настройки действия */}
                  <div className="space-y-1 text-xs">
                    {Object.entries(action.settings).map(([key, value]) => (
                      <div key={key} className="text-gray-500">
                        <span className="text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>{' '}
                        {formatSettingValue(key, value)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-1 ml-4">
                  {onEditAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditAction(action)}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveAction(action.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
