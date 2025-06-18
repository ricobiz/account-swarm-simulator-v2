
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData } from '@/hooks/useTemplateManager';

const PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'reddit', label: 'Reddit' }
];

interface VisualBasicInfoSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export const VisualBasicInfoSection: React.FC<VisualBasicInfoSectionProps> = ({
  formData,
  setFormData
}) => {
  // Ensure all platforms have valid values
  const validPlatforms = PLATFORMS.filter(platform => {
    return platform && 
           typeof platform.value === 'string' && 
           platform.value.trim().length > 0 &&
           typeof platform.label === 'string' && 
           platform.label.trim().length > 0;
  });

  console.log('VisualBasicInfoSection - Valid platforms:', validPlatforms);

  return (
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
                {validPlatforms.map((platform) => (
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
  );
};
