
-- Удаляем ВСЕ существующие политики для профилей
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Создаем функцию безопасности для получения роли текущего пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Для новых пользователей возвращаем 'basic' по умолчанию
  RETURN COALESCE(
    (SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'basic'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'basic';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Создаем новые простые политики без рекурсии
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Админы могут видеть все профили (новое имя)
CREATE POLICY "Admin view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

-- Админы могут обновлять все профили (новое имя)
CREATE POLICY "Admin update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.get_current_user_role() = 'admin');
