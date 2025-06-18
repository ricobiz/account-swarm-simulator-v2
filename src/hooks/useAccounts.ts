
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
    if (!user) {
      console.log('No user, skipping accounts fetch');
      setAccounts([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching accounts for user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching accounts:', error);
        throw error;
      }
      
      console.log('Accounts fetched successfully:', data?.length || 0);
      setAccounts(data || []);
    } catch (error) {
      console.error('Error in fetchAccounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      console.error('No user for adding account');
      return { data: null, error: { message: 'No authenticated user' } };
    }

    try {
      console.log('Adding account:', { ...accountData, password: '[HIDDEN]' });
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          ...accountData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding account:', error);
        return { data: null, error };
      }
      
      console.log('Account added successfully:', { ...data, password: '[HIDDEN]' });
      setAccounts(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error in addAccount:', error);
      return { data: null, error };
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!user) {
      console.error('No user for updating account');
      return { data: null, error: { message: 'No authenticated user' } };
    }

    try {
      console.log('Updating account:', id, { ...updates, password: updates.password ? '[HIDDEN]' : undefined });
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating account:', error);
        return { data: null, error };
      }
      
      console.log('Account updated successfully:', { ...data, password: '[HIDDEN]' });
      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateAccount:', error);
      return { data: null, error };
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) {
      console.error('No user for deleting account');
      return { error: { message: 'No authenticated user' } };
    }

    try {
      console.log('Deleting account:', id);
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting account:', error);
        return { error };
      }
      
      console.log('Account deleted successfully');
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      return { error };
    }
  };

  useEffect(() => {
    console.log('useAccounts effect - User:', !!user);
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
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
