
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { TemplateCreationForm } from './scenario-templates/TemplateCreationForm';
import { TemplateList } from './scenario-templates/TemplateList';
import { TemplateViewer } from './scenario-templates/TemplateViewer';
import { StepForm } from './scenario-templates/StepBuilder';

type ScenarioTemplate = Database['public']['Tables']['scenarios']['Row'] & {
  template_config?: {
    steps: any[];
    settings: any;
  };
};

const ScenarioTemplateManager = () => {
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Form data for creating/editing templates
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    description: '',
    steps: [] as StepForm[],
    settings: {
      minDelay: 1000,
      maxDelay: 3000,
      retryAttempts: 2
    }
  });

  const [currentStep, setCurrentStep] = useState<StepForm>({
    type: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Fetch scenarios that have JSON config (template scenarios)
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .not('config', 'is', null)
        .eq('status', 'template')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить шаблоны сценариев",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user) return;

    try {
      const templateConfig = {
        steps: formData.steps,
        settings: formData.settings,
        template_id: `template_${Date.now()}`
      };

      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          user_id: user.id,
          name: formData.name,
          platform: formData.platform,
          status: 'template',
          config: templateConfig as any
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      setIsCreateOpen(false);
      resetForm();

      toast({
        title: "Успешно",
        description: "Шаблон сценария создан"
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать шаблон сценария",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: "Успешно",
        description: "Шаблон сценария удален"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить шаблон сценария",
        variant: "destructive"
      });
    }
  };

  const addStep = () => {
    if (!currentStep.type || !currentStep.name) {
      toast({
        title: "Ошибка",
        description: "Заполните тип и название шага",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { ...currentStep }]
    }));

    setCurrentStep({
      type: '',
      name: '',
      description: ''
    });
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      platform: '',
      description: '',
      steps: [],
      settings: {
        minDelay: 1000,
        maxDelay: 3000,
        retryAttempts: 2
      }
    });
    setCurrentStep({
      type: '',
      name: '',
      description: ''
    });
  };

  const handleViewTemplate = (template: ScenarioTemplate) => {
    setSelectedTemplate(template);
    setIsViewOpen(true);
  };

  if (loading) {
    return <div className="text-white">Загрузка шаблонов сценариев...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Шаблоны сценариев</h3>
          <p className="text-gray-400">Создание и управление JSON-конфигурациями сценариев</p>
        </div>
        <Button 
          className="bg-purple-500 hover:bg-purple-600" 
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Создать шаблон
        </Button>
      </div>

      <TemplateList
        templates={templates}
        onViewTemplate={handleViewTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      <TemplateCreationForm
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        formData={formData}
        setFormData={setFormData}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onCreateTemplate={handleCreateTemplate}
        onAddStep={addStep}
        onRemoveStep={removeStep}
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
