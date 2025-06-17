
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getBlockTypeById } from './BlockTypes';

interface BlockConfigField {
  type: string;
  label: string;
  placeholder?: string;
  default?: any;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
}

interface BlockConfigPanelProps {
  node: Node;
  onSave: (config: Record<string, any>) => void;
  onCancel: () => void;
}

export const BlockConfigPanel: React.FC<BlockConfigPanelProps> = ({ node, onSave, onCancel }) => {
  const blockType = getBlockTypeById(node.data?.type as string);
  const [config, setConfig] = useState<Record<string, any>>(node.data?.config || {});

  if (!blockType) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <div className="text-white">Блок не найден</div>
      </div>
    );
  }

  const IconComponent = blockType.icon;

  const renderConfigField = (fieldName: string, fieldConfig: BlockConfigField) => {
    const value = config[fieldName] ?? fieldConfig.default;

    switch (fieldConfig.type) {
      case 'text':
      case 'url':
        return (
          <Input
            type={fieldConfig.type}
            value={value || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, [fieldName]: e.target.value }))}
            placeholder={fieldConfig.placeholder}
            className="bg-gray-700 border-gray-600 text-white"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, [fieldName]: e.target.value }))}
            placeholder={fieldConfig.placeholder}
            rows={3}
            className="bg-gray-700 border-gray-600 text-white"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || fieldConfig.default}
            onChange={(e) => setConfig(prev => ({ ...prev, [fieldName]: parseInt(e.target.value) || fieldConfig.default }))}
            min={fieldConfig.min}
            max={fieldConfig.max}
            className="bg-gray-700 border-gray-600 text-white"
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => setConfig(prev => ({ ...prev, [fieldName]: newValue }))}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder={`Выберите ${fieldConfig.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {fieldConfig.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, [fieldName]: checked }))}
            />
            <Label className="text-gray-300">{value ? 'Включено' : 'Выключено'}</Label>
          </div>
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, [fieldName]: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        );
    }
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-blue-400" />
            {blockType.name}
          </CardTitle>
          <p className="text-gray-400 text-sm">{blockType.description}</p>
          
          {/* Платформы */}
          <div className="flex flex-wrap gap-1 mt-2">
            {blockType.platforms.includes('all') ? (
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                Все платформы
              </span>
            ) : (
              blockType.platforms.map((platform) => (
                <span
                  key={platform}
                  className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                >
                  {platform}
                </span>
              ))
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {Object.entries(blockType.config).map(([fieldName, fieldConfig]) => (
            <div key={fieldName} className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">
                {(fieldConfig as BlockConfigField).label}
                {(fieldConfig as BlockConfigField).required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              {renderConfigField(fieldName, fieldConfig as BlockConfigField)}
            </div>
          ))}

          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <Button 
              onClick={() => onSave(config)} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Применить
            </Button>
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
