
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type ScenarioTemplate = Database['public']['Tables']['scenarios']['Row'] & {
  template_config?: {
    steps: any[];
    settings: any;
  };
};

interface TemplateViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: ScenarioTemplate | null;
}

export const TemplateViewer: React.FC<TemplateViewerProps> = ({
  isOpen,
  onOpenChange,
  template
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

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {template.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Просмотр конфигурации шаблона сценария
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-300">Платформа:</span>
              <Badge className={`ml-2 ${getPlatformColor(template.platform)} text-white`}>
                {template.platform}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300">Шагов:</span>
              <span className="ml-2 text-white">{getStepsCount(template)}</span>
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">JSON конфигурация</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-300 bg-gray-800 p-4 rounded overflow-x-auto">
                {JSON.stringify(template.config, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
