
-- Удаляем ВСЕ существующие политики для scenarios
DROP POLICY IF EXISTS "scenarios_select_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_insert_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_update_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_delete_policy" ON scenarios;
DROP POLICY IF EXISTS "Users can view own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can insert own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can update own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can delete own scenarios" ON scenarios;

-- Удаляем старую функцию если она существует
DROP FUNCTION IF EXISTS public.get_current_user_id();

-- Создаем новую безопасную функцию
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Создаем совершенно новые политики
CREATE POLICY "scenario_select_policy" ON scenarios
  FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "scenario_insert_policy" ON scenarios
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "scenario_update_policy" ON scenarios
  FOR UPDATE USING (user_id = public.get_current_user_id());

CREATE POLICY "scenario_delete_policy" ON scenarios
  FOR DELETE USING (user_id = public.get_current_user_id());

-- Убеждаемся что RLS включен
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Также исправим политики для accounts
DROP POLICY IF EXISTS "accounts_select_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_insert_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_update_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_delete_policy" ON accounts;
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

CREATE POLICY "account_select_policy" ON accounts
  FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "account_insert_policy" ON accounts
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "account_update_policy" ON accounts
  FOR UPDATE USING (user_id = public.get_current_user_id());

CREATE POLICY "account_delete_policy" ON accounts
  FOR DELETE USING (user_id = public.get_current_user_id());

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
