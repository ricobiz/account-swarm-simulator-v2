
-- Сначала полностью отключаем RLS для всех таблиц
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE proxies DISABLE ROW LEVEL SECURITY;
ALTER TABLE rpa_tasks DISABLE ROW LEVEL SECURITY;

-- Удаляем ВСЕ политики для scenarios (включая любые скрытые)
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'scenarios' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON scenarios';
    END LOOP;
END $$;

-- Удаляем ВСЕ политики для accounts
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'accounts' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON accounts';
    END LOOP;
END $$;

-- Удаляем ВСЕ политики для profiles
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Удаляем ВСЕ политики для logs
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'logs' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON logs';
    END LOOP;
END $$;

-- Удаляем ВСЕ политики для proxies
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'proxies' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON proxies';
    END LOOP;
END $$;

-- Удаляем ВСЕ политики для rpa_tasks
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'rpa_tasks' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON rpa_tasks';
    END LOOP;
END $$;

-- Теперь создаем простые политики без функций
-- Scenarios - самые простые политики
CREATE POLICY "scenarios_select" ON scenarios
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "scenarios_insert" ON scenarios
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "scenarios_update" ON scenarios
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "scenarios_delete" ON scenarios
    FOR DELETE USING (user_id = auth.uid());

-- Accounts
CREATE POLICY "accounts_select" ON accounts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "accounts_insert" ON accounts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "accounts_update" ON accounts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "accounts_delete" ON accounts
    FOR DELETE USING (user_id = auth.uid());

-- Profiles
CREATE POLICY "profiles_select" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Logs
CREATE POLICY "logs_select" ON logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "logs_insert" ON logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Proxies
CREATE POLICY "proxies_select" ON proxies
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "proxies_insert" ON proxies
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "proxies_update" ON proxies
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "proxies_delete" ON proxies
    FOR DELETE USING (user_id = auth.uid());

-- RPA Tasks
CREATE POLICY "rpa_tasks_select" ON rpa_tasks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "rpa_tasks_insert" ON rpa_tasks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "rpa_tasks_update" ON rpa_tasks
    FOR UPDATE USING (user_id = auth.uid());

-- Включаем RLS обратно
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpa_tasks ENABLE ROW LEVEL SECURITY;
