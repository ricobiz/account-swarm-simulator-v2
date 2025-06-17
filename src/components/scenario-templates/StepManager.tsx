
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StepBuilder, StepForm } from './StepBuilder';
import { validateStep } from '@/utils/templateValidation';
import { FormData } from '@/hooks/useTemplateManager';

interface StepManagerProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export const StepManager: React.FC<StepManagerProps> = ({
  formData,
  setFormData
}) => {
  const [currentStep, setCurrentStep] = useState<StepForm>({
    type: '',
    name: '',
    description: ''
  });

  const { toast } = useToast();

  const addStep = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      toast({
        title: "Ошибка",
        description: stepErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setFormData({
      ...formData,
      steps: [...formData.steps, { ...currentStep }]
    });

    setCurrentStep({
      type: '',
      name: '',
      description: ''
    });

    toast({
      title: "Шаг добавлен",
      description: `Шаг "${currentStep.name}" добавлен в сценарий`
    });
  };

  const removeStep = (index: number) => {
    const removedStep = formData.steps[index];
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });

    toast({
      title: "Шаг удален",
      description: `Шаг "${removedStep.name}" удален из сценария`
    });
  };

  return (
    <StepBuilder
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      steps={formData.steps}
      onAddStep={addStep}
      onRemoveStep={removeStep}
    />
  );
};
