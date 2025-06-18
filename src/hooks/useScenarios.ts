
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
    } finally {
      setLoading(false);
    }
  };

  const addScenario = async (scenarioData: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>) => {
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
      return { data, error: null };
    } catch (error) {
      console.error('Error in addScenario:', error);
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
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scenario:', error);
        return { data: null, error };
      }
      
      console.log('Scenario updated successfully:', data);
      setScenarios(prev => prev.map(scenario => scenario.id === id ? data : scenario));
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateScenario:', error);
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
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting scenario:', error);
        return { error };
      }
      
      console.log('Scenario deleted successfully');
      setScenarios(prev => prev.filter(scenario => scenario.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error in deleteScenario:', error);
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
