
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { securityUtils } from '@/utils/securityUtils';

interface SecurityEvent {
  id: string;
  action: string;
  details: any;
  created_at: string;
  status: string;
  level?: string;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState({
    isSuspicious: false,
    reasons: [] as string[]
  });
  const { user } = useAuth();

  const fetchSecurityEvents = async (limit = 100) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .in('status', ['audit', 'security', 'error', 'critical'])
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      const events = data || [];
      setSecurityEvents(events);
      
      // Анализируем подозрительную активность
      const activityAnalysis = securityUtils.detectSuspiciousActivity(events);
      setSuspiciousActivity(activityAnalysis);
      
      // Логируем если обнаружена подозрительная активность
      if (activityAnalysis.isSuspicious) {
        await securityUtils.logSecurityEvent(
          'SUSPICIOUS_ACTIVITY_DETECTED',
          {
            reasons: activityAnalysis.reasons,
            eventCount: events.length,
            timeWindow: '5_minutes'
          },
          'warning',
          user.id
        );
      }
      
    } catch (error) {
      console.error('Error fetching security events:', error);
      await securityUtils.logSecurityEvent(
        'SECURITY_EVENT_FETCH_ERROR',
        { error: error.message },
        'error',
        user.id
      );
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (
    action: string, 
    details: any, 
    level: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ) => {
    if (!user) return;

    try {
      // Логируем в базу данных
      await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          action: `SECURITY: ${action}`,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          status: level === 'info' ? 'audit' : 'security'
        });

      // Также используем функцию аудита
      await securityUtils.logSecurityEvent(action, details, level, user.id);
      
      // Обновляем локальный список событий
      await fetchSecurityEvents();
      
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const validateSession = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await logSecurityEvent(
          'INVALID_SESSION_DETECTED', 
          { 
            userId: user.id,
            error: error?.message || 'No session found',
            timestamp: new Date().toISOString()
          }, 
          'warning'
        );
        return false;
      }

      // Проверяем, не истек ли токен
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await logSecurityEvent(
          'EXPIRED_SESSION_DETECTED',
          {
            userId: user.id,
            expiresAt: session.expires_at,
            currentTime: now
          },
          'warning'
        );
        return false;
      }

      return true;
    } catch (error) {
      await logSecurityEvent(
        'SESSION_VALIDATION_ERROR', 
        { 
          error: error.message,
          userId: user.id 
        }, 
        'error'
      );
      return false;
    }
  };

  const handleSecurityAlert = async (alertType: string, details: any) => {
    await logSecurityEvent(
      `SECURITY_ALERT_${alertType.toUpperCase()}`,
      details,
      'critical'
    );

    // В реальном приложении здесь можно добавить уведомления админам
    console.warn(`Security Alert [${alertType}]:`, details);
  };

  // Мониторинг в реальном времени
  useEffect(() => {
    if (user) {
      fetchSecurityEvents();
      
      // Создаем уникальный канал для мониторинга безопасности
      const channelName = `security-monitoring-${user.id}-${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'logs',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New security event:', payload);
            fetchSecurityEvents();
          }
        )
        .subscribe();

      // Периодическая проверка сессии
      const sessionCheckInterval = setInterval(async () => {
        const isValid = await validateSession();
        if (!isValid) {
          console.warn('Invalid session detected during periodic check');
        }
      }, 5 * 60 * 1000); // каждые 5 минут

      return () => {
        console.log('Unsubscribing from security channel:', channelName);
        supabase.removeChannel(channel);
        clearInterval(sessionCheckInterval);
      };
    }
  }, [user]);

  return {
    securityEvents,
    loading,
    suspiciousActivity,
    logSecurityEvent,
    validateSession,
    handleSecurityAlert,
    refetch: fetchSecurityEvents
  };
};
