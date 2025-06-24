
-- Primeiro, vamos verificar e criar/ajustar a tabela user_profiles se necessário
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Usuário',
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  has_contratpro BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS se ainda não estiver habilitada
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Criar ou substituir as políticas RLS para user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verificar e criar a função handle_new_user se não existir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', user_profiles.name),
    email = NEW.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ajustar a tabela contract_templates para não ter conflitos
ALTER TABLE public.contract_templates 
ALTER COLUMN variables SET DEFAULT '{}';

-- Atualizar registros existentes que possam ter variables NULL
UPDATE public.contract_templates 
SET variables = '{}' 
WHERE variables IS NULL;

-- Tornar a coluna NOT NULL após atualizar
ALTER TABLE public.contract_templates 
ALTER COLUMN variables SET NOT NULL;
