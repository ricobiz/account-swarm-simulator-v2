
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

export interface StepForm {
  type: string;
  name: string;
  description: string;
  selector?: string;
  url?: string;
  text?: string;
  minTime?: number;
  maxTime?: number;
  [key: string]: any; // Add index signature for Json compatibility
}

const STEP_TYPES = [
  { value: 'navigate', label: 'Переход на страницу', fields: ['url'] },
  { value: 'click', label: 'Клик по элементу', fields: ['selector'] },
  { value: 'type', label: 'Ввод текста', fields: ['selector', 'text'] },
  { value: 'scroll', label: 'Скроллинг', fields: [] },
  { value: 'wait', label: 'Ожидание', fields: ['minTime', 'maxTime'] },
  { value: 'random_interaction', label: 'Случайное взаимодействие', fields: [] },
  { value: 'submit_post', label: 'Отправить пост (Reddit)', fields: ['title', 'content'] },
  { value: 'comment', label: 'Комментарий', fields: ['text'] }
];

interface StepBuilderProps {
  currentStep: StepForm;
  setCurrentStep: (step: StepForm) => void;
  steps: StepForm[];
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
}

export const StepBuilder: React.FC<StepBuilderProps> = ({
  currentStep,
  setCurrentStep,
  steps,
  onAddStep,
  onRemoveStep
}) => {
  const getCurrentStepFields = () => {
    const stepType = STEP_TYPES.find(t => t.value === currentStep.type);
    return stepType?.fields || [];
  };

  return (
    <div className="space-y-6">
      {/* Add steps section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Добавить шаг</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Тип шага</label>
              <Select value={currentStep.type} onValueChange={(value) => setCurrentStep({ ...currentStep, type: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {STEP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Название</label>
              <Input
                value={currentStep.name}
                onChange={(e) => setCurrentStep({ ...currentStep, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Название шага"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Описание</label>
              <Input
                value={currentStep.description}
                onChange={(e) => setCurrentStep({ ...currentStep, description: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Описание"
              />
            </div>
          </div>

          {/* Dynamic fields based on step type */}
          {getCurrentStepFields().length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {getCurrentStepFields().map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-300 capitalize">{field}</label>
                  {field === 'minTime' || field === 'maxTime' ? (
                    <Input
                      type="number"
                      value={currentStep[field] || ''}
                      onChange={(e) => setCurrentStep({ ...currentStep, [field]: parseInt(e.target.value) })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder={field === 'minTime' ? 'Мин. время (мс)' : 'Макс. время (мс)'}
                    />
                  ) : (
                    <Input
                      value={currentStep[field] || ''}
                      onChange={(e) => setCurrentStep({ ...currentStep, [field]: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder={field === 'selector' ? 'CSS селектор' : field === 'url' ? 'https://...' : 'Текст для ввода'}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <Button onClick={onAddStep} className="bg-blue-500 hover:bg-blue-600">
            Добавить шаг
          </Button>
        </CardContent>
      </Card>

      {/* List of added steps */}
      {steps.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Шаги сценария ({steps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                  <div>
                    <span className="text-white font-medium">{index + 1}. {step.name}</span>
                    <p className="text-sm text-gray-400">{step.type} - {step.description}</p>
                  </div>
                  <Button
                    onClick={() => onRemoveStep(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
