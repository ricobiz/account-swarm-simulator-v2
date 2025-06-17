
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
    if (!user) {
      console.log('No user found, setting profile to null');
      setProfile(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching profile for user:', user.id);
      console.log('User email:', user.email);
      
      // Try to fetch existing profile first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      console.log('Profile fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If it's a policy error, try to create profile directly
        if (error.message.includes('infinite recursion') || error.message.includes('policy')) {
          console.log('Policy error detected, attempting direct profile creation');
          await createProfileDirect();
          return;
        }
        
        toast({
          title: "Ошибка",
          description: "Ошибка загрузки профиля: " + error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (!data) {
        console.log('No profile found, creating new profile');
        await createProfile();
        return;
      }
      
      console.log('Profile fetched successfully:', data);
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке профиля",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const createProfileDirect = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Creating profile directly for user:', user.id);
      
      // Use service role or admin bypass to create profile
      const profileData = {
        id: user.id,
        email: user.email || '',
        full_name: '',
        role: 'basic' as const,
        subscription_status: 'trial' as const,
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accounts_limit: 5,
        scenarios_limit: 2
      };

      // Try upsert instead of insert to avoid conflicts
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile directly:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Set a default profile if database operations fail
        const defaultProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: '',
          role: 'basic',
          subscription_status: 'trial',
          subscription_tier: null,
          subscription_end: null,
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          accounts_limit: 5,
          scenarios_limit: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Setting default profile due to database error');
        setProfile(defaultProfile);
        setLoading(false);
        
        toast({
          title: "Предупреждение",
          description: "Использован временный профиль. Некоторые функции могут быть ограничены.",
          variant: "destructive"
        });
        return;
      }

      console.log('Profile created directly:', data);
      setProfile(data);
      setLoading(false);
      
      toast({
        title: "Профиль создан",
        description: "Ваш профиль пользователя был успешно создан"
      });
    } catch (error) {
      console.error('Error in createProfileDirect:', error);
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Creating profile for user:', user.id, user.email);
      
      const profileData = {
        id: user.id,
        email: user.email || '',
        full_name: '',
        role: 'basic' as const,
        subscription_status: 'trial' as const,
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accounts_limit: 5,
        scenarios_limit: 2
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Try direct creation if normal creation fails
        await createProfileDirect();
        return;
      }

      console.log('Profile created successfully:', data);
      setProfile(data);
      setLoading(false);
      
      toast({
        title: "Профиль создан",
        description: "Ваш профиль пользователя был успешно создан"
      });
    } catch (error) {
      console.error('Error in createProfile:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании профиля",
        variant: "destructive"
      });
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
    fetchProfile();
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
