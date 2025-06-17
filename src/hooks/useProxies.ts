
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Proxy {
  id: string;
  ip: string;
  port: number;
  username?: string;
  password?: string;
  country?: string;
  status: string;
  speed?: string;
  usage: number;
  created_at: string;
  updated_at: string;
}

export const useProxies = () => {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProxies = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proxies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProxies(data || []);
    } catch (error) {
      console.error('Error fetching proxies:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProxy = async (proxyData: Omit<Proxy, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('proxies')
        .insert([{
          ...proxyData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setProxies(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding proxy:', error);
      return { data: null, error };
    }
  };

  const updateProxy = async (id: string, updates: Partial<Proxy>) => {
    try {
      const { data, error } = await supabase
        .from('proxies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProxies(prev => prev.map(proxy => proxy.id === id ? data : proxy));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating proxy:', error);
      return { data: null, error };
    }
  };

  const deleteProxy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proxies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProxies(prev => prev.filter(proxy => proxy.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting proxy:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchProxies();
    }
  }, [user]);

  return {
    proxies,
    loading,
    addProxy,
    updateProxy,
    deleteProxy,
    refetch: fetchProxies
  };
};
