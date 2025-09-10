
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Scenario {
  id: string;
  name: string;
  platform: string;
  status: string;
  accounts_count: number;
  progress: number;
  next_run: string | null;
  config: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useScenarios = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScenarios = async () => {
    if (!user) {
      console.log('No user, skipping scenarios fetch');
      setScenarios([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching scenarios for user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching scenarios:', error);
        throw error;
      }
      
      console.log('Scenarios fetched successfully:', data?.length || 0);
      setScenarios(data || []);
    } catch (error) {
      console.error('Error in fetchScenarios:', error);
      setScenarios([]);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сценарии",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addScenario = async (scenarioData: Omit<Scenario, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      console.error('No user for adding scenario');
      return { data: null, error: { message: 'No authenticated user' } };
    }

    try {
      console.log('Adding scenario:', scenarioData);
      const { data, error } = await supabase
        .from('scenarios')
        .insert([{
          ...scenarioData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding scenario:', error);
        return { data: null, error };
      }
      
      console.log('Scenario added successfully:', data);
      setScenarios(prev => [data, ...prev]);
      toast({
        title: "Успешно",
        description: "Сценарий добавлен"
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error in addScenario:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сценарий",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateScenario = async (id: string, updates: Partial<Scenario>) => {
    if (!user) {
      console.error('No user for updating scenario');
      return { data: null, error: { message: 'No authenticated user' } };
    }

    try {
      console.log('Updating scenario:', id, updates);
      const { data, error } = await supabase
        .from('scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scenario:', error);
        return { data: null, error };
      }
      
      console.log('Scenario updated successfully:', data);
      setScenarios(prev => prev.map(scenario => scenario.id === id ? data : scenario));
      toast({
        title: "Успешно",
        description: "Сценарий обновлен"
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateScenario:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить сценарий",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteScenario = async (id: string) => {
    if (!user) {
      console.error('No user for deleting scenario');
      return { error: { message: 'No authenticated user' } };
    }

    try {
      console.log('Deleting scenario:', id);
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting scenario:', error);
        return { error };
      }
      
      console.log('Scenario deleted successfully');
      setScenarios(prev => prev.filter(scenario => scenario.id !== id));
      toast({
        title: "Успешно",
        description: "Сценарий удален"
      });
      return { error: null };
    } catch (error) {
      console.error('Error in deleteScenario:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сценарий",
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    console.log('useScenarios effect - User:', !!user);
    if (user) {
      fetchScenarios();
    } else {
      setScenarios([]);
      setLoading(false);
    }
  }, [user]);

  return {
    scenarios,
    loading,
    addScenario,
    updateScenario,
    deleteScenario,
    refetch: fetchScenarios
  };
};
