
-- Сначала удаляем все существующие политики для scenarios
DROP POLICY IF EXISTS "scenarios_select_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_insert_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_update_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_delete_policy" ON scenarios;

-- Создаем безопасную функцию для получения ID текущего пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Создаем новые простые политики для scenarios без рекурсии
CREATE POLICY "scenarios_select_policy" ON scenarios
  FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "scenarios_insert_policy" ON scenarios
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "scenarios_update_policy" ON scenarios
  FOR UPDATE USING (user_id = public.get_current_user_id());

CREATE POLICY "scenarios_delete_policy" ON scenarios
  FOR DELETE USING (user_id = public.get_current_user_id());

-- Проверяем, что RLS включен
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
