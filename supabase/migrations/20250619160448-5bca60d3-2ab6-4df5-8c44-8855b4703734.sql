
-- Сначала посмотрим всех пользователей чтобы найти ваш email
SELECT id, email, role, subscription_status, created_at FROM public.profiles ORDER BY created_at;

-- Назначаем права администратора пользователю с вашим email
-- Замените 'alexfordocs@gmail.com' на ваш настоящий email
UPDATE public.profiles 
SET role = 'admin', 
    subscription_status = 'active',
    updated_at = now()
WHERE email = 'alexfordocs@gmail.com';
