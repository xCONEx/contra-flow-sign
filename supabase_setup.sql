
-- Criar tabelas necessárias para o sistema de contratos

-- 1. Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de contratos
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'cancelled')) DEFAULT 'draft',
  total_value DECIMAL(12,2),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('contract_signed', 'contract_expiring', 'contract_pending')) NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Atualizar tabela user_profiles para incluir assinatura
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- 5. Habilitar RLS em todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para clients
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;

CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- 7. Políticas RLS para contracts
DROP POLICY IF EXISTS "Users can view own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can insert own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can update own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can delete own contracts" ON public.contracts;

CREATE POLICY "Users can view own contracts" ON public.contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contracts" ON public.contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contracts" ON public.contracts FOR DELETE USING (auth.uid() = user_id);

-- 8. Políticas RLS para notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- 9. Função para criar notificações automaticamente
CREATE OR REPLACE FUNCTION create_contract_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificação quando contrato é assinado
  IF OLD.status != 'signed' AND NEW.status = 'signed' THEN
    INSERT INTO public.notifications (user_id, title, message, type, contract_id)
    VALUES (
      NEW.user_id,
      'Contrato Assinado!',
      'O contrato "' || NEW.title || '" foi assinado com sucesso.',
      'contract_signed',
      NEW.id
    );
  END IF;
  
  -- Notificação quando contrato vence (verificar se vence em 3 dias)
  IF NEW.due_date IS NOT NULL AND NEW.due_date <= CURRENT_DATE + INTERVAL '3 days' AND NEW.status IN ('sent', 'draft') THEN
    INSERT INTO public.notifications (user_id, title, message, type, contract_id)
    VALUES (
      NEW.user_id,
      'Contrato Vencendo',
      'O contrato "' || NEW.title || '" vence em breve.',
      'contract_expiring',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger para notificações
DROP TRIGGER IF EXISTS contract_notification_trigger ON public.contracts;
CREATE TRIGGER contract_notification_trigger
  AFTER UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION create_contract_notification();

-- 11. Função para limpar notificações antigas (30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Criar bucket para assinaturas (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- 13. Política de storage para assinaturas
DROP POLICY IF EXISTS "Users can upload own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Public can view signatures" ON storage.objects;

CREATE POLICY "Users can upload own signatures" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own signatures" ON storage.objects 
FOR SELECT USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view signatures" ON storage.objects 
FOR SELECT USING (bucket_id = 'signatures');
