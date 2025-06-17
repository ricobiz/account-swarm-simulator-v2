
import React, { useState } from 'react';
import { useTemplateManager } from '@/hooks/useTemplateManager';
import { useToast } from '@/hooks/use-toast';
import { validateTemplate } from '@/utils/templateValidation';
import type { Database } from '@/integrations/supabase/types';
import { VisualTemplateCreationForm } from './scenario-templates/VisualTemplateCreationForm';
import { TemplateList } from './scenario-templates/TemplateList';
import { TemplateViewer } from './scenario-templates/TemplateViewer';
import { TemplateActions } from './scenario-templates/TemplateActions';
import { Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ScenarioTemplate = Database['public']['Tables']['scenarios']['Row'];

const ScenarioTemplateManager = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);
  
  const {
    templates,
    loading,
    refreshing,
    formData,
    setFormData,
    user,
    refreshTemplates,
    createTemplate,
    deleteTemplate,
    resetForm
  } = useTemplateManager();

  const { toast } = useToast();

  console.log('ScenarioTemplateManager state:', {
    loading,
    templatesCount: templates.length,
    userExists: !!user,
    userId: user?.id,
    refreshing
  });

  const handleCreateTemplate = async () => {
    const validationErrors = validateTemplate(formData);
    if (validationErrors.length > 0) {
      toast({
        title: "Ошибка валидации",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    const success = await createTemplate();
    if (success) {
      setIsCreateOpen(false);
    }
  };

  const handleViewTemplate = (template: ScenarioTemplate) => {
    setSelectedTemplate(template);
    setIsViewOpen(true);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Загрузка шаблонов...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Необходима авторизация</h3>
        <p className="text-gray-400 mb-4">
          Для работы с шаблонами сценариев войдите в систему
        </p>
        <p className="text-gray-500 text-sm">
          После авторизации вы сможете создавать и управлять шаблонами
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TemplateActions
        refreshing={refreshing}
        onRefresh={refreshTemplates}
        onCreateNew={handleCreateNew}
      />

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-2">Нет шаблонов</h3>
            <p className="text-gray-400 text-sm mb-4">
              У вас пока нет созданных шаблонов сценариев
            </p>
            <Button 
              onClick={handleCreateNew}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Создать первый шаблон
            </Button>
          </div>
        </div>
      ) : (
        <TemplateList
          templates={templates}
          onViewTemplate={handleViewTemplate}
          onDeleteTemplate={deleteTemplate}
        />
      )}

      <VisualTemplateCreationForm
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        formData={formData}
        setFormData={setFormData}
        onCreateTemplate={handleCreateTemplate}
      />

      <TemplateViewer
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        template={selectedTemplate}
      />
    </div>
  );
};

export default ScenarioTemplateManager;
