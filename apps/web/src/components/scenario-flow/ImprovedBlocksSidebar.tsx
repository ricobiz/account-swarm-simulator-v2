
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BLOCK_TYPES, BLOCK_CATEGORIES } from './BlockTypes';
import { ChevronDown, ChevronRight, Grip, X } from 'lucide-react';

interface ImprovedBlocksSidebarProps {
  isVisible: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export const ImprovedBlocksSidebar: React.FC<ImprovedBlocksSidebarProps> = ({
  isVisible,
  onToggle,
  isMobile = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic']);

  const onDragStart = (event: React.DragEvent, blockType: string) => {
    event.dataTransfer.setData('application/reactflow', blockType);
    event.dataTransfer.effectAllowed = 'move';
    
    // Добавляем визуальную обратную связь
    const dragElement = event.currentTarget as HTMLElement;
    dragElement.style.opacity = '0.7';
    setTimeout(() => {
      dragElement.style.opacity = '1';
    }, 100);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const groupedBlocks = BLOCK_CATEGORIES.map(category => ({
    ...category,
    blocks: BLOCK_TYPES.filter(block => block.category === category.id),
    isExpanded: expandedCategories.includes(category.id)
  }));

  if (!isVisible) {
    return (
      <div className={`${isMobile ? 'fixed top-4 left-4' : 'fixed left-4 top-1/2 transform -translate-y-1/2'} z-50`}>
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          Показать блоки
        </Button>
      </div>
    );
  }

  return (
    <div className={`
      ${isMobile 
        ? 'fixed inset-0 z-50 bg-gray-900' 
        : 'w-80 bg-gray-800 border-r border-gray-700'
      } 
      flex flex-col h-full
    `}>
      {/* Заголовок с кнопкой скрытия */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <h3 className="text-white font-medium">Блоки действий</h3>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-700"
        >
          {isMobile ? <X className="h-4 w-4" /> : '←'}
        </Button>
      </div>

      {/* Прокручиваемая область с блоками */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedBlocks.map((category) => (
          <Card key={category.id} className="bg-gray-900 border-gray-700">
            <CardHeader 
              className="pb-2 cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <CardTitle className="text-white text-sm flex items-center gap-2">
                {category.isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <div className={`w-3 h-3 rounded ${category.color}`} />
                {category.name}
                <Badge variant="secondary" className="ml-auto text-xs">
                  {category.blocks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            {category.isExpanded && (
              <CardContent className="space-y-2 pt-0">
                {category.blocks.map((block) => {
                  const IconComponent = block.icon;
                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(event) => onDragStart(event, block.id)}
                      onClick={() => {
                        if (isMobile) {
                          // На мобильных устройствах добавляем блок по клику
                          const customEvent = new CustomEvent('addBlock', {
                            detail: { blockType: block.id }
                          });
                          window.dispatchEvent(customEvent);
                          onToggle(); // Закрываем сайдбар после добавления
                        }
                      }}
                      className="p-3 bg-gray-800 rounded-lg border border-gray-600 cursor-grab active:cursor-grabbing hover:border-gray-500 transition-all duration-200 group hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          <Grip className="w-3 h-3 text-gray-500 group-hover:text-gray-400" />
                          <div className={`p-2 rounded-lg ${block.color}/20 group-hover:${block.color}/30 transition-colors`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
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
                      {isMobile && (
                        <div className="mt-2 text-xs text-blue-400 text-center">
                          Нажмите, чтобы добавить
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        ))}

        {/* Инструкция по использованию */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Как использовать</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-400 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{isMobile ? 'Нажмите на блок, чтобы добавить' : 'Перетащите блоки в рабочую область'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Соедините блоки стрелками</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Настройте каждый блок</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Сохраните сценарий</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
