
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UserProfile {
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

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast({
        title: "Успешно",
        description: "Профиль обновлен"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const isTrialExpired = () => {
    if (!profile?.trial_end) return false;
    return new Date(profile.trial_end) < new Date();
  };

  const isSubscriptionActive = () => {
    return profile?.subscription_status === 'active' || 
           (profile?.subscription_status === 'trial' && !isTrialExpired());
  };

  const getDaysUntilTrialEnd = () => {
    if (!profile?.trial_end || profile.subscription_status !== 'trial') return 0;
    const trialEnd = new Date(profile.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
    isTrialExpired,
    isSubscriptionActive,
    getDaysUntilTrialEnd
  };
};
