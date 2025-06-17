
-- Создаем enum для ролей
CREATE TYPE public.app_role AS ENUM ('admin', 'premium', 'basic');

-- Создаем enum для статусов подписки
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'trial', 'expired');

-- Создаем таблицу профилей пользователей
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'basic',
  subscription_status subscription_status NOT NULL DEFAULT 'trial',
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accounts_limit INTEGER DEFAULT 5,
  scenarios_limit INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Включаем RLS для профилей
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Политики для профилей
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);

-- Функция для проверки ролей
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, subscription_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    'basic',
    'trial'
  );
  RETURN new;
END;
$$;

-- Триггер для создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Обновляем политики для существующих таблиц с учетом лимитов
-- Ограничения для аккаунтов
CREATE POLICY "Users can view own accounts within limits" 
  ON public.accounts 
  FOR SELECT 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND 
      (role = 'admin' OR 
       (SELECT COUNT(*) FROM public.accounts WHERE user_id = auth.uid()) <= accounts_limit)
    )
  );

CREATE POLICY "Users can create accounts within limits" 
  ON public.accounts 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND 
      (role = 'admin' OR 
       (SELECT COUNT(*) FROM public.accounts WHERE user_id = auth.uid()) < accounts_limit)
    )
  );

-- Ограничения для сценариев
CREATE POLICY "Users can view own scenarios within limits" 
  ON public.scenarios 
  FOR SELECT 
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND 
      (role = 'admin' OR 
       (SELECT COUNT(*) FROM public.scenarios WHERE user_id = auth.uid()) <= scenarios_limit)
    )
  );

CREATE POLICY "Users can create scenarios within limits" 
  ON public.scenarios 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND 
      (role = 'admin' OR 
       (SELECT COUNT(*) FROM public.scenarios WHERE user_id = auth.uid()) < scenarios_limit)
    )
  );
