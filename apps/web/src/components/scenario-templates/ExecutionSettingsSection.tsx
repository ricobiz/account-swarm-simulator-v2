
import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData } from '@/hooks/useTemplateManager';

interface ExecutionSettingsSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const ExecutionSettingsSection: React.FC<ExecutionSettingsSectionProps> = ({
  formData,
  setFormData
}) => {
  return (
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
  );
};

export default ExecutionSettingsSection;
