
import React, { useState } from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImprovedAdvancedScenarioBuilder } from '../scenario-flow/ImprovedAdvancedScenarioBuilder';
import { Node, Edge } from '@xyflow/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Save, X } from 'lucide-react';

const PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'reddit', label: 'Reddit' }
];

interface ImprovedAdvancedVisualTemplateCreationFormProps {
  onSave: (template: {
    name: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
  }) => void;
  onCancel: () => void;
}

export const ImprovedAdvancedVisualTemplateCreationForm: React.FC<ImprovedAdvancedVisualTemplateCreationFormProps> = ({
  onSave,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<'info' | 'builder'>('info');
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    platform: '',
    nodes: [] as Node[],
    edges: [] as Edge[]
  });
  const isMobile = useIsMobile();

  const handleFlowSave = (nodes: Node[], edges: Edge[]) => {
    setTemplateData(prev => ({ ...prev, nodes, edges }));
    setCurrentStep('info');
  };

  const handleSaveTemplate = () => {
    if (!templateData.name || !templateData.description) {
      return;
    }
    onSave(templateData);
  };

  const canSave = templateData.name && templateData.description && templateData.nodes.length > 0;

  // Полноэкранный режим для билдера
  if (currentStep === 'builder') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        {/* Шапка */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep('info')}
            className="text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к настройкам
          </Button>
          <h2 className="text-white font-medium">Конструктор сценария</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Конструктор */}
        <div className="flex-1 min-h-0">
          <ImprovedAdvancedScenarioBuilder onSave={handleFlowSave} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-h-[90vh] overflow-y-auto">
      {/* Заголовок */}
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight text-white">
          Создать новый шаблон сценария
        </h2>
        <p className="text-sm text-gray-400">
          Настройте основные параметры и создайте сценарий
        </p>
      </div>

      {/* Основная информация */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Название шаблона</label>
              <Input
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Введите название шаблона"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Платформа</label>
              <Select 
                value={templateData.platform} 
                onValueChange={(value) => setTemplateData(prev => ({ ...prev, platform: value }))}
              >
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
            <label className="text-sm font-medium text-gray-300 block mb-2">Описание</label>
            <Textarea
              value={templateData.description}
              onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
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
          <div className="text-center py-6">
            <div className="mb-4">
              <div className="text-lg font-medium text-white mb-2">
                {templateData.nodes.length > 0 
                  ? `Создано ${templateData.nodes.length} блоков сценария`
                  : 'Сценарий не создан'
                }
              </div>
              <div className="text-gray-400 text-sm mb-4">
                Используйте улучшенный визуальный конструктор с удобным интерфейсом
              </div>
            </div>
            
            <Button 
              onClick={() => setCurrentStep('builder')}
              className="bg-blue-600 hover:bg-blue-700 mb-4"
              size="lg"
            >
              {templateData.nodes.length > 0 ? 'Редактировать сценарий' : 'Создать сценарий'}
            </Button>

            {templateData.nodes.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 text-left">
                <div className="text-sm font-medium text-gray-300 mb-3">Созданные блоки:</div>
                <div className="flex flex-wrap gap-2">
                  {templateData.nodes
                    .filter(node => node.type === 'action')
                    .slice(0, 5)
                    .map((node, index) => (
                      <Badge key={node.id} variant="secondary" className="text-xs">
                        {(node.data as any)?.label || `Блок ${index + 1}`}
                      </Badge>
                    ))}
                  {templateData.nodes.filter(node => node.type === 'action').length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{templateData.nodes.filter(node => node.type === 'action').length - 5} ещё
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSaveTemplate} 
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          disabled={!canSave}
        >
          <Save className="mr-2 h-4 w-4" />
          Создать шаблон
        </Button>
      </div>
    </div>
  );
};
