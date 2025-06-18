
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
  accounts?: {
    username: string;
    platform: string;
  };
  scenarios?: {
    name: string;
  };
}

export const useLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async (filters?: {
    accountId?: string;
    scenarioId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('logs')
        .select(`
          *,
          accounts (username, platform),
          scenarios (name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId);
      }
      
      if (filters?.scenarioId) {
        query = query.eq('scenario_id', filters.scenarioId);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logData: {
    account_id?: string;
    scenario_id?: string;
    action: string;
    details?: string;
    status?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('logs')
        .insert([{
          ...logData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setLogs(prev => [data, ...prev.slice(0, 99)]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding log:', error);
      return { data: null, error };
    }
  };

  const exportToCsv = (filteredLogs: Log[]) => {
    const headers = ['Дата', 'Действие', 'Аккаунт', 'Сценарий', 'Статус', 'Детали'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString('ru-RU'),
        log.action,
        log.accounts ? `${log.accounts.username} (${log.accounts.platform})` : '-',
        log.scenarios?.name || '-',
        log.status,
        log.details || '-'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
      
      // Создаем уникальный канал для каждого экземпляра хука
      const channelName = `logs-updates-${user.id}-${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'logs'
          },
          (payload) => {
            console.log('New log:', payload);
            fetchLogs(); // Refresh logs when new one is added
          }
        )
        .subscribe();

      return () => {
        console.log('Unsubscribing from channel:', channelName);
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    logs,
    loading,
    addLog,
    fetchLogs,
    exportToCsv
  };
};
