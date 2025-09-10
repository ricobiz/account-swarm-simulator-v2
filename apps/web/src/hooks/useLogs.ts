
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Log {
  id: string;
  user_id: string;
  account_id: string | null;
  scenario_id: string | null;
  action: string;
  details: string | null;
  status: string;
  created_at: string;
}

export const useLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    if (!user) {
      console.log('No user, skipping logs fetch');
      setLogs([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching logs for user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }
      
      console.log('Logs fetched successfully:', data?.length || 0);
      setLogs(data || []);
    } catch (error) {
      console.error('Error in fetchLogs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logData: Omit<Log, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) {
      console.error('No user for adding log');
      return { data: null, error: 'No authenticated user' };
    }

    try {
      console.log('Adding log:', logData);
      const { data, error } = await supabase
        .from('logs')
        .insert([{
          ...logData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding log:', error);
        return { data: null, error };
      }
      
      console.log('Log added successfully:', data);
      setLogs(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error in addLog:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    console.log('useLogs effect - User:', !!user);
    if (user) {
      fetchLogs();
    } else {
      setLogs([]);
      setLoading(false);
    }
  }, [user]);

  return {
    logs,
    loading,
    addLog,
    refetch: fetchLogs
  };
};
