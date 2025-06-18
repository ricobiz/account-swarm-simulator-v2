
import React, { useState, useEffect, createContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { securityUtils } from '@/utils/securityUtils';
import { authUtils } from '@/utils/authUtils';
import { AuthContextType } from '@/hooks/authTypes';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Auth provider initializing...');
    
    // Проверяем существующую сессию сначала
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', !!session, error ? 'Error:' + error.message : 'No error');
        
        if (session) {
          setSession(session);
          setUser(session.user);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Устанавливаем слушатель изменений состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', !!session, 'User:', !!session?.user);
        
        // Обновляем состояние синхронно
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Логируем события аутентификации для безопасности (асинхронно)
        setTimeout(async () => {
          try {
            if (event === 'SIGNED_IN' && session?.user) {
              await securityUtils.logSecurityEvent(
                'USER_SIGNED_IN',
                {
                  userId: session.user.id,
                  email: session.user.email,
                  timestamp: new Date().toISOString(),
                  provider: session.user.app_metadata?.provider || 'email'
                },
                'info',
                session.user.id
              );
            } else if (event === 'SIGNED_OUT') {
              await securityUtils.logSecurityEvent(
                'USER_SIGNED_OUT',
                {
                  timestamp: new Date().toISOString()
                },
                'info'
              );
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              await securityUtils.logSecurityEvent(
                'TOKEN_REFRESHED',
                {
                  userId: session.user.id,
                  timestamp: new Date().toISOString()
                },
                'info',
                session.user.id
              );
            }
          } catch (error) {
            console.error('Error logging security event:', error);
          }
        }, 0);
      }
    );

    return () => {
      console.log('Auth provider cleanup');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authUtils.signIn(email, password);
    if (result.error) {
      setLoading(false);
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const result = await authUtils.signUp(email, password);
    if (result.error) {
      setLoading(false);
    }
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    await authUtils.signOut(user?.id);
  };

  // Добавляем дополнительное логирование для отладки
  console.log('Auth state:', { user: !!user, session: !!session, loading });

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
