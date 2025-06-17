
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
      console.log('User and session available, fetching templates for user:', user.id);
      fetchTemplates();
    } else {
      console.log('No user or session found, skipping template fetch');
      setLoading(false);
    }
  }, [user, session]);

  const fetchTemplates = async () => {
    if (!user || !session) {
      console.warn('No user or session found, skipping template fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching templates for user:', user.id);
      
      // Простой запрос без дополнительных проверок
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('status', 'template')
        .order('created_at', { ascending: false });

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Successfully fetched templates:', data?.length || 0);
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Неизвестная ошибка';
      if (error.message) {
        if (error.message.includes('infinite recursion')) {
          errorMessage = 'Проблема с политиками доступа к данным. Обратитесь к администратору.';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'Нет прав доступа к данным';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Ошибка",
        description: `Не удалось загрузить шаблоны сценариев: ${errorMessage}`,
        variant: "destructive"
      });
      setTemplates([]);
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
    if (!user || !session) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
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
        console.error('Supabase error creating template:', error);
        throw error;
      }

      console.log('Template created successfully:', data);
      setTemplates(prev => [data, ...prev]);
      resetForm();

      toast({
        title: "Успешно",
        description: `Шаблон сценария "${formData.name}" создан`
      });

      return true;
    } catch (error: any) {
      console.error('Error creating template:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      if (error.message) {
        if (error.message.includes('infinite recursion')) {
          errorMessage = 'Проблема с политиками доступа к данным';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Ошибка",
        description: `Не удалось создать шаблон сценария: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user || !session) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Deleting template:', templateId);

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
    } catch (error: any) {
      console.error('Error deleting template:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      if (error.message) {
        if (error.message.includes('infinite recursion')) {
          errorMessage = 'Проблема с политиками доступа к данным';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Ошибка",
        description: `Не удалось удалить шаблон сценария: ${errorMessage}`,
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
