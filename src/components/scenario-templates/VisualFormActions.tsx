
import React from 'react';
import { Button } from '@/components/ui/button';

interface VisualFormActionsProps {
  onCancel: () => void;
  onCreateTemplate: () => void;
  isDisabled: boolean;
}

export const VisualFormActions: React.FC<VisualFormActionsProps> = ({
  onCancel,
  onCreateTemplate,
  isDisabled
}) => {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
      <Button variant="outline" onClick={onCancel}>
        Отмена
      </Button>
      <Button 
        onClick={onCreateTemplate} 
        className="bg-purple-500 hover:bg-purple-600"
        disabled={isDisabled}
      >
        Создать шаблон
      </Button>
    </div>
  );
};
