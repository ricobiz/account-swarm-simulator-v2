
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData } from '@/hooks/useTemplateManager';

export type { FormData } from '@/hooks/useTemplateManager';

const PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'reddit', label: 'Reddit' }
];

interface TemplateCreationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onCreateTemplate: () => void;
  actionManager: React.ReactNode;
}

const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onCreateTemplate,
  actionManager
}) => {
  // More robust validation for platforms
  const validPlatforms = PLATFORMS.filter(platform => {
    const hasValidValue = platform?.value && 
                         typeof platform.value === 'string' && 
                         platform.value.trim() !== '' && 
                         platform.value !== 'undefined' && 
                         platform.value !== 'null' &&
                         platform.value.length > 0;
    
    const hasValidLabel = platform?.label && 
                         typeof platform.label === 'string' && 
                         platform.label.trim() !== '' &&
                         platform.label.length > 0;
    
    if (!hasValidValue || !hasValidLabel) {
      console.warn('Platform filtered out:', platform);
      return false;
    }
    
    return true;
  });

  console.log('Valid platforms:', validPlatforms);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Создать новый шаблон сценария</DialogTitle>
          <DialogDescription className="text-gray-400">
            Настройте параметры и выберите готовые действия для автоматизации
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Основная информация о шаблоне */}
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
                      {validPlatforms.map((platform) => {
                        // Double check the value before rendering
                        if (!platform.value || platform.value.trim() === '') {
                          console.error('Skipping platform with invalid value:', platform);
                          return null;
                        }
                        return (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        );
                      })}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Попытки повтора</label>
                  <Input
                    type="number"
                    value={formData.settings.retryAttempts}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, retryAttempts: parseInt(e.target.value) || 2 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                    min="0"
                    max="10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Пауза между аккаунтами (мс)</label>
                  <Input
                    type="number"
                    value={formData.settings.pauseBetweenAccounts}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, pauseBetweenAccounts: parseInt(e.target.value) || 5000 }
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                    min="1000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Готовые действия */}
          {actionManager}

          {/* Кнопки действий */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={onCreateTemplate} className="bg-purple-500 hover:bg-purple-600">
              Создать шаблон
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCreationForm;
