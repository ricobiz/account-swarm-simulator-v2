
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
  // More robust filtering for templates
  const validTemplates = templates.filter(template => {
    const hasValidId = template.id && 
                      typeof template.id === 'string' && 
                      template.id.trim() !== '' && 
                      template.id !== 'undefined' && 
                      template.id !== 'null';
    
    const hasValidName = template.name && 
                        typeof template.name === 'string' && 
                        template.name.trim() !== '';
    
    if (!hasValidId) {
      console.warn('Template filtered out due to invalid ID:', template);
      return false;
    }
    
    if (!hasValidName) {
      console.warn('Template filtered out due to invalid name:', template);
      return false;
    }
    
    return true;
  });

  console.log('Valid templates after filtering:', validTemplates);
  
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
        ) : (
          <Select value={selectedTemplate} onValueChange={onTemplateChange}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Выберите шаблон для запуска" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {validTemplates.map((template) => {
                console.log('Rendering SelectItem with value:', template.id);
                return (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{template.name}</span>
                      <Badge variant="outline" className="text-xs">
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
