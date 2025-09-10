
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointer, Type, Clock, Navigation } from 'lucide-react';

const actions = [
  {
    type: 'navigate',
    label: 'Переход на сайт',
    icon: Navigation,
    description: 'Переход по URL адресу',
    color: 'bg-blue-600'
  },
  {
    type: 'click',
    label: 'Клик',
    icon: MousePointer,
    description: 'Клик по элементу на странице',
    color: 'bg-green-600'
  },
  {
    type: 'type',
    label: 'Ввод текста',
    icon: Type,
    description: 'Ввод текста в поле',
    color: 'bg-purple-600'
  },
  {
    type: 'wait',
    label: 'Ожидание',
    icon: Clock,
    description: 'Пауза в выполнении',
    color: 'bg-orange-600'
  },
  {
    type: 'view',
    label: 'Просмотр',
    icon: Eye,
    description: 'Просмотр контента',
    color: 'bg-pink-600'
  },
];

export const ActionsSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, actionType: string) => {
    event.dataTransfer.setData('application/reactflow', actionType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Блоки действий</CardTitle>
          <p className="text-gray-400 text-sm">
            Перетащите блоки в рабочую область для создания сценария
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.type}
                draggable
                onDragStart={(event) => onDragStart(event, action.type)}
                className="p-3 bg-gray-800 rounded-lg border border-gray-600 cursor-grab active:cursor-grabbing hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color}/20`}>
                    <IconComponent className={`h-4 w-4 text-white`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {action.label}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {action.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700 mt-4">
        <CardHeader>
          <CardTitle className="text-white text-sm">Как использовать</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-400 space-y-2">
          <div>1. Перетащите блоки в рабочую область</div>
          <div>2. Соедините блоки стрелками для создания последовательности</div>
          <div>3. Кликните на блок для его настройки</div>
          <div>4. Сохраните готовый сценарий</div>
        </CardContent>
      </Card>
    </div>
  );
};
