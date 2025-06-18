
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormData } from '@/hooks/useTemplateManager';
import { ScenarioFlowBuilder, ActionNodeData } from '../scenario-flow/ScenarioFlowBuilder';
import { Node, Edge } from '@xyflow/react';
import { VisualBasicInfoSection } from './VisualBasicInfoSection';
import { VisualScenarioSection } from './VisualScenarioSection';
import { VisualExecutionSettingsSection } from './VisualExecutionSettingsSection';
import { VisualFormActions } from './VisualFormActions';

interface VisualTemplateCreationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onCreateTemplate: () => void;
}

export const VisualTemplateCreationForm: React.FC<VisualTemplateCreationFormProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onCreateTemplate
}) => {
  const [showFlowBuilder, setShowFlowBuilder] = useState(false);

  const handleFlowSave = (nodes: Node[], edges: Edge[]) => {
    // Преобразуем граф в массив шагов
    const steps = nodes
      .filter(node => node.type === 'action')
      .map(node => {
        const nodeData = node.data as ActionNodeData;
        return {
          id: node.id,
          type: nodeData.type,
          name: nodeData.label,
          description: `Автоматически создано из визуального конструктора`,
          ...nodeData.config
        };
      });

    setFormData({
      ...formData,
      steps
    });

    setShowFlowBuilder(false);
  };

  if (showFlowBuilder) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-gray-800 border-gray-700">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white">Визуальный конструктор сценария</DialogTitle>
            <DialogDescription className="text-gray-400">
              Создайте сценарий перетаскивая блоки и соединяя их
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 pt-0">
            <ScenarioFlowBuilder onSave={handleFlowSave} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Создать новый шаблон сценария</DialogTitle>
          <DialogDescription className="text-gray-400">
            Настройте основные параметры и создайте сценарий
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <VisualBasicInfoSection 
            formData={formData}
            setFormData={setFormData}
          />

          <VisualScenarioSection
            formData={formData}
            onOpenFlowBuilder={() => setShowFlowBuilder(true)}
          />

          <VisualExecutionSettingsSection
            formData={formData}
            setFormData={setFormData}
          />

          <VisualFormActions
            onCancel={() => onOpenChange(false)}
            onCreateTemplate={onCreateTemplate}
            isDisabled={formData.steps.length === 0}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
