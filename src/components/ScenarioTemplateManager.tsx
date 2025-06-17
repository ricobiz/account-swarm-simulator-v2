
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import TemplateCreationForm, { FormData } from './scenario-templates/TemplateCreationForm';
import { TemplateList } from './scenario-templates/TemplateList';
import { TemplateViewer } from './scenario-templates/TemplateViewer';
import { StepForm } from './scenario-templates/StepBuilder';

type ScenarioTemplate = Database['public']['Tables']['scenarios']['Row'];

const ScenarioTemplateManager = () => {
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Form data for creating templates
  const [formData, setFormData] = useState<FormData>({
    name: '',
    platform: '',
    description: '',
    steps: [],
    settings: {
      minDelay: 1000,
      maxDelay: 3000,
      retryAttempts: 2,
      randomizeOrder: false,
      pauseBetweenAccounts: 5000
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
    if (!user) {
      console.warn('No user found, skipping template fetch');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('status', 'template')
        .not('config', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
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

  const refreshTemplates = async () => {
    setRefreshing(true);
    await fetchTemplates();
    setRefreshing(false);
  };

  const validateTemplate = (data: FormData): string[] => {
    const errors = [];
    
    if (!data.name.trim()) {
      errors.push('Введите название шаблона');
    }
    
    if (!data.platform) {
      errors.push('Выберите платформу');
    }
    
    if (data.steps.length === 0) {
      errors.push('Добавьте хотя бы один шаг');
    }

    // Проверяем, что есть хотя бы один шаг навигации
    const hasNavigationStep = data.steps.some(step => step.type === 'navigate');
    if (!hasNavigationStep && data.steps.length > 0) {
      errors.push('Рекомендуется добавить шаг навигации для начала сценария');
    }

    return errors;
  };

  const handleCreateTemplate = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive"
      });
      return;
    }

    const validationErrors = validateTemplate(formData);
    if (validationErrors.length > 0) {
      toast({
        title: "Ошибка валидации",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    try {
      const templateConfig = {
        steps: formData.steps,
        settings: formData.settings,
        template_id: `template_${Date.now()}`,
        description: formData.description,
        created_by: user.id,
        version: '1.0'
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

      if (error) {
        console.error('Supabase error creating template:', error);
        throw error;
      }

      setTemplates(prev => [data, ...prev]);
      setIsCreateOpen(false);
      resetForm();

      toast({
        title: "Успешно",
        description: `Шаблон сценария "${formData.name}" создан`
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
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Supabase error deleting template:', error);
        throw error;
      }

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
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      toast({
        title: "Ошибка",
        description: stepErrors.join(', '),
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

    toast({
      title: "Шаг добавлен",
      description: `Шаг "${currentStep.name}" добавлен в сценарий`
    });
  };

  const validateStep = (step: StepForm): string[] => {
    const errors = [];
    
    if (!step.type) {
      errors.push('Выберите тип шага');
    }
    
    if (!step.name.trim()) {
      errors.push('Введите название шага');
    }

    // Дополнительная валидация в зависимости от типа
    switch (step.type) {
      case 'navigate':
        if (!step.url) {
          errors.push('Введите URL для навигации');
        }
        break;
      case 'click':
        if (!step.selector) {
          errors.push('Введите CSS селектор для клика');
        }
        break;
      case 'type':
        if (!step.selector || !step.text) {
          errors.push('Введите селектор и текст для ввода');
        }
        break;
      case 'wait':
        if (!step.minTime || !step.maxTime || step.maxTime <= step.minTime) {
          errors.push('Введите корректные значения времени ожидания');
        }
        break;
    }

    return errors;
  };

  const removeStep = (index: number) => {
    const removedStep = formData.steps[index];
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));

    toast({
      title: "Шаг удален",
      description: `Шаг "${removedStep.name}" удален из сценария`
    });
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
        retryAttempts: 2,
        randomizeOrder: false,
        pauseBetweenAccounts: 5000
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Для работы с шаблонами сценариев необходимо войти в систему</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Шаблоны сценариев</h3>
          <p className="text-gray-400">Создание и управление конфигурациями автоматизации</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={refreshTemplates}
            disabled={refreshing}
            className="border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
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
