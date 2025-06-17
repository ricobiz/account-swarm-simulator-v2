
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorHandlerOptions {
  title?: string;
  showToast?: boolean;
  logError?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (
    error: any, 
    context: string, 
    options: ErrorHandlerOptions = {}
  ): string => {
    const {
      title = "Ошибка",
      showToast = true,
      logError = true
    } = options;

    const errorMessage = error?.message || 'Произошла неизвестная ошибка';
    
    console.error(`Error in ${context}:`, error);

    // Log security-relevant errors
    if (logError && errorMessage) {
      const logSecurityError = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            await supabase.rpc('audit_sensitive_operation', {
              operation_type: 'APPLICATION_ERROR',
              table_name: 'system',
              record_id: user.id,
              details: {
                context,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
              }
            });
          }
        } catch (logError) {
          console.error('Failed to log security error:', logError);
        }
      };

      logSecurityError();
    }

    if (showToast) {
      toast({
        title,
        description: errorMessage,
        variant: "destructive"
      });
    }

    return errorMessage;
  };

  const handleSuccess = (
    message: string,
    title: string = "Успешно",
    logSuccess: boolean = false
  ) => {
    console.log(`Success: ${message}`);

    if (logSuccess) {
      const logSuccessEvent = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            await supabase.rpc('audit_sensitive_operation', {
              operation_type: 'SUCCESS_EVENT',
              table_name: 'system',
              record_id: user.id,
              details: {
                message,
                timestamp: new Date().toISOString()
              }
            });
          }
        } catch (logError) {
          console.error('Failed to log success event:', logError);
        }
      };

      logSuccessEvent();
    }

    toast({
      title,
      description: message,
      variant: "default"
    });
  };

  const handleWarning = (
    message: string,
    title: string = "Предупреждение",
    logWarning: boolean = true
  ) => {
    console.warn(`Warning: ${message}`);

    if (logWarning) {
      const logWarningEvent = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            await supabase.rpc('audit_sensitive_operation', {
              operation_type: 'WARNING_EVENT',
              table_name: 'system',
              record_id: user.id,
              details: {
                message,
                timestamp: new Date().toISOString()
              }
            });
          }
        } catch (logError) {
          console.error('Failed to log warning event:', logError);
        }
      };

      logWarningEvent();
    }

    toast({
      title,
      description: message,
      variant: "destructive"
    });
  };

  return {
    handleError,
    handleSuccess,
    handleWarning
  };
};
