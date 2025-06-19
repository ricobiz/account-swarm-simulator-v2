
-- Проверяем текущих пользователей и их роли
SELECT id, email, role, subscription_status FROM public.profiles;

-- Устанавливаем роль администратора для первого пользователя в системе
-- (замените на ваш email если нужно)
UPDATE public.profiles 
SET role = 'admin', 
    subscription_status = 'active',
    updated_at = now()
WHERE id = (
  SELECT id FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Альтернативно, если вы знаете свой email, можете использовать:
-- UPDATE public.profiles 
-- SET role = 'admin', 
--     subscription_status = 'active',
--     updated_at = now()
-- WHERE email = 'ваш_email@example.com';
