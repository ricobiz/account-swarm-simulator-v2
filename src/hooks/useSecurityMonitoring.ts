
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SecurityEvent {
  id: string;
  action: string;
  details: any;
  created_at: string;
  status: string;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSecurityEvents = async (limit = 50) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .in('status', ['audit', 'security', 'error'])
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (action: string, details: any, status: 'audit' | 'security' | 'error' = 'security') => {
    if (!user) return;

    try {
      await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          action,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          status
        });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const validateSession = async () => {
    if (!user) return false;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await logSecurityEvent('Invalid session detected', { userId: user.id }, 'security');
        return false;
      }

      return true;
    } catch (error) {
      await logSecurityEvent('Session validation error', { error: error.message }, 'error');
      return false;
    }
  };

  const checkSuspiciousActivity = () => {
    // Check for suspicious patterns in recent events
    const recentEvents = securityEvents.filter(event => 
      Date.now() - new Date(event.created_at).getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const suspiciousPatterns = {
      multipleFailedLogins: recentEvents.filter(e => 
        e.action.includes('login') && e.status === 'error'
      ).length > 3,
      
      rapidApiCalls: recentEvents.length > 20,
      
      unauthorizedAccess: recentEvents.filter(e => 
        e.action.includes('UNAUTHORIZED')
      ).length > 0
    };

    return suspiciousPatterns;
  };

  useEffect(() => {
    if (user) {
      fetchSecurityEvents();
      
      // Set up real-time monitoring
      const channel = supabase
        .channel('security-monitoring')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'logs',
            filter: 'status=in.(audit,security,error)'
          },
          () => {
            fetchSecurityEvents();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    securityEvents,
    loading,
    logSecurityEvent,
    validateSession,
    checkSuspiciousActivity,
    refetch: fetchSecurityEvents
  };
};
