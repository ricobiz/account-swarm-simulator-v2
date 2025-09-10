
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ActionTemplatesSelector } from './ActionTemplatesSelector';
import { ActionTemplatesList } from './ActionTemplatesList';
import { FormData } from '@/hooks/useTemplateManager';

interface TemplateActionManagerProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export const TemplateActionManager: React.FC<TemplateActionManagerProps> = ({
  formData,
  setFormData
}) => {
  const { toast } = useToast();

  const addAction = (action: any) => {
    setFormData({
      ...formData,
      steps: [...formData.steps, action]
    });

    toast({
      title: "Действие добавлено",
      description: `"${action.name}" добавлено в сценарий`
    });
  };

  const removeAction = (actionId: string) => {
    const removedAction = formData.steps.find(step => step.id === actionId);
    setFormData({
      ...formData,
      steps: formData.steps.filter(step => step.id !== actionId)
    });

    if (removedAction) {
      toast({
        title: "Действие удалено",
        description: `"${removedAction.name}" удалено из сценария`
      });
    }
  };

  return (
    <div className="space-y-6">
      <ActionTemplatesSelector
        platform={formData.platform}
        onAddAction={addAction}
      />

      {formData.steps.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-white">
            Добавленные действия ({formData.steps.length})
          </h3>
          <ActionTemplatesList
            actions={formData.steps}
            onRemoveAction={removeAction}
          />
        </>
      )}
    </div>
  );
};
