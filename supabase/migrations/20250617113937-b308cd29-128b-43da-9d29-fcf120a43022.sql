
-- Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  proxy_id UUID,
  last_action TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proxies table
CREATE TABLE public.proxies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ip TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'offline',
  speed TEXT,
  usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scenarios table
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'stopped',
  accounts_count INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  next_run TEXT,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for proxy_id in accounts
ALTER TABLE public.accounts 
ADD CONSTRAINT fk_accounts_proxy 
FOREIGN KEY (proxy_id) REFERENCES public.proxies(id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts" 
  ON public.accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
  ON public.accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
  ON public.accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
  ON public.accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for proxies
CREATE POLICY "Users can view their own proxies" 
  ON public.proxies 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proxies" 
  ON public.proxies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proxies" 
  ON public.proxies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proxies" 
  ON public.proxies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for scenarios
CREATE POLICY "Users can view their own scenarios" 
  ON public.scenarios 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scenarios" 
  ON public.scenarios 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios" 
  ON public.scenarios 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios" 
  ON public.scenarios 
  FOR DELETE 
  USING (auth.uid() = user_id);
