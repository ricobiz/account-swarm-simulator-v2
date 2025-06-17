
-- Удаляем существующие политики которые вызывают рекурсию
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

DROP POLICY IF EXISTS "Users can view own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can insert own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can update own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can delete own scenarios" ON scenarios;

-- Создаем простые и безопасные политики для accounts
CREATE POLICY "accounts_select_policy" ON accounts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "accounts_insert_policy" ON accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "accounts_update_policy" ON accounts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "accounts_delete_policy" ON accounts
  FOR DELETE USING (user_id = auth.uid());

-- Создаем простые и безопасные политики для scenarios
CREATE POLICY "scenarios_select_policy" ON scenarios
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "scenarios_insert_policy" ON scenarios
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "scenarios_update_policy" ON scenarios
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "scenarios_delete_policy" ON scenarios
  FOR DELETE USING (user_id = auth.uid());
