
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface TemplateActionsProps {
  refreshing: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export const TemplateActions: React.FC<TemplateActionsProps> = ({
  refreshing,
  onRefresh,
  onCreateNew
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white">Шаблоны сценариев</h3>
        <p className="text-gray-400">Создание и управление конфигурациями автоматизации</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className="border-gray-600 text-gray-400 hover:bg-gray-700"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
        <Button 
          className="bg-purple-500 hover:bg-purple-600" 
          onClick={onCreateNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Создать шаблон
        </Button>
      </div>
    </div>
  );
};
