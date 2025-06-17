
-- Create logs table for tracking account actions and scenario executions
CREATE TABLE public.logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  scenario_id UUID REFERENCES public.scenarios(id),
  action TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for logs
CREATE POLICY "Users can view their own logs" 
  ON public.logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs" 
  ON public.logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on queries
CREATE INDEX idx_logs_user_created_at ON public.logs (user_id, created_at DESC);
CREATE INDEX idx_logs_account_id ON public.logs (account_id);
CREATE INDEX idx_logs_scenario_id ON public.logs (scenario_id);
