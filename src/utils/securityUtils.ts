
import { supabase } from '@/integrations/supabase/client';

// Утилиты для безопасности
export const securityUtils = {
  // Очистка и валидация входных данных
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    return input
      .trim()
      .replace(/[<>\"'&]/g, (match) => {
        const escapeMap: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return escapeMap[match];
      });
  },

  // Валидация email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Валидация пароля
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Пароль должен содержать заглавную букву');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Пароль должен содержать строчную букву');
    }
    if (!/\d/.test(password)) {
      errors.push('Пароль должен содержать цифру');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Пароль должен содержать специальный символ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Валидация имени пользователя/аккаунта
  validateUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
    return usernameRegex.test(username);
  },

  // Валидация URL/IP адреса прокси
  validateProxyIP: (ip: string): boolean => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+:){1,7}[a-fA-F0-9]+$/;
    return ipRegex.test(ip);
  },

  // Валидация порта
  validatePort: (port: number): boolean => {
    return port > 0 && port <= 65535;
  },

  // Логирование событий безопасности
  logSecurityEvent: async (
    action: string, 
    details: any, 
    level: 'info' | 'warning' | 'error' | 'critical' = 'info',
    userId?: string
  ) => {
    try {
      await supabase.rpc('audit_sensitive_operation', {
        operation_type: 'SECURITY_EVENT',
        table_name: 'security_log',
        record_id: null,
        details: {
          action,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          level,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: 'client_side', // В реальном приложении получать от сервера
          user_id: userId
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  },

  // Очистка состояния аутентификации
  cleanupAuthState: () => {
    try {
      // Удаляем все ключи связанные с Supabase auth
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Также очищаем sessionStorage если используется
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning auth state:', error);
    }
  },

  // Проверка на подозрительную активность
  detectSuspiciousActivity: (actions: any[]): {
    isSuspicious: boolean;
    reasons: string[];
  } => {
    const reasons: string[] = [];
    let isSuspicious = false;

    // Проверяем частоту действий
    const recentActions = actions.filter(action => 
      Date.now() - new Date(action.timestamp).getTime() < 5 * 60 * 1000 // последние 5 минут
    );

    if (recentActions.length > 20) {
      isSuspicious = true;
      reasons.push('Слишком много действий за короткое время');
    }

    // Проверяем на множественные неудачные попытки входа
    const failedLogins = recentActions.filter(action => 
      action.action.includes('login') && action.status === 'error'
    );

    if (failedLogins.length > 3) {
      isSuspicious = true;
      reasons.push('Множественные неудачные попытки входа');
    }

    // Проверяем на попытки несанкционированного доступа
    const unauthorizedAccess = recentActions.filter(action => 
      action.action.includes('UNAUTHORIZED') || action.level === 'critical'
    );

    if (unauthorizedAccess.length > 0) {
      isSuspicious = true;
      reasons.push('Попытки несанкционированного доступа');
    }

    return { isSuspicious, reasons };
  }
};
