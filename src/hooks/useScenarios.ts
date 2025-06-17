import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Scenario {
  id: string;
  name: string;
  platform: string;
  status: string;
  accounts_count: number;
  progress: number;
  next_run: string | null;
  config: any;
  created_at: string;
  updated_at: string;
}

export const useScenarios = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchScenarios = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setScenarios(data || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const addScenario = async (scenarioData: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert([{
          ...scenarioData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setScenarios(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding scenario:', error);
      return { data: null, error };
    }
  };

  const updateScenario = async (id: string, updates: Partial<Scenario>) => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setScenarios(prev => prev.map(scenario => scenario.id === id ? data : scenario));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating scenario:', error);
      return { data: null, error };
    }
  };

  const deleteScenario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setScenarios(prev => prev.filter(scenario => scenario.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting scenario:', error);
      return { error };
    }
  };

  const executeScenarioWithRPA = async (scenarioId: string): Promise<boolean> => {
    try {
      // Получаем сценарий
      const { data: scenario, error: scenarioError } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single();

      if (scenarioError) {
        console.error('Ошибка получения сценария:', scenarioError);
        return false;
      }

      // Проверяем конфигурацию на наличие RPA блоков
      const config = scenario.config as any;
      if (!config?.flowData?.nodes) {
        return false;
      }

      const rpaBlocks = config.flowData.nodes.filter((node: any) => 
        node.data?.config?.executeViaRPA === true
      );

      console.log(`Найдено ${rpaBlocks.length} RPA блоков в сценарии ${scenarioId}`);

      // Обновляем статус сценария
      await updateScenario(scenarioId, { status: 'running', progress: 0 });

      return true;
    } catch (error) {
      console.error('Ошибка выполнения сценария с RPA:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchScenarios();
    }
  }, [user]);

  return {
    scenarios,
    loading,
    addScenario,
    updateScenario,
    deleteScenario,
    executeScenarioWithRPA,
    refetch: fetchScenarios
  };
};
