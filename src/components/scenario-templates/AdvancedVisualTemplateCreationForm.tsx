
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData } from '@/hooks/useTemplateManager';
import { AdvancedScenarioBuilder } from '../scenario-flow/AdvancedScenarioBuilder';
import { Node, Edge } from '@xyflow/react';

const PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'reddit', label: 'Reddit' }
];

interface AdvancedVisualTemplateCreationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onCreateTemplate: () => void;
}

export const AdvancedVisualTemplateCreationForm: React.FC<AdvancedVisualTemplateCreationFormProps> = ({
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
        const nodeData = node.data;
        return {
          id: node.id,
          type: nodeData?.type || 'unknown',
          name: nodeData?.label || 'Unnamed step',
          description: `Блок: ${nodeData?.label || 'Unnamed'}`,
          ...(nodeData?.config || {})
        };
      });

    // Сохраняем также граф для возможности редактирования
    setFormData({
      ...formData,
      steps,
      flowData: { nodes, edges } // Добавляем граф данные
    });

    setShowFlowBuilder(false);
  };

  if (showFlowBuilder) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 bg-gray-800 border-gray-700">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white">Визуальный конструктор сценария</DialogTitle>
            <DialogDescription className="text-gray-400">
              Создайте сценарий перетаскивая блоки и соединяя их стрелками
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 pt-0">
            <AdvancedScenarioBuilder onSave={handleFlowSave} />
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
            Настройте основные параметры и создайте сценарий с помощью визуального конструктора
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Название шаблона</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Введите название шаблона"
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
                  placeholder="Опишите назначение шаблона"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Сценарий */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Сценарий действий</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="text-lg font-medium text-white mb-2">
                    {formData.steps.length > 0 
                      ? `Создано ${formData.steps.length} блоков сценария`
                      : 'Сценарий не создан'
                    }
                  </div>
                  <div className="text-gray-400 text-sm">
                    Используйте расширенный визуальный конструктор для создания сложных сценариев
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowFlowBuilder(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {formData.steps.length > 0 ? 'Редактировать сценарий' : 'Открыть конструктор'}
                </Button>
              </div>

              {formData.steps.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Блоки сценария:</div>
                  <div className="space-y-2">
                    {formData.steps.slice(0, 5).map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          {index + 1}
                        </span>
                        <span>{step.name}</span>
                        <span className="text-gray-500">({step.type})</span>
                      </div>
                    ))}
                    {formData.steps.length > 5 && (
                      <div className="text-gray-500 text-sm">
                        ... и еще {formData.steps.length - 5} блоков
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Настройки выполнения */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Настройки выполнения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Мин. задержка (мс)</label>
                  <Input
                    type="number"
                    value={formData.settings.minDelay}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, minDelay: parseInt(e.target.value) || 1000 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                    min="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Макс. задержка (мс)</label>
                  <Input
                    type="number"
                    value={formData.settings.maxDelay}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, maxDelay: parseInt(e.target.value) || 3000 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                    min="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button 
              onClick={onCreateTemplate} 
              className="bg-purple-500 hover:bg-purple-600"
              disabled={formData.steps.length === 0}
            >
              Создать шаблон
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
