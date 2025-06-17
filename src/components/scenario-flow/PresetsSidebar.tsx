
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SCENARIO_PRESETS } from './PresetTemplates';
import { Play, Download, Eye } from 'lucide-react';

interface PresetsSidebarProps {
  onLoadPreset: (presetId: string) => void;
}

export const PresetsSidebar: React.FC<PresetsSidebarProps> = ({ onLoadPreset }) => {
  const groupedPresets = SCENARIO_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, typeof SCENARIO_PRESETS>);

  const categoryNames = {
    engagement: 'Продвижение',
    spam: 'Массовая активность',
    automation: 'Автоматизация'
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedPresets).map(([category, presets]) => (
        <Card key={category} className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              {categoryNames[category as keyof typeof categoryNames] || category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="p-3 bg-gray-800 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="mb-2">
                  <div className="text-white font-medium text-sm mb-1">
                    {preset.name}
                  </div>
                  <div className="text-gray-400 text-xs mb-2">
                    {preset.description}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {preset.platform}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {preset.nodes.length - 1} блоков
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {preset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={() => onLoadPreset(preset.id)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
                  size="sm"
                >
                  <Play className="mr-2 h-3 w-3" />
                  Загрузить пресет
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">О пресетах</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-400 space-y-2">
          <div>• Готовые сценарии для популярных задач</div>
          <div>• Можете изменить и настроить под себя</div>
          <div>• Сохраните как собственный шаблон</div>
        </CardContent>
      </Card>
    </div>
  );
};
