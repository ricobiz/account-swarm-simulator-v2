
-- Create the rpa_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rpa_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending',
    task_data jsonb NOT NULL,
    result_data jsonb,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rpa_tasks_task_id ON public.rpa_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_rpa_tasks_status ON public.rpa_tasks(status);
CREATE INDEX IF NOT EXISTS idx_rpa_tasks_created_at ON public.rpa_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_rpa_tasks_user_id ON public.rpa_tasks(user_id);

-- Enable Row Level Security
ALTER TABLE public.rpa_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own rpa tasks" ON public.rpa_tasks;
DROP POLICY IF EXISTS "Users can insert their own rpa tasks" ON public.rpa_tasks;
DROP POLICY IF EXISTS "Users can update their own rpa tasks" ON public.rpa_tasks;

-- Create RLS policies
CREATE POLICY "Users can view their own rpa tasks" 
    ON public.rpa_tasks 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rpa tasks" 
    ON public.rpa_tasks 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rpa tasks" 
    ON public.rpa_tasks 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.rpa_tasks IS 'Table for storing RPA tasks and their results';
COMMENT ON COLUMN public.rpa_tasks.task_id IS 'Unique identifier for the task';
COMMENT ON COLUMN public.rpa_tasks.status IS 'Task status: pending, processing, completed, failed, timeout';
COMMENT ON COLUMN public.rpa_tasks.task_data IS 'Task data in JSON format';
COMMENT ON COLUMN public.rpa_tasks.result_data IS 'Task execution result in JSON format';
