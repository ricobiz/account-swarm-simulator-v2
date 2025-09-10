
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData } from '@/hooks/useTemplateManager';

interface VisualScenarioSectionProps {
  formData: FormData;
  onOpenFlowBuilder: () => void;
}

export const VisualScenarioSection: React.FC<VisualScenarioSectionProps> = ({
  formData,
  onOpenFlowBuilder
}) => {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Сценарий действий</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="text-lg font-medium text-white mb-2">
              {formData.steps.length > 0 
                ? `Создано ${formData.steps.length} шагов сценария`
                : 'Сценарий не создан'
              }
            </div>
            <div className="text-gray-400 text-sm">
              Используйте визуальный конструктор для создания логики сценария
            </div>
          </div>
          
          <Button 
            onClick={onOpenFlowBuilder}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {formData.steps.length > 0 ? 'Редактировать сценарий' : 'Создать сценарий'}
          </Button>
        </div>

        {formData.steps.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-300 mb-2">Шаги сценария:</div>
            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    {index + 1}
                  </span>
                  <span>{step.name}</span>
                  <span className="text-gray-500">({step.type})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
