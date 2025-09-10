
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BLOCK_TYPES, BLOCK_CATEGORIES } from './BlockTypes';

export const BlocksSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, blockType: string) => {
    event.dataTransfer.setData('application/reactflow', blockType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedBlocks = BLOCK_CATEGORIES.map(category => ({
    ...category,
    blocks: BLOCK_TYPES.filter(block => block.category === category.id)
  }));

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {groupedBlocks.map((category) => (
        <Card key={category.id} className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${category.color}`} />
              {category.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {category.blocks.map((block) => {
              const IconComponent = block.icon;
              return (
                <div
                  key={block.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, block.id)}
                  className="p-3 bg-gray-800 rounded-lg border border-gray-600 cursor-grab active:cursor-grabbing hover:border-gray-500 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${block.color}/20 group-hover:${block.color}/30 transition-colors`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm mb-1">
                        {block.name}
                      </div>
                      <div className="text-gray-400 text-xs mb-2 line-clamp-2">
                        {block.description}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {block.platforms.includes('all') ? (
                          <Badge variant="secondary" className="text-xs">
                            Все платформы
                          </Badge>
                        ) : (
                          block.platforms.slice(0, 2).map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))
                        )}
                        {block.platforms.length > 2 && !block.platforms.includes('all') && (
                          <Badge variant="outline" className="text-xs">
                            +{block.platforms.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Как использовать</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-400 space-y-2">
          <div>1. Перетащите блоки в рабочую область</div>
          <div>2. Соедините блоки стрелками</div>
          <div>3. Настройте каждый блок</div>
          <div>4. Сохраните или экспортируйте сценарий</div>
        </CardContent>
      </Card>
    </div>
  );
};
