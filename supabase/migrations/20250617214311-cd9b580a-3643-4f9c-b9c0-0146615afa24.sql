
-- Phase 1: RLS Policy Cleanup and Strengthening

-- First, clean up all existing problematic policies
DROP POLICY IF EXISTS "scenario_select_policy" ON scenarios;
DROP POLICY IF EXISTS "scenario_insert_policy" ON scenarios;
DROP POLICY IF EXISTS "scenario_update_policy" ON scenarios;
DROP POLICY IF EXISTS "scenario_delete_policy" ON scenarios;
DROP POLICY IF EXISTS "account_select_policy" ON accounts;
DROP POLICY IF EXISTS "account_insert_policy" ON accounts;
DROP POLICY IF EXISTS "account_update_policy" ON accounts;
DROP POLICY IF EXISTS "account_delete_policy" ON accounts;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;

-- Ensure the security definer functions exist and are correct
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'basic'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'basic';
END;
$$;

-- Create comprehensive RLS policies for accounts
CREATE POLICY "accounts_user_access" ON accounts
  FOR ALL USING (user_id = public.get_current_user_id());

-- Create comprehensive RLS policies for scenarios  
CREATE POLICY "scenarios_user_access" ON scenarios
  FOR ALL USING (user_id = public.get_current_user_id());

-- Create comprehensive RLS policies for profiles
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL USING (id = public.get_current_user_id());

CREATE POLICY "profiles_admin_access" ON profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Add missing RLS policies for logs
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_user_access" ON logs
  FOR SELECT USING (user_id = public.get_current_user_id());

CREATE POLICY "logs_user_insert" ON logs
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "logs_admin_access" ON logs
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Add missing RLS policies for proxies
ALTER TABLE proxies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proxies_user_access" ON proxies
  FOR ALL USING (user_id = public.get_current_user_id());

-- Add missing RLS policies for rpa_tasks
ALTER TABLE rpa_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rpa_tasks_user_access" ON rpa_tasks
  FOR ALL USING (user_id = public.get_current_user_id());

-- Ensure all tables have RLS enabled
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add user_id column to rpa_tasks if it doesn't exist with proper references
DO $$
BEGIN
    -- Check if user_id column exists and add it if it doesn't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rpa_tasks' AND column_name = 'user_id') THEN
        ALTER TABLE rpa_tasks ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Create audit function for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation(
    operation_type text,
    table_name text,
    record_id uuid,
    details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO logs (user_id, action, details, status)
    VALUES (
        auth.uid(),
        format('AUDIT: %s on %s', operation_type, table_name),
        jsonb_build_object(
            'operation', operation_type,
            'table', table_name,
            'record_id', record_id,
            'details', details,
            'timestamp', now()
        ),
        'audit'
    );
END;
$$;
