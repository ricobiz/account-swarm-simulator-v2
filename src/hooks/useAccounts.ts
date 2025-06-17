
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Account {
  id: string;
  username: string;
  password: string;
  platform: string;
  status: string;
  proxy_id: string | null;
  last_action: string;
  created_at: string;
  updated_at: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          ...accountData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setAccounts(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding account:', error);
      return { data: null, error };
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating account:', error);
      return { data: null, error };
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts
  };
};
