
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SCENARIO_PRESETS } from './PresetTemplates';
import { Download, Play } from 'lucide-react';

interface PresetsSidebarProps {
  onLoadPreset: (presetId: string) => void;
}

export const PresetsSidebar: React.FC<PresetsSidebarProps> = ({ onLoadPreset }) => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Готовые шаблоны</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SCENARIO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-3 bg-gray-800 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm mb-1 truncate">
                    {preset.name}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {preset.nodes.length - 1} блоков
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {preset.category}
                </Badge>
              </div>
              
              <Button
                onClick={() => onLoadPreset(preset.id)}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-3 w-3 mr-2" />
                Загрузить шаблон
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Как использовать шаблоны</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-400 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Выберите подходящий шаблон</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Нажмите "Загрузить шаблон"</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Настройте блоки под ваши нужды</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Сохраните готовый сценарий</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
