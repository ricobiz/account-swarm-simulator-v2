
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdvancedScenarioBuilder } from '../scenario-flow/AdvancedScenarioBuilder';
import { Node, Edge } from '@xyflow/react';
import { Save } from 'lucide-react';

interface AdvancedVisualTemplateCreationFormProps {
  onSave: (template: any) => void;
  onCancel: () => void;
}

export const AdvancedVisualTemplateCreationForm: React.FC<AdvancedVisualTemplateCreationFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [scenarioNodes, setScenarioNodes] = useState<Node[]>([]);
  const [scenarioEdges, setScenarioEdges] = useState<Edge[]>([]);

  const handleSaveScenario = (nodes: Node[], edges: Edge[]) => {
    setScenarioNodes(nodes);
    setScenarioEdges(edges);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Введите название шаблона');
      return;
    }

    if (scenarioNodes.length === 0) {
      alert('Создайте сценарий перед сохранением');
      return;
    }

    const template = {
      id: `template-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      type: 'visual',
      nodes: scenarioNodes,
      edges: scenarioEdges,
      created_at: new Date().toISOString(),
    };

    onSave(template);
  };

  return (
    <div className="space-y-6">
      {/* Форма метаданных шаблона */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Создание визуального шаблона</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название шаблона
            </label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Введите название шаблона"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <Textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Опишите что делает этот шаблон"
              rows={3}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveTemplate} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Сохранить шаблон
            </Button>
            <Button onClick={onCancel} variant="outline" className="border-gray-600 text-gray-300">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Визуальный конструктор */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Конструктор сценария</CardTitle>
        </CardHeader>
        <CardContent>
          <AdvancedScenarioBuilder onSave={handleSaveScenario} />
        </CardContent>
      </Card>
    </div>
  );
};
