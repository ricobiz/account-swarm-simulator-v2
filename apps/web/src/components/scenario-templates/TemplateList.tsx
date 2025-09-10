
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ScenarioTemplate = Database['public']['Tables']['scenarios']['Row'] & {
  template_config?: {
    steps: any[];
    settings: any;
  };
};

interface TemplateListProps {
  templates: ScenarioTemplate[];
  onViewTemplate: (template: ScenarioTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onViewTemplate,
  onDeleteTemplate
}) => {
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      telegram: 'bg-blue-500',
      tiktok: 'bg-black',
      youtube: 'bg-red-500',
      instagram: 'bg-pink-500',
      twitter: 'bg-blue-400',
      reddit: 'bg-orange-500'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const getStepsCount = (template: ScenarioTemplate) => {
    if (template.config && typeof template.config === 'object' && 'steps' in template.config) {
      return (template.config as any).steps?.length || 0;
    }
    return 0;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Название</TableHead>
              <TableHead className="text-gray-300">Платформа</TableHead>
              <TableHead className="text-gray-300">Шагов</TableHead>
              <TableHead className="text-gray-300">Статус</TableHead>
              <TableHead className="text-gray-300">Создан</TableHead>
              <TableHead className="text-gray-300">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} className="border-gray-700">
                <TableCell>
                  <div>
                    <div className="text-white font-medium">{template.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getPlatformColor(template.platform)} text-white`}>
                    {template.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-300">{getStepsCount(template)}</TableCell>
                <TableCell>
                  <Badge variant="default">
                    Шаблон
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-300">
                  {new Date(template.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-500/20"
                      onClick={() => onViewTemplate(template)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900"
                      onClick={() => onDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
