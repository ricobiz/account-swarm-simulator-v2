
import React, { memo } from 'react';
import { Handle, Position, Node } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ActionNodeData } from './ScenarioFlowBuilder';

export const ActionNode = memo(({ data }: { data: ActionNodeData }) => {
  const IconComponent = data.icon;
  
  return (
    <div className={`
      relative bg-gray-800 border-2 rounded-lg p-4 min-w-[200px]
      ${data.isConfigured ? 'border-green-500' : 'border-orange-500'}
      hover:border-blue-400 transition-colors duration-200
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-600/20">
          <IconComponent className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="text-white font-medium text-sm">{data.label}</div>
          <div className="text-gray-400 text-xs">{data.type}</div>
        </div>
        <div>
          {data.isConfigured ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      </div>

      {data.isConfigured && (
        <div className="space-y-1">
          {Object.entries(data.config).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-400">
              <span className="text-gray-300 capitalize">{key}:</span>{' '}
              {typeof value === 'string' && value.length > 20 
                ? value.substring(0, 20) + '...' 
                : String(value)
              }
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-center">
        <Badge 
          variant={data.isConfigured ? "default" : "secondary"}
          className="text-xs"
        >
          {data.isConfigured ? 'Настроено' : 'Требует настройки'}
        </Badge>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';
