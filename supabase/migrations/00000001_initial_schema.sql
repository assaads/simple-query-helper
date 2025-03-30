-- Create tables with Row Level Security (RLS)

-- Enable Row Level Security on all tables
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create profiles table that extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create sessions table for storing chat/browser sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create session_steps table for tracking individual steps within a session
CREATE TABLE IF NOT EXISTS public.session_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  agent_thoughts TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.session_steps ENABLE ROW LEVEL SECURITY;

-- Create knowledge_base table for storing persistent user information
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create api_keys table for storing provider credentials
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  selected_model TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" 
  ON public.sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" 
  ON public.sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
  ON public.sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
  ON public.sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Session steps policies
CREATE POLICY "Users can view steps of own sessions" 
  ON public.session_steps FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = session_steps.session_id 
    AND sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create steps in own sessions" 
  ON public.session_steps FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = session_steps.session_id 
    AND sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update steps in own sessions" 
  ON public.session_steps FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = session_steps.session_id 
    AND sessions.user_id = auth.uid()
  ));

-- Knowledge base policies
CREATE POLICY "Users can view own knowledge" 
  ON public.knowledge_base FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own knowledge" 
  ON public.knowledge_base FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge" 
  ON public.knowledge_base FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge" 
  ON public.knowledge_base FOR DELETE 
  USING (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can view own API keys" 
  ON public.api_keys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" 
  ON public.api_keys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" 
  ON public.api_keys FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" 
  ON public.api_keys FOR DELETE 
  USING (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS session_steps_session_id_idx ON public.session_steps(session_id);
CREATE INDEX IF NOT EXISTS knowledge_base_user_id_category_idx ON public.knowledge_base(user_id, category);
CREATE INDEX IF NOT EXISTS api_keys_user_id_provider_idx ON public.api_keys(user_id, provider);
