
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { securityUtils } from '@/utils/securityUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    try {
      console.log('Sign in attempt for:', email);
      setLoading(true);
      
      // Валидация входных данных
      if (!securityUtils.validateEmail(email)) {
        const error = { message: 'Неверный формат email адреса' };
        await securityUtils.logSecurityEvent(
          'INVALID_EMAIL_SIGNIN_ATTEMPT',
          { email, timestamp: new Date().toISOString() },
          'warning'
        );
        setLoading(false);
        return { error };
      }

      // Очищаем состояние перед входом
      securityUtils.cleanupAuthState();
      
      // Пытаемся выйти глобально перед входом
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed, continuing...', err);
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        await securityUtils.logSecurityEvent(
          'SIGNIN_FAILED',
          {
            email,
            error: error.message,
            timestamp: new Date().toISOString()
          },
          'warning'
        );
        setLoading(false);
      }

      return { error };
    } catch (error: any) {
      console.error('Unexpected signin error:', error);
      await securityUtils.logSecurityEvent(
        'SIGNIN_ERROR',
        {
          email,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        'error'
      );
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Валидация входных данных
      if (!securityUtils.validateEmail(email)) {
        const error = { message: 'Неверный формат email адреса' };
        await securityUtils.logSecurityEvent(
          'INVALID_EMAIL_SIGNUP_ATTEMPT',
          { email, timestamp: new Date().toISOString() },
          'warning'
        );
        setLoading(false);
        return { error };
      }

      const passwordValidation = securityUtils.validatePassword(password);
      if (!passwordValidation.isValid) {
        const error = { message: passwordValidation.errors.join('. ') };
        await securityUtils.logSecurityEvent(
          'WEAK_PASSWORD_SIGNUP_ATTEMPT',
          { 
            email, 
            errors: passwordValidation.errors,
            timestamp: new Date().toISOString() 
          },
          'warning'
        );
        setLoading(false);
        return { error };
      }

      // Используем текущий домен вместо localhost
      const currentDomain = window.location.origin;
      const redirectUrl = `${currentDomain}/`;
      
      console.log('Sign up with redirect URL:', redirectUrl);
      
      // Очищаем состояние перед регистрацией
      securityUtils.cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        await securityUtils.logSecurityEvent(
          'SIGNUP_FAILED',
          {
            email,
            error: error.message,
            timestamp: new Date().toISOString()
          },
          'warning'
        );
        setLoading(false);
      } else {
        await securityUtils.logSecurityEvent(
          'SIGNUP_INITIATED',
          {
            email,
            timestamp: new Date().toISOString()
          },
          'info'
        );
        setLoading(false);
      }

      return { error };
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      await securityUtils.logSecurityEvent(
        'SIGNUP_ERROR',
        {
          email,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        'error'
      );
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Sign out');
      setLoading(true);
      
      await securityUtils.logSecurityEvent(
        'SIGNOUT_INITIATED',
        { timestamp: new Date().toISOString() },
        'info',
        user?.id
      );

      // Очищаем состояние аутентификации
      securityUtils.cleanupAuthState();
      
      // Пытаемся выйти глобально
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed:', err);
      }
      
      // Принудительно обновляем страницу для полной очистки состояния
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error: any) {
      console.error('Signout error:', error);
      await securityUtils.logSecurityEvent(
        'SIGNOUT_ERROR',
        { error: error.message },
        'error',
        user?.id
      );
      setLoading(false);
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
