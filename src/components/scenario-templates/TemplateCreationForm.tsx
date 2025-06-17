
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings } from 'lucide-react';
import { StepForm } from './StepBuilder';

export interface FormData {
  name: string;
  platform: string;
  description: string;
  steps: StepForm[];
  settings: {
    minDelay: number;
    maxDelay: number;
    retryAttempts: number;
    randomizeOrder: boolean;
    pauseBetweenAccounts: number;
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

const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({
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
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const updateSettings = (field: string, value: any) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [field]: value
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Создание шаблона сценария</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Название шаблона</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Введите название шаблона"
                  />
                </div>

                <div>
                  <Label htmlFor="platform" className="text-gray-300">Платформа</Label>
                  <Select value={formData.platform} onValueChange={(value) => updateFormData('platform', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Выберите платформу" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="reddit">Reddit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Описание шаблона сценария"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Настройки */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Настройки выполнения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Мин. задержка (мс)</Label>
                    <Input
                      type="number"
                      value={formData.settings.minDelay}
                      onChange={(e) => updateSettings('minDelay', parseInt(e.target.value) || 1000)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Макс. задержка (мс)</Label>
                    <Input
                      type="number"
                      value={formData.settings.maxDelay}
                      onChange={(e) => updateSettings('maxDelay', parseInt(e.target.value) || 3000)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Попытки повтора</Label>
                    <Input
                      type="number"
                      value={formData.settings.retryAttempts}
                      onChange={(e) => updateSettings('retryAttempts', parseInt(e.target.value) || 2)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Пауза между аккаунтами (мс)</Label>
                    <Input
                      type="number"
                      value={formData.settings.pauseBetweenAccounts}
                      onChange={(e) => updateSettings('pauseBetweenAccounts', parseInt(e.target.value) || 5000)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Шаги сценария */}
          <div className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Шаги сценария ({formData.steps.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Конструктор шага */}
                <div className="border border-gray-600 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-medium">Добавить шаг</h4>
                  
                  <Select value={currentStep.type} onValueChange={(value) => setCurrentStep({...currentStep, type: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Выберите тип шага" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="navigate">Переход по URL</SelectItem>
                      <SelectItem value="click">Клик по элементу</SelectItem>
                      <SelectItem value="type">Ввод текста</SelectItem>
                      <SelectItem value="wait">Ожидание</SelectItem>
                      <SelectItem value="scroll">Прокрутка</SelectItem>
                      <SelectItem value="screenshot">Скриншот</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={currentStep.name}
                    onChange={(e) => setCurrentStep({...currentStep, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Название шага"
                  />

                  <Textarea
                    value={currentStep.description}
                    onChange={(e) => setCurrentStep({...currentStep, description: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Описание шага"
                    rows={2}
                  />

                  {/* Дополнительные поля в зависимости от типа */}
                  {currentStep.type === 'navigate' && (
                    <Input
                      value={currentStep.url || ''}
                      onChange={(e) => setCurrentStep({...currentStep, url: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="URL для перехода"
                    />
                  )}

                  {(currentStep.type === 'click' || currentStep.type === 'type') && (
                    <Input
                      value={currentStep.selector || ''}
                      onChange={(e) => setCurrentStep({...currentStep, selector: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="CSS селектор элемента"
                    />
                  )}

                  {currentStep.type === 'type' && (
                    <Input
                      value={currentStep.text || ''}
                      onChange={(e) => setCurrentStep({...currentStep, text: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Текст для ввода"
                    />
                  )}

                  {currentStep.type === 'wait' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={currentStep.minTime || ''}
                        onChange={(e) => setCurrentStep({...currentStep, minTime: parseInt(e.target.value) || 0})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Мин. время (мс)"
                      />
                      <Input
                        type="number"
                        value={currentStep.maxTime || ''}
                        onChange={(e) => setCurrentStep({...currentStep, maxTime: parseInt(e.target.value) || 0})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Макс. время (мс)"
                      />
                    </div>
                  )}

                  <Button onClick={onAddStep} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить шаг
                  </Button>
                </div>

                {/* Список шагов */}
                <div className="space-y-2">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {step.type}
                          </Badge>
                          <span className="text-white font-medium">{step.name}</span>
                        </div>
                        {step.description && (
                          <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-900"
                        onClick={() => onRemoveStep(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {formData.steps.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <p>Шаги не добавлены</p>
                      <p className="text-sm">Добавьте шаги для создания сценария</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            Отмена
          </Button>
          <Button 
            onClick={onCreateTemplate}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!formData.name || !formData.platform || formData.steps.length === 0}
          >
            Создать шаблон
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCreationForm;
