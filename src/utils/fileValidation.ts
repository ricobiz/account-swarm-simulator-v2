
// Утилиты для валидации файлов
export const fileValidation = {
  // Разрешенные типы файлов для импорта аккаунтов
  allowedMimeTypes: ['text/plain', 'text/csv', 'application/csv'],
  maxFileSize: 10 * 1024 * 1024, // 10MB

  // Валидация файла
  validateFile: (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Проверка размера файла
    if (file.size > fileValidation.maxFileSize) {
      errors.push(`Файл слишком большой. Максимальный размер: ${fileValidation.maxFileSize / 1024 / 1024}MB`);
    }

    // Проверка типа файла
    if (!fileValidation.allowedMimeTypes.includes(file.type)) {
      errors.push('Неподдерживаемый тип файла. Разрешены только .txt и .csv файлы');
    }

    // Проверка расширения файла
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['txt', 'csv'].includes(fileExtension || '')) {
      errors.push('Неверное расширение файла. Используйте .txt или .csv');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Валидация содержимого файла аккаунтов
  validateAccountFileContent: (content: string): { 
    isValid: boolean; 
    errors: string[]; 
    validAccounts: any[];
    invalidLines: string[];
  } => {
    const errors: string[] = [];
    const validAccounts: any[] = [];
    const invalidLines: string[] = [];

    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      errors.push('Файл пустой');
      return { isValid: false, errors, validAccounts, invalidLines };
    }

    if (lines.length > 1000) {
      errors.push('Слишком много строк в файле. Максимум: 1000');
    }

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Проверяем формат: username:password:platform или username,password,platform
      const parts = trimmedLine.includes(':') 
        ? trimmedLine.split(':')
        : trimmedLine.split(',');

      if (parts.length !== 3) {
        invalidLines.push(`Строка ${index + 1}: Неверный формат (должно быть username:password:platform)`);
        return;
      }

      const [username, password, platform] = parts.map(p => p.trim());

      // Валидация каждого поля
      if (!username || username.length < 3 || username.length > 50) {
        invalidLines.push(`Строка ${index + 1}: Неверное имя пользователя`);
        return;
      }

      if (!password || password.length < 6) {
        invalidLines.push(`Строка ${index + 1}: Пароль слишком короткий`);
        return;
      }

      if (!['instagram', 'telegram', 'tiktok', 'youtube', 'reddit'].includes(platform.toLowerCase())) {
        invalidLines.push(`Строка ${index + 1}: Неподдерживаемая платформа (${platform})`);
        return;
      }

      // Проверка на вредоносные символы
      const dangerousChars = /<script|javascript:|data:|vbscript:/i;
      if (dangerousChars.test(username) || dangerousChars.test(password)) {
        invalidLines.push(`Строка ${index + 1}: Обнаружены подозрительные символы`);
        return;
      }

      validAccounts.push({
        username: username.substring(0, 50), // Ограничиваем длину
        password: password.substring(0, 100),
        platform: platform.toLowerCase()
      });
    });

    if (invalidLines.length > 0) {
      errors.push(...invalidLines);
    }

    return {
      isValid: validAccounts.length > 0 && invalidLines.length === 0,
      errors,
      validAccounts,
      invalidLines
    };
  }
};
