
import { useToast } from '@/hooks/use-toast';

interface ErrorHandlerOptions {
  title?: string;
  showToast?: boolean;
  logError?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (
    error: unknown, 
    context: string, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      title = "Ошибка",
      showToast = true,
      logError = true
    } = options;

    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    if (logError) {
      console.error(`Error in ${context}:`, error);
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

  const handleSuccess = (message: string, title: string = "Успешно") => {
    toast({
      title,
      description: message
    });
  };

  return {
    handleError,
    handleSuccess
  };
};
