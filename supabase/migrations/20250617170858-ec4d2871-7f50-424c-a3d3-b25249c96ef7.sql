
-- Временно отключаем RLS для scenarios чтобы проверить загрузку данных
ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;

-- Также временно отключим для accounts
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
