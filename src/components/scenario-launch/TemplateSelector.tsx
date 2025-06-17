
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';

interface ScenarioTemplate {
  id: string;
  name: string;
  platform: string;
  config?: {
    steps: any[];
    settings: any;
  } | null;
}

interface TemplateSelectorProps {
  templates: ScenarioTemplate[];
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  loading: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateChange,
  loading
}) => {
  // Более строгая фильтрация шаблонов с валидными данными
  const validTemplates = templates.filter(template => {
    const hasValidId = template?.id && 
                      typeof template.id === 'string' && 
                      template.id.trim() !== '' && 
                      template.id !== 'undefined' && 
                      template.id !== 'null' &&
                      template.id.length > 0;
    
    const hasValidName = template?.name && 
                        typeof template.name === 'string' && 
                        template.name.trim() !== '' &&
                        template.name.length > 0;
    
    // Дополнительная проверка на платформу
    const hasValidPlatform = template?.platform && 
                            typeof template.platform === 'string' && 
                            template.platform.trim() !== '';
    
    if (!hasValidId) {
      console.warn('Template filtered out due to invalid ID:', template);
      return false;
    }
    
    if (!hasValidName) {
      console.warn('Template filtered out due to invalid name:', template);
      return false;
    }
    
    if (!hasValidPlatform) {
      console.warn('Template filtered out due to invalid platform:', template);
      return false;
    }
    
    return true;
  });

  console.log('Valid templates after filtering:', validTemplates);
  console.log('Selected template value:', selectedTemplate);
  
  const selectedTemplateData = validTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Выберите шаблон сценария
        </label>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Загрузка шаблонов...
          </div>
        ) : validTemplates.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-sm mb-2">
              Нет доступных шаблонов для запуска
            </div>
            <div className="text-gray-500 text-xs">
              Создайте шаблон сценария в разделе "Сценарии"
            </div>
          </div>
        ) : (
          <Select value={selectedTemplate} onValueChange={onTemplateChange}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Выберите шаблон для запуска" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
              {validTemplates.map((template) => {
                // Double check the value before rendering - this is the key fix
                if (!template.id || template.id.trim() === '') {
                  console.error('Skipping template with invalid ID:', template);
                  return null;
                }
                console.log('Rendering SelectItem with value:', template.id);
                return (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2 w-full">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate flex-1">{template.name}</span>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {template.platform}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedTemplate && selectedTemplateData && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-300">
            <div className="font-medium text-white mb-1">{selectedTemplateData.name}</div>
            <div>Платформа: {selectedTemplateData.platform}</div>
            <div>Шагов в сценарии: {selectedTemplateData.config?.steps?.length || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
