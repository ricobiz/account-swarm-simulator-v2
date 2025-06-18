
-- Полностью удаляем все существующие политики RLS
DROP POLICY IF EXISTS "accounts_policy_select" ON accounts;
DROP POLICY IF EXISTS "accounts_policy_insert" ON accounts;
DROP POLICY IF EXISTS "accounts_policy_update" ON accounts;
DROP POLICY IF EXISTS "accounts_policy_delete" ON accounts;

DROP POLICY IF EXISTS "scenarios_policy_select" ON scenarios;
DROP POLICY IF EXISTS "scenarios_policy_insert" ON scenarios;
DROP POLICY IF EXISTS "scenarios_policy_update" ON scenarios;
DROP POLICY IF EXISTS "scenarios_policy_delete" ON scenarios;

DROP POLICY IF EXISTS "profiles_policy_select" ON profiles;
DROP POLICY IF EXISTS "profiles_policy_update" ON profiles;

DROP POLICY IF EXISTS "logs_policy_select" ON logs;
DROP POLICY IF EXISTS "logs_policy_insert" ON logs;

DROP POLICY IF EXISTS "proxies_policy_select" ON proxies;
DROP POLICY IF EXISTS "proxies_policy_insert" ON proxies;
DROP POLICY IF EXISTS "proxies_policy_update" ON proxies;
DROP POLICY IF EXISTS "proxies_policy_delete" ON proxies;

DROP POLICY IF EXISTS "rpa_tasks_policy_select" ON rpa_tasks;
DROP POLICY IF EXISTS "rpa_tasks_policy_insert" ON rpa_tasks;
DROP POLICY IF EXISTS "rpa_tasks_policy_update" ON rpa_tasks;

-- Удаляем все остальные политики если они есть
DROP POLICY IF EXISTS "accounts_select_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_insert_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_update_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_delete_policy" ON accounts;

DROP POLICY IF EXISTS "scenarios_select_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_insert_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_update_policy" ON scenarios;
DROP POLICY IF EXISTS "scenarios_delete_policy" ON scenarios;

DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Отключаем RLS на время создания новых политик
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE proxies DISABLE ROW LEVEL SECURITY;
ALTER TABLE rpa_tasks DISABLE ROW LEVEL SECURITY;

-- Создаем простейшие политики без рекурсии
-- Accounts
CREATE POLICY "accounts_rls_select" ON accounts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "accounts_rls_insert" ON accounts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "accounts_rls_update" ON accounts
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "accounts_rls_delete" ON accounts
    FOR DELETE USING (user_id = auth.uid());

-- Scenarios
CREATE POLICY "scenarios_rls_select" ON scenarios
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "scenarios_rls_insert" ON scenarios
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "scenarios_rls_update" ON scenarios
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "scenarios_rls_delete" ON scenarios
    FOR DELETE USING (user_id = auth.uid());

-- Profiles
CREATE POLICY "profiles_rls_select" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_rls_update" ON profiles
    FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_rls_insert" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Logs
CREATE POLICY "logs_rls_select" ON logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "logs_rls_insert" ON logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Proxies
CREATE POLICY "proxies_rls_select" ON proxies
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "proxies_rls_insert" ON proxies
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proxies_rls_update" ON proxies
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "proxies_rls_delete" ON proxies
    FOR DELETE USING (user_id = auth.uid());

-- RPA Tasks
CREATE POLICY "rpa_tasks_rls_select" ON rpa_tasks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "rpa_tasks_rls_insert" ON rpa_tasks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "rpa_tasks_rls_update" ON rpa_tasks
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Включаем RLS обратно
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpa_tasks ENABLE ROW LEVEL SECURITY;
