
-- Сначала добавляем колонку user_id в таблицы, где её нет
-- (Проверяем существование колонки перед добавлением)

DO $$ 
BEGIN
    -- Добавляем user_id в accounts если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'accounts' AND column_name = 'user_id') THEN
        ALTER TABLE public.accounts ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Добавляем user_id в proxies если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'proxies' AND column_name = 'user_id') THEN
        ALTER TABLE public.proxies ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Добавляем user_id в scenarios если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'scenarios' AND column_name = 'user_id') THEN
        ALTER TABLE public.scenarios ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Добавляем user_id в logs если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.logs ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Добавляем user_id в rpa_tasks если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rpa_tasks' AND column_name = 'user_id') THEN
        ALTER TABLE public.rpa_tasks ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Удаляем все существующие политики перед созданием новых
DROP POLICY IF EXISTS "Users can read their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert/update/delete their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can read their own proxies" ON public.proxies;
DROP POLICY IF EXISTS "Users can insert/update/delete their own proxies" ON public.proxies;
DROP POLICY IF EXISTS "Users can read their own scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can insert/update/delete their own scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can read their own logs" ON public.logs;
DROP POLICY IF EXISTS "Users can insert/update/delete their own logs" ON public.logs;
DROP POLICY IF EXISTS "Users can read their own rpa_tasks" ON public.rpa_tasks;
DROP POLICY IF EXISTS "Users can insert/update/delete their own rpa_tasks" ON public.rpa_tasks;

-- Включаем RLS для всех таблиц
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpa_tasks ENABLE ROW LEVEL SECURITY;

-- Создаем политики для чтения (SELECT)
CREATE POLICY "Users can read their own accounts"
    ON public.accounts
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can read their own proxies"
    ON public.proxies
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can read their own scenarios"
    ON public.scenarios
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can read their own logs"
    ON public.logs
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can read their own rpa_tasks"
    ON public.rpa_tasks
    FOR SELECT
    USING (user_id = auth.uid());

-- Создаем политики для всех операций (INSERT, UPDATE, DELETE)
CREATE POLICY "Users can insert/update/delete their own accounts"
    ON public.accounts
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert/update/delete their own proxies"
    ON public.proxies
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert/update/delete their own scenarios"
    ON public.scenarios
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert/update/delete their own logs"
    ON public.logs
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert/update/delete their own rpa_tasks"
    ON public.rpa_tasks
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Создаем индексы для повышения производительности
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_proxies_user_id ON public.proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON public.scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rpa_tasks_user_id ON public.rpa_tasks(user_id);
