
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormData } from '@/hooks/useTemplateManager';
import { StepManager } from './StepManager';

interface ScenarioStepsSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  actionManager: React.ReactNode;
}

const ScenarioStepsSection: React.FC<ScenarioStepsSectionProps> = ({
  formData,
  setFormData,
  actionManager
}) => {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Шаги сценария</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="manual" className="text-gray-300">Создать шаги вручную</TabsTrigger>
            <TabsTrigger value="templates" className="text-gray-300">Готовые шаблоны</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <StepManager
              formData={formData}
              setFormData={setFormData}
            />
          </TabsContent>
          
          <TabsContent value="templates" className="mt-4">
            {actionManager}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScenarioStepsSection;
