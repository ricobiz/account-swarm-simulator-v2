
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface StepForm {
  type: string;
  name: string;
  description: string;
  selector?: string;
  url?: string;
  text?: string;
  minTime?: number;
  maxTime?: number;
  title?: string;
  content?: string;
  [key: string]: any;
}

const STEP_TYPES = [
  { value: 'navigate', label: 'Переход на страницу', fields: ['url'], description: 'Переходит по указанному URL' },
  { value: 'click', label: 'Клик по элементу', fields: ['selector'], description: 'Кликает по элементу на странице' },
  { value: 'type', label: 'Ввод текста', fields: ['selector', 'text'], description: 'Вводит текст в поле ввода' },
  { value: 'scroll', label: 'Скроллинг', fields: [], description: 'Прокручивает страницу вниз' },
  { value: 'wait', label: 'Ожидание', fields: ['minTime', 'maxTime'], description: 'Случайная пауза между действиями' },
  { value: 'random_interaction', label: 'Случайное взаимодействие', fields: [], description: 'Выполняет случайные действия на странице' },
  { value: 'submit_post', label: 'Отправить пост (Reddit)', fields: ['title', 'content'], description: 'Создает пост на Reddit' },
  { value: 'comment', label: 'Комментарий', fields: ['text'], description: 'Оставляет комментарий' }
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

  const getCurrentStepInfo = () => {
    return STEP_TYPES.find(t => t.value === currentStep.type);
  };

  const validateCurrentStep = () => {
    const errors = [];
    
    if (!currentStep.type) {
      errors.push('Выберите тип шага');
    }
    
    if (!currentStep.name.trim()) {
      errors.push('Введите название шага');
    }

    const requiredFields = getCurrentStepFields();
    requiredFields.forEach(field => {
      if (!currentStep[field] || (typeof currentStep[field] === 'string' && !currentStep[field].trim())) {
        const labels: Record<string, string> = {
          url: 'URL',
          selector: 'CSS селектор',
          text: 'Текст',
          minTime: 'Минимальное время',
          maxTime: 'Максимальное время',
          title: 'Заголовок',
          content: 'Содержание'
        };
        errors.push(`Заполните поле "${labels[field] || field}"`);
      }
    });

    // Дополнительная валидация для времени ожидания
    if (currentStep.type === 'wait') {
      const minTime = Number(currentStep.minTime);
      const maxTime = Number(currentStep.maxTime);
      
      if (minTime <= 0) {
        errors.push('Минимальное время должно быть больше 0');
      }
      
      if (maxTime <= minTime) {
        errors.push('Максимальное время должно быть больше минимального');
      }
    }

    // Валидация URL
    if (currentStep.type === 'navigate' && currentStep.url) {
      try {
        new URL(currentStep.url);
      } catch {
        errors.push('Введите корректный URL (например: https://example.com)');
      }
    }

    return errors;
  };

  const renderFieldInput = (field: string) => {
    const fieldLabels: Record<string, string> = {
      url: 'URL адрес',
      selector: 'CSS селектор',
      text: 'Текст',
      minTime: 'Мин. время (мс)',
      maxTime: 'Макс. время (мс)',
      title: 'Заголовок поста',
      content: 'Содержание поста'
    };

    const fieldPlaceholders: Record<string, string> = {
      url: 'https://example.com',
      selector: '.button, #element, input[name="search"]',
      text: 'Текст для ввода или комментария',
      minTime: '1000',
      maxTime: '3000',
      title: 'Заголовок поста',
      content: 'Содержание поста или комментария'
    };

    const fieldDescriptions: Record<string, string> = {
      selector: 'CSS селектор элемента (класс, ID или атрибут)',
      url: 'Полный URL адрес страницы',
      text: 'Текст который будет введен',
      minTime: 'Минимальное время ожидания в миллисекундах',
      maxTime: 'Максимальное время ожидания в миллисекундах',
      title: 'Заголовок создаваемого поста',
      content: 'Основной текст поста или комментария'
    };

    if (field === 'content') {
      return (
        <div key={field} className="space-y-1">
          <label className="text-sm font-medium text-gray-300">{fieldLabels[field]}</label>
          <Textarea
            value={currentStep[field] || ''}
            onChange={(e) => setCurrentStep({ ...currentStep, [field]: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            placeholder={fieldPlaceholders[field]}
            rows={3}
          />
          <p className="text-xs text-gray-500">{fieldDescriptions[field]}</p>
        </div>
      );
    }

    return (
      <div key={field} className="space-y-1">
        <label className="text-sm font-medium text-gray-300">{fieldLabels[field]}</label>
        <Input
          type={field === 'minTime' || field === 'maxTime' ? 'number' : 'text'}
          value={currentStep[field] || ''}
          onChange={(e) => {
            const value = field === 'minTime' || field === 'maxTime' 
              ? parseInt(e.target.value) || 0
              : e.target.value;
            setCurrentStep({ ...currentStep, [field]: value });
          }}
          className="bg-gray-700 border-gray-600 text-white"
          placeholder={fieldPlaceholders[field]}
          min={field === 'minTime' || field === 'maxTime' ? '1' : undefined}
        />
        <p className="text-xs text-gray-500">{fieldDescriptions[field]}</p>
      </div>
    );
  };

  const handleAddStep = () => {
    const errors = validateCurrentStep();
    if (errors.length === 0) {
      onAddStep();
    }
  };

  const stepErrors = validateCurrentStep();
  const stepInfo = getCurrentStepInfo();

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Добавить шаг</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Тип шага</label>
              <Select value={currentStep.type} onValueChange={(value) => setCurrentStep({ ...currentStep, type: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите тип действия" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {STEP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-gray-400">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stepInfo && (
                <p className="text-xs text-gray-500 mt-1">{stepInfo.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Название шага</label>
              <Input
                value={currentStep.name}
                onChange={(e) => setCurrentStep({ ...currentStep, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Краткое название действия"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Описание (опционально)</label>
              <Input
                value={currentStep.description}
                onChange={(e) => setCurrentStep({ ...currentStep, description: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Подробное описание"
              />
            </div>
          </div>

          {/* Динамические поля на основе типа шага */}
          {getCurrentStepFields().length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Параметры шага</h4>
              <div className="grid grid-cols-1 gap-4">
                {getCurrentStepFields().map(renderFieldInput)}
              </div>
            </div>
          )}

          {/* Показываем ошибки валидации */}
          {stepErrors.length > 0 && (
            <Alert className="border-red-600 bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                <div className="space-y-1">
                  {stepErrors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleAddStep} 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={stepErrors.length > 0}
          >
            Добавить шаг
          </Button>
        </CardContent>
      </Card>

      {/* Список добавленных шагов */}
      {steps.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Шаги сценария ({steps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start justify-between bg-gray-800 p-4 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                        {index + 1}
                      </span>
                      <span className="text-white font-medium">{step.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {STEP_TYPES.find(t => t.value === step.type)?.label || step.type}
                      </span>
                    </div>
                    
                    {step.description && (
                      <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                    )}
                    
                    <div className="space-y-1 text-xs">
                      {step.url && (
                        <div className="text-gray-500">
                          <span className="text-gray-400">URL:</span> {step.url}
                        </div>
                      )}
                      {step.selector && (
                        <div className="text-gray-500">
                          <span className="text-gray-400">Селектор:</span> {step.selector}
                        </div>
                      )}
                      {step.text && (
                        <div className="text-gray-500">
                          <span className="text-gray-400">Текст:</span> {step.text.length > 50 ? step.text.substring(0, 50) + '...' : step.text}
                        </div>
                      )}
                      {step.title && (
                        <div className="text-gray-500">
                          <span className="text-gray-400">Заголовок:</span> {step.title}
                        </div>
                      )}
                      {step.minTime && step.maxTime && (
                        <div className="text-gray-500">
                          <span className="text-gray-400">Ожидание:</span> {step.minTime}-{step.maxTime}мс
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => onRemoveStep(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900 ml-4"
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
