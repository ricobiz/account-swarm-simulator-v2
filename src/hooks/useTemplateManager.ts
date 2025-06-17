
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ScenarioTemplate = Database['public']['Tables']['scenarios']['Row'];

export interface FormData {
  name: string;
  platform: string;
  description: string;
  steps: any[];
  settings: {
    minDelay: number;
    maxDelay: number;
    retryAttempts: number;
    randomizeOrder: boolean;
    pauseBetweenAccounts: number;
  };
}

export const useTemplateManager = () => {
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const { user } = useAuth();
  const { toast } = useToast();

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

  const createTemplate = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive"
      });
      return false;
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
      resetForm();

      toast({
        title: "Успешно",
        description: `Шаблон сценария "${formData.name}" создан`
      });

      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать шаблон сценария",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTemplate = async (templateId: string) => {
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
  };

  return {
    templates,
    loading,
    refreshing,
    formData,
    setFormData,
    user,
    fetchTemplates,
    refreshTemplates,
    createTemplate,
    deleteTemplate,
    resetForm
  };
};
