
-- Fix infinite recursion in RLS policies for accounts and scenarios tables
-- This migration will drop and recreate the problematic policies

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

DROP POLICY IF EXISTS "Users can view own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can insert own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can update own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can delete own scenarios" ON scenarios;

-- Create simple, non-recursive policies for accounts
CREATE POLICY "accounts_select_policy" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "accounts_insert_policy" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_update_policy" ON accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "accounts_delete_policy" ON accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Create simple, non-recursive policies for scenarios
CREATE POLICY "scenarios_select_policy" ON scenarios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "scenarios_insert_policy" ON scenarios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scenarios_update_policy" ON scenarios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "scenarios_delete_policy" ON scenarios
    FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
