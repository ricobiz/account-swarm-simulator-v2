
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

  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && session) {
      console.log('Auth ready, fetching templates for user:', user.id);
      fetchTemplates();
    } else {
      console.log('No auth, setting loading to false');
      setLoading(false);
    }
  }, [user, session]);

  const fetchTemplates = async () => {
    if (!user || !session) {
      console.warn('No user or session available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching templates...');
      
      // Упрощенный запрос без RLS
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('status', 'template')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Templates query result:', { data, error, userID: user.id });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Successfully fetched templates:', data?.length || 0);
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      
      let errorMessage = 'Неизвестная ошибка при загрузке шаблонов';
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Ошибка загрузки",
        description: errorMessage,
        variant: "destructive"
      });
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTemplates = async () => {
    console.log('Refreshing templates...');
    setRefreshing(true);
    await fetchTemplates();
    setRefreshing(false);
  };

  const createTemplate = async () => {
    if (!user || !session) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Creating template with data:', formData);

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
        console.error('Template creation error:', error);
        throw error;
      }

      console.log('Template created successfully:', data);
      setTemplates(prev => [data, ...prev]);
      resetForm();

      toast({
        title: "Успешно",
        description: `Шаблон "${formData.name}" создан`
      });

      return true;
    } catch (error: any) {
      console.error('Error creating template:', error);
      
      toast({
        title: "Ошибка создания",
        description: error?.message || 'Не удалось создать шаблон',
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user || !session) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Deleting template:', templateId);

      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Template deletion error:', error);
        throw error;
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: "Успешно",
        description: "Шаблон удален"
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      
      toast({
        title: "Ошибка удаления",
        description: error?.message || 'Не удалось удалить шаблон',
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
