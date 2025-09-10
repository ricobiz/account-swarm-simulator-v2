
import React, { memo } from 'react';
import { Handle, Position, Node } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, GitBranch } from 'lucide-react';
import { getBlockTypeById } from './BlockTypes';

export const AdvancedActionNode = memo(({ data }: { data: any }) => {
  const blockType = getBlockTypeById(data.type);
  const IconComponent = blockType?.icon || AlertCircle;
  const hasMultipleOutputs = blockType?.hasMultipleOutputs;
  
  return (
    <div className={`
      relative bg-gray-800 border-2 rounded-lg p-4 min-w-[200px] max-w-[280px]
      ${data.isConfigured ? 'border-green-500' : 'border-orange-500'}
      hover:border-blue-400 transition-colors duration-200
      ${blockType?.color || 'bg-gray-600'}/10
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${blockType?.color || 'bg-gray-600'}/20`}>
          <IconComponent className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium text-sm truncate">{data.label}</div>
          <div className="text-gray-400 text-xs">{blockType?.category}</div>
        </div>
        <div>
          {data.isConfigured ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      </div>

      {blockType?.description && (
        <div className="text-xs text-gray-500 mb-2 line-clamp-2">
          {blockType.description}
        </div>
      )}

      {data.isConfigured && data.config && Object.keys(data.config).length > 0 && (
        <div className="space-y-1 mb-2">
          {Object.entries(data.config).slice(0, 3).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-400">
              <span className="text-gray-300 capitalize">{key}:</span>{' '}
              {typeof value === 'string' && value.length > 15 
                ? value.substring(0, 15) + '...' 
                : String(value)
              }
            </div>
          ))}
          {Object.keys(data.config).length > 3 && (
            <div className="text-xs text-gray-500">
              +{Object.keys(data.config).length - 3} параметров
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center mb-2">
        <Badge 
          variant={data.isConfigured ? "default" : "secondary"}
          className="text-xs"
        >
          {data.isConfigured ? 'Настроено' : 'Требует настройки'}
        </Badge>
      </div>

      {/* Если блок имеет условные выходы (if/else) */}
      {hasMultipleOutputs && blockType?.outputs ? (
        <div className="flex justify-between">
          {blockType.outputs.map((output) => (
            <Handle
              key={output.id}
              type="source"
              position={Position.Bottom}
              id={output.id}
              className={`w-3 h-3 border-2 border-white ${output.color}`}
              style={{ position: 'relative', transform: 'none' }}
            />
          ))}
        </div>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
        />
      )}

      {/* Платформы для которых доступен блок */}
      {blockType?.platforms && blockType.platforms.length > 0 && !blockType.platforms.includes('all') && (
        <div className="absolute top-2 right-2">
          <div className="flex gap-1">
            {blockType.platforms.slice(0, 2).map((platform) => (
              <div
                key={platform}
                className="w-2 h-2 rounded-full bg-blue-400"
                title={platform}
              />
            ))}
            {blockType.platforms.length > 2 && (
              <div className="w-2 h-2 rounded-full bg-gray-400" title={`+${blockType.platforms.length - 2} платформ`} />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

AdvancedActionNode.displayName = 'AdvancedActionNode';
