
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface AdminUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'premium' | 'basic';
  subscription_status: 'active' | 'inactive' | 'trial' | 'expired';
  subscription_tier: string | null;
  subscription_end: string | null;
  trial_end: string | null;
  accounts_limit: number;
  scenarios_limit: number;
  created_at: string;
  updated_at: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'premium' | 'basic') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === userId ? data : u));
      
      toast({
        title: "Успешно",
        description: `Роль пользователя изменена на ${newRole}`
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить роль пользователя",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateUserLimits = async (userId: string, accountsLimit: number, scenariosLimit: number) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          accounts_limit: accountsLimit,
          scenarios_limit: scenariosLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === userId ? data : u));
      
      toast({
        title: "Успешно",
        description: "Лимиты пользователя обновлены"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user limits:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить лимиты пользователя",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    updateUserRole,
    updateUserLimits,
    refetch: fetchUsers
  };
};
