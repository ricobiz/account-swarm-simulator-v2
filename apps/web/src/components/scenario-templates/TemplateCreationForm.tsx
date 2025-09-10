
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormData } from '@/hooks/useTemplateManager';
import BasicInfoSection from './BasicInfoSection';
import ExecutionSettingsSection from './ExecutionSettingsSection';
import ScenarioStepsSection from './ScenarioStepsSection';

export type { FormData } from '@/hooks/useTemplateManager';

interface TemplateCreationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onCreateTemplate: () => void;
  actionManager: React.ReactNode;
}

const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onCreateTemplate,
  actionManager
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Создать новый шаблон сценария</DialogTitle>
          <DialogDescription className="text-gray-400">
            Настройте параметры и добавьте шаги для автоматизации
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <BasicInfoSection 
            formData={formData}
            setFormData={setFormData}
          />

          <ExecutionSettingsSection
            formData={formData}
            setFormData={setFormData}
          />

          <ScenarioStepsSection
            formData={formData}
            setFormData={setFormData}
            actionManager={actionManager}
          />

          {/* Кнопки действий */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={onCreateTemplate} className="bg-purple-500 hover:bg-purple-600">
              Создать шаблон
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCreationForm;
