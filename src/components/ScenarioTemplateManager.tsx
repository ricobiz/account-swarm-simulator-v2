
import React, { useState } from 'react';
import { useTemplateManager } from '@/hooks/useTemplateManager';
import { useToast } from '@/hooks/use-toast';
import { validateTemplate } from '@/utils/templateValidation';
import type { Database } from '@/integrations/supabase/types';
import TemplateCreationForm from './scenario-templates/TemplateCreationForm';
import { TemplateList } from './scenario-templates/TemplateList';
import { TemplateViewer } from './scenario-templates/TemplateViewer';
import { TemplateActions } from './scenario-templates/TemplateActions';
import { TemplateActionManager } from './scenario-templates/TemplateActionManager';

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

  console.log('ScenarioTemplateManager render state:', {
    loading,
    templatesCount: templates.length,
    user: user?.id,
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
        <div className="text-white">Загрузка шаблонов сценариев...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Для работы с шаблонами сценариев необходимо войти в систему</p>
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
          <p className="text-white mb-2">У вас пока нет шаблонов сценариев</p>
          <p className="text-gray-400 text-sm">Создайте свой первый шаблон, нажав кнопку "Создать шаблон"</p>
        </div>
      ) : (
        <TemplateList
          templates={templates}
          onViewTemplate={handleViewTemplate}
          onDeleteTemplate={deleteTemplate}
        />
      )}

      <TemplateCreationForm
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        formData={formData}
        setFormData={setFormData}
        onCreateTemplate={handleCreateTemplate}
        actionManager={
          <TemplateActionManager
            formData={formData}
            setFormData={setFormData}
          />
        }
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
