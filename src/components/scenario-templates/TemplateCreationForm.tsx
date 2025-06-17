
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StepBuilder, StepForm } from './StepBuilder';

const PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'reddit', label: 'Reddit' }
];

interface FormData {
  name: string;
  platform: string;
  description: string;
  steps: StepForm[];
  settings: {
    minDelay: number;
    maxDelay: number;
    retryAttempts: number;
  };
}

interface TemplateCreationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  currentStep: StepForm;
  setCurrentStep: (step: StepForm) => void;
  onCreateTemplate: () => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
}

export const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  currentStep,
  setCurrentStep,
  onCreateTemplate,
  onAddStep,
  onRemoveStep
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Создание шаблона сценария</DialogTitle>
          <DialogDescription className="text-gray-400">
            Настройте шаги автоматизации для выбранной платформы
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Название</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Например: Лайки Instagram"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Платформа</label>
              <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите платформу" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Описание</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Краткое описание сценария"
            />
          </div>

          <StepBuilder
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            steps={formData.steps}
            onAddStep={onAddStep}
            onRemoveStep={onRemoveStep}
          />

          <div className="flex gap-2">
            <Button 
              onClick={onCreateTemplate} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.platform || formData.steps.length === 0}
            >
              Создать шаблон
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="border-gray-600 text-gray-400">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
