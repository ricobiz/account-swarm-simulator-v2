
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Play } from 'lucide-react';
import { RPABlockConfig } from '@/components/rpa/RPABlockConfig';
import { useRPAExecutor } from '@/components/rpa/RPAExecutor';

interface RPAActionBlockProps {
  data: {
    id: string;
    label: string;
    config: {
      executeViaRPA?: boolean;
      url?: string;
      actions?: any[];
      timeout?: number;
    };
    onConfigChange?: (config: any) => void;
    isConfigured?: boolean;
  };
}

export const RPAActionBlock: React.FC<RPAActionBlockProps> = ({ data }) => {
  const [showConfig, setShowConfig] = useState(false);
  const { executeRPABlock } = useRPAExecutor();

  const handleConfigChange = (newConfig: any) => {
    if (data.onConfigChange) {
      data.onConfigChange(newConfig);
    }
  };

  const handleTestExecution = async () => {
    if (!data.config.executeViaRPA || !data.config.url) {
      return;
    }

    await executeRPABlock({
      url: data.config.url,
      actions: data.config.actions || [],
      accountId: 'test-account',
      scenarioId: 'test-scenario',
      blockId: data.id,
      timeout: data.config.timeout
    });
  };

  const isConfigured = data.config.executeViaRPA && data.config.url && (data.config.actions?.length || 0) > 0;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-64 ${isConfigured ? 'border-orange-500' : 'border-gray-600'} bg-gray-800`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-400" />
              <span className="text-white text-sm font-medium">RPA Блок</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfig(!showConfig)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={data.config.executeViaRPA ? "default" : "secondary"}>
                {data.config.executeViaRPA ? 'RPA активен' : 'RPA выключен'}
              </Badge>
            </div>
            
            {data.config.executeViaRPA && (
              <div className="text-xs text-gray-400 space-y-1">
                <div>URL: {data.config.url || 'Не задан'}</div>
                <div>Действий: {data.config.actions?.length || 0}</div>
                <div>Таймаут: {data.config.timeout || 60000}мс</div>
              </div>
            )}

            {isConfigured && (
              <Button
                size="sm"
                onClick={handleTestExecution}
                className="w-full bg-orange-600 hover:bg-orange-700 h-7 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Тест
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showConfig && (
        <div className="absolute top-full left-0 mt-2 z-50 w-96">
          <RPABlockConfig
            config={data.config}
            onConfigChange={handleConfigChange}
          />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </>
  );
};
