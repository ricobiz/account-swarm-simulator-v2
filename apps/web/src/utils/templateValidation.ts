
import { FormData } from '@/hooks/useTemplateManager';
import { StepForm } from '@/components/scenario-templates/StepBuilder';

export const validateTemplate = (data: FormData): string[] => {
  const errors = [];
  
  if (!data.name.trim()) {
    errors.push('Введите название шаблона');
  }
  
  if (!data.platform) {
    errors.push('Выберите платформу');
  }
  
  if (data.steps.length === 0) {
    errors.push('Добавьте хотя бы один шаг или действие');
  }

  // Убираем обязательную проверку на шаг навигации
  // так как пользователь может использовать готовые шаблоны действий

  return errors;
};

export const validateStep = (step: StepForm): string[] => {
  const errors = [];
  
  if (!step.type) {
    errors.push('Выберите тип шага');
  }
  
  if (!step.name.trim()) {
    errors.push('Введите название шага');
  }

  // Дополнительная валидация в зависимости от типа
  switch (step.type) {
    case 'navigate':
      if (!step.url) {
        errors.push('Введите URL для навигации');
      }
      break;
    case 'click':
      if (!step.selector) {
        errors.push('Введите CSS селектор для клика');
      }
      break;
    case 'type':
      if (!step.selector || !step.text) {
        errors.push('Введите селектор и текст для ввода');
      }
      break;
    case 'wait':
      if (!step.minTime || !step.maxTime || step.maxTime <= step.minTime) {
        errors.push('Введите корректные значения времени ожидания');
      }
      break;
  }

  return errors;
};
