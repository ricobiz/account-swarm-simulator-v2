
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Proxy {
  id: string;
  ip: string;
  port: number;
  username?: string;
  password?: string;
  country: string | null;
  status: string;
  speed: string | null;
  usage: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useProxies = () => {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProxies = async () => {
    if (!user) {
      setProxies([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching proxies for user:', user.id);
      
      const { data, error } = await supabase
        .from('proxies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching proxies:', error);
        throw error;
      }
      
      console.log('Fetched proxies:', data);
      setProxies(data || []);
    } catch (error) {
      console.error('Error fetching proxies:', error);
      setProxies([]);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить прокси",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProxy = async (proxyData: Omit<Proxy, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      console.error('No user available for adding proxy');
      return { data: null, error: 'No user logged in' };
    }

    try {
      console.log('Adding proxy:', proxyData);
      
      const { data, error } = await supabase
        .from('proxies')
        .insert([{
          ...proxyData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding proxy:', error);
        throw error;
      }
      
      console.log('Proxy added successfully:', data);
      setProxies(prev => [data, ...prev]);
      toast({
        title: "Успешно",
        description: "Прокси добавлен"
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error adding proxy:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить прокси",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateProxy = async (id: string, updates: Partial<Proxy>) => {
    try {
      console.log('Updating proxy:', id, updates);
      
      const { data, error } = await supabase
        .from('proxies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating proxy:', error);
        throw error;
      }
      
      console.log('Proxy updated successfully:', data);
      setProxies(prev => prev.map(proxy => proxy.id === id ? data : proxy));
      toast({
        title: "Успешно",
        description: "Прокси обновлен"
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating proxy:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить прокси",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteProxy = async (id: string) => {
    try {
      console.log('Deleting proxy:', id);
      
      const { error } = await supabase
        .from('proxies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting proxy:', error);
        throw error;
      }
      
      console.log('Proxy deleted successfully');
      setProxies(prev => prev.filter(proxy => proxy.id !== id));
      toast({
        title: "Успешно",
        description: "Прокси удален"
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting proxy:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить прокси",
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User available, fetching proxies');
      fetchProxies();
    } else {
      console.log('No user, clearing proxies');
      setProxies([]);
      setLoading(false);
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
