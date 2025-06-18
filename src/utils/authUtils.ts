
import { supabase } from '@/integrations/supabase/client';
import { securityUtils } from '@/utils/securityUtils';

export const authUtils = {
  async signIn(email: string, password: string) {
    try {
      console.log('Sign in attempt for:', email);
      
      // Валидация входных данных
      if (!securityUtils.validateEmail(email)) {
        const error = { message: 'Неверный формат email адреса' };
        await securityUtils.logSecurityEvent(
          'INVALID_EMAIL_SIGNIN_ATTEMPT',
          { email, timestamp: new Date().toISOString() },
          'warning'
        );
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
      return { error };
    }
  },

  async signUp(email: string, password: string) {
    try {
      // Валидация входных данных
      if (!securityUtils.validateEmail(email)) {
        const error = { message: 'Неверный формат email адреса' };
        await securityUtils.logSecurityEvent(
          'INVALID_EMAIL_SIGNUP_ATTEMPT',
          { email, timestamp: new Date().toISOString() },
          'warning'
        );
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
      } else {
        await securityUtils.logSecurityEvent(
          'SIGNUP_INITIATED',
          {
            email,
            timestamp: new Date().toISOString()
          },
          'info'
        );
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
      return { error };
    }
  },

  async signOut(userId?: string) {
    try {
      console.log('Sign out');
      
      await securityUtils.logSecurityEvent(
        'SIGNOUT_INITIATED',
        { timestamp: new Date().toISOString() },
        'info',
        userId
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
        userId
      );
      throw error;
    }
  }
};
