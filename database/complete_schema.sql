
-- ContratPro - Schema Completo para Supabase
-- Sistema completo de contratos digitais com integração FinanceFlow

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =======================
-- TABELAS PRINCIPAIS
-- =======================

-- Perfis de usuário (extensão do auth.users do Supabase)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'premium')),
  
  -- Integração FinanceFlow
  finance_flow_user_id UUID,
  finance_flow_api_key TEXT,
  finance_flow_webhook_url TEXT,
  
  -- Configurações
  settings JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "browser": true,
      "contract_sent": true,
      "contract_signed": true,
      "contract_expired": true
    },
    "signature": {
      "require_location": false,
      "auto_expire_days": 30
    }
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clientes
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  address JSONB DEFAULT '{}', -- {street, city, state, zip, country}
  notes TEXT,
  
  -- Integração FinanceFlow
  finance_flow_client_id UUID,
  
  -- Metadados
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Templates de contrato
CREATE TABLE contract_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  
  -- Conteúdo do template
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Array de definições de variáveis
  
  -- Configurações
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES contract_templates(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contratos principais
CREATE TABLE contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE RESTRICT NOT NULL,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  
  -- Informações básicas
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  value DECIMAL(15,2),
  currency TEXT DEFAULT 'BRL',
  
  -- Status e workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'cancelled', 'archived')),
  
  -- Datas importantes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Assinatura digital
  signature_token TEXT UNIQUE,
  signature_data JSONB,
  digital_certificate_id UUID,
  
  -- Arquivos
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Dados do template aplicado
  template_variables JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  -- Integração FinanceFlow
  finance_flow_contract_id UUID,
  finance_flow_invoice_id UUID,
  finance_flow_payment_status TEXT,
  
  -- SEO e busca
  search_vector tsvector,
  
  -- Constraints
  CONSTRAINT valid_signature_flow CHECK (
    (status = 'sent' AND signature_token IS NOT NULL) OR 
    (status != 'sent')
  ),
  CONSTRAINT valid_signed_data CHECK (
    (status = 'signed' AND signature_data IS NOT NULL AND signed_at IS NOT NULL) OR 
    (status != 'signed')
  )
);

-- Certificados digitais
CREATE TABLE digital_certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  certificate_data TEXT NOT NULL, -- Certificado em base64
  verification_code TEXT NOT NULL UNIQUE,
  hash_algorithm TEXT DEFAULT 'SHA-256',
  signature_hash TEXT NOT NULL,
  
  -- Metadados do certificado
  issuer TEXT DEFAULT 'ContratPro Digital Authority',
  subject_data JSONB NOT NULL, -- Dados do signatário
  
  -- Validade
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '10 years',
  is_valid BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revocation_reason TEXT,
  
  -- Validação blockchain (futuro)
  blockchain_hash TEXT,
  blockchain_network TEXT
);

-- Eventos de auditoria (log completo)
CREATE TABLE contract_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Detalhes do evento
  event_type TEXT NOT NULL,
  event_action TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Contexto técnico
  ip_address INET,
  user_agent TEXT,
  geolocation JSONB, -- {lat, lng, city, country, accuracy}
  
  -- Metadados específicos
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'created', 'updated', 'sent', 'viewed', 'signed', 'expired', 
    'cancelled', 'archived', 'pdf_generated', 'reminder_sent'
  ))
);

-- =======================
-- TABELAS DE SUPORTE
-- =======================

-- Notificações
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  
  -- Conteúdo
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Agendamento
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuração
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  headers JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  max_failures INTEGER DEFAULT 5,
  
  -- Retry configuration
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de webhook
CREATE TABLE webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  
  -- Detalhes da requisição
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- Resposta
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Planos de assinatura
CREATE TABLE subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(8,2),
  price_yearly DECIMAL(8,2),
  
  -- Limites
  max_contracts_per_month INTEGER, -- NULL = ilimitado
  max_clients INTEGER,
  max_templates INTEGER,
  max_file_size_mb INTEGER DEFAULT 10,
  
  -- Features
  features JSONB NOT NULL DEFAULT '[]',
  api_access BOOLEAN DEFAULT false,
  webhook_access BOOLEAN DEFAULT false,
  custom_branding BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assinaturas de usuários
CREATE TABLE user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  
  -- Status da assinatura
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  
  -- Período atual
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Uso no período
  contracts_used INTEGER DEFAULT 0,
  
  -- Integração com pagamento
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraint para garantir apenas uma assinatura ativa por usuário
  CONSTRAINT unique_active_subscription EXCLUDE (user_id WITH =) WHERE (status = 'active')
);

-- API Keys para integrações
CREATE TABLE api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuração
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- Primeiros caracteres para identificação
  
  -- Permissões
  permissions TEXT[] DEFAULT '{"read"}',
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  
  -- Expiração
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- ÍNDICES PARA PERFORMANCE
-- =======================

-- Contratos
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX idx_contracts_expires_at ON contracts(expires_at) WHERE status = 'sent';
CREATE INDEX idx_contracts_signature_token ON contracts(signature_token) WHERE signature_token IS NOT NULL;
CREATE INDEX idx_contracts_search ON contracts USING gin(search_vector);
CREATE INDEX idx_contracts_finance_flow ON contracts(finance_flow_contract_id) WHERE finance_flow_contract_id IS NOT NULL;

-- Clientes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_finance_flow ON clients(finance_flow_client_id) WHERE finance_flow_client_id IS NOT NULL;

-- Eventos
CREATE INDEX idx_contract_events_contract_id ON contract_events(contract_id);
CREATE INDEX idx_contract_events_created_at ON contract_events(created_at DESC);
CREATE INDEX idx_contract_events_user_id ON contract_events(user_id);
CREATE INDEX idx_contract_events_type ON contract_events(event_type);

-- Notificações
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Templates
CREATE INDEX idx_templates_user_id ON contract_templates(user_id);
CREATE INDEX idx_templates_category ON contract_templates(category);
CREATE INDEX idx_templates_public ON contract_templates(is_public) WHERE is_public = true;

-- Webhooks
CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- =======================
-- ROW LEVEL SECURITY (RLS)
-- =======================

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para clients
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para contract_templates
CREATE POLICY "Users can view accessible templates" ON contract_templates
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = user_id
  );

CREATE POLICY "Users can manage own templates" ON contract_templates
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para contracts
CREATE POLICY "Users can view own contracts" ON contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" ON contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft contracts" ON contracts
  FOR DELETE USING (
    auth.uid() = user_id AND 
    status IN ('draft', 'cancelled')
  );

-- Políticas para digital_certificates
CREATE POLICY "Users can view certificates of own contracts" ON digital_certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = digital_certificates.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

-- Políticas para contract_events
CREATE POLICY "Users can view events of own contracts" ON contract_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_events.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

-- Políticas para notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para webhooks
CREATE POLICY "Users can manage own webhooks" ON webhooks
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para webhook_logs
CREATE POLICY "Users can view own webhook logs" ON webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhooks 
      WHERE webhooks.id = webhook_logs.webhook_id 
      AND webhooks.user_id = auth.uid()
    )
  );

-- Políticas para user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para api_keys
CREATE POLICY "Users can manage own api keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- =======================
-- FUNÇÕES E TRIGGERS
-- =======================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at 
  BEFORE UPDATE ON contract_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at 
  BEFORE UPDATE ON contracts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at 
  BEFORE UPDATE ON webhooks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar eventos de contrato automaticamente
CREATE OR REPLACE FUNCTION create_contract_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Evento de criação
  IF TG_OP = 'INSERT' THEN
    INSERT INTO contract_events (
      contract_id, user_id, event_type, event_action, description
    ) VALUES (
      NEW.id, NEW.user_id, 'created', 'contract_created', 
      'Contrato "' || NEW.title || '" foi criado'
    );
    RETURN NEW;
  END IF;
  
  -- Eventos de mudança de status
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO contract_events (
      contract_id, user_id, event_type, event_action, description, metadata
    ) VALUES (
      NEW.id, NEW.user_id, NEW.status, 'status_changed',
      CASE NEW.status
        WHEN 'sent' THEN 'Contrato enviado para assinatura'
        WHEN 'signed' THEN 'Contrato assinado digitalmente'
        WHEN 'expired' THEN 'Contrato expirado'
        WHEN 'cancelled' THEN 'Contrato cancelado'
        WHEN 'archived' THEN 'Contrato arquivado'
        ELSE 'Status alterado para ' || NEW.status
      END,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'contract_title', NEW.title
      )
    );
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para eventos automáticos de contrato
CREATE TRIGGER contract_events_trigger
  AFTER INSERT OR UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION create_contract_event();

-- Função para atualizar search_vector
CREATE OR REPLACE FUNCTION update_contract_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para search vector
CREATE TRIGGER update_contracts_search_vector
  BEFORE INSERT OR UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_contract_search_vector();

-- Função para expirar contratos automaticamente
CREATE OR REPLACE FUNCTION expire_contracts()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE contracts 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'sent' 
    AND expires_at < NOW();
    
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Criar notificações para contratos expirados
  INSERT INTO notifications (user_id, contract_id, type, title, message)
  SELECT 
    c.user_id,
    c.id,
    'warning',
    'Contrato Expirado',
    'O contrato "' || c.title || '" expirou e não foi assinado.'
  FROM contracts c
  WHERE c.status = 'expired'
    AND c.expires_at < NOW()
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.contract_id = c.id 
      AND n.type = 'warning' 
      AND n.title = 'Contrato Expirado'
    );
    
  RETURN expired_count;
END;
$$ language 'plpgsql';

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil quando usuário é criado no auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =======================
-- DADOS INICIAIS (SEED)
-- =======================

-- Planos de assinatura
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, max_contracts_per_month, features, api_access) VALUES
('Gratuito', 'Para começar a usar', 0.00, 0.00, 3, 
 '["3 contratos por mês", "Modelos básicos", "Assinatura eletrônica", "Suporte por email"]'::jsonb, false),

('Profissional', 'Para freelancers e pequenas empresas', 29.90, 299.00, 50,
 '["50 contratos por mês", "Todos os modelos", "Customização avançada", "Relatórios básicos", "Suporte prioritário", "Integração FinanceFlow"]'::jsonb, true),

('Premium', 'Para empresas e agências', 79.90, 799.00, NULL,
 '["Contratos ilimitados", "API completa", "Webhooks", "Relatórios avançados", "Suporte dedicado", "White-label", "Integração FinanceFlow Pro"]'::jsonb, true);

-- Templates padrão
INSERT INTO contract_templates (name, description, category, content, variables, is_public, is_default) VALUES

('Prestação de Serviços Fotográficos', 'Modelo para serviços de fotografia profissional', 'photography',
'CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

CONTRATANTE: {{cliente_nome}}
E-mail: {{cliente_email}}
Telefone: {{cliente_telefone}}
{{#cliente_endereco}}Endereço: {{cliente_endereco}}{{/cliente_endereco}}

CONTRATADO: {{prestador_nome}}
E-mail: {{prestador_email}}
Telefone: {{prestador_telefone}}

OBJETO DO CONTRATO:
Prestação de serviços fotográficos para {{tipo_evento}}.

DETALHES DO SERVIÇO:
- Data do evento: {{data_evento}}
- Local: {{local_evento}}
- Horário: {{horario_inicio}} às {{horario_fim}}
- Tipo de cobertura: {{tipo_cobertura}}

VALOR E FORMA DE PAGAMENTO:
Valor total: R$ {{valor_total}}
Forma de pagamento: {{forma_pagamento}}
{{#sinal}}Sinal: R$ {{sinal}} - Vencimento: {{vencimento_sinal}}{{/sinal}}

ENTREGÁVEIS:
- {{quantidade_fotos}} fotos editadas em alta resolução
- Galeria online por {{prazo_galeria}} dias
- {{#album}}Álbum físico{{/album}}
- Prazo de entrega: {{prazo_entrega}} dias úteis

DIREITOS DE USO:
{{direitos_uso}}

O presente contrato é válido a partir de {{data_assinatura}} e tem validade até a conclusão dos serviços.',

'[
  {"key": "cliente_nome", "label": "Nome do Cliente", "type": "text", "required": true},
  {"key": "cliente_email", "label": "E-mail do Cliente", "type": "email", "required": true},
  {"key": "cliente_telefone", "label": "Telefone do Cliente", "type": "text"},
  {"key": "cliente_endereco", "label": "Endereço do Cliente", "type": "text"},
  {"key": "prestador_nome", "label": "Nome do Prestador", "type": "text", "required": true},
  {"key": "prestador_email", "label": "E-mail do Prestador", "type": "email", "required": true},
  {"key": "prestador_telefone", "label": "Telefone do Prestador", "type": "text"},
  {"key": "tipo_evento", "label": "Tipo de Evento", "type": "select", "options": ["Casamento", "Formatura", "Evento Corporativo", "Ensaio"], "required": true},
  {"key": "data_evento", "label": "Data do Evento", "type": "date", "required": true},
  {"key": "local_evento", "label": "Local do Evento", "type": "text", "required": true},
  {"key": "horario_inicio", "label": "Horário de Início", "type": "time", "required": true},
  {"key": "horario_fim", "label": "Horário de Término", "type": "time", "required": true},
  {"key": "tipo_cobertura", "label": "Tipo de Cobertura", "type": "select", "options": ["Básica", "Completa", "Premium"], "required": true},
  {"key": "valor_total", "label": "Valor Total", "type": "currency", "required": true},
  {"key": "forma_pagamento", "label": "Forma de Pagamento", "type": "text", "required": true},
  {"key": "sinal", "label": "Valor do Sinal", "type": "currency"},
  {"key": "vencimento_sinal", "label": "Vencimento do Sinal", "type": "date"},
  {"key": "quantidade_fotos", "label": "Quantidade de Fotos", "type": "number", "required": true},
  {"key": "prazo_galeria", "label": "Prazo Galeria Online (dias)", "type": "number", "default": 30},
  {"key": "album", "label": "Inclui Álbum Físico", "type": "boolean"},
  {"key": "prazo_entrega", "label": "Prazo de Entrega (dias)", "type": "number", "required": true},
  {"key": "direitos_uso", "label": "Direitos de Uso", "type": "textarea", "required": true},
  {"key": "data_assinatura", "label": "Data de Assinatura", "type": "date", "required": true}
]'::jsonb, true, true),

('Licenciamento de Imagem', 'Contrato para uso de imagens e direitos autorais', 'licensing',
'CONTRATO DE LICENCIAMENTO DE IMAGEM

LICENCIANTE (Proprietário dos Direitos):
Nome: {{licenciante_nome}}
E-mail: {{licenciante_email}}
{{#licenciante_cpf}}CPF: {{licenciante_cpf}}{{/licenciante_cpf}}

LICENCIADO (Usuário da Imagem):
Nome/Empresa: {{licenciado_nome}}
E-mail: {{licenciado_email}}
{{#licenciado_cnpj}}CNPJ: {{licenciado_cnpj}}{{/licenciado_cnpj}}

DESCRIÇÃO DAS IMAGENS:
{{descricao_imagens}}

TIPO DE LICENÇA: {{tipo_licenca}}

DIREITOS CONCEDIDOS:
- Uso: {{tipo_uso}}
- Território: {{territorio}}
- Prazo: {{prazo_uso}}
- Exclusividade: {{exclusividade}}

RESTRIÇÕES:
{{restricoes}}

VALOR E PAGAMENTO:
Valor da licença: R$ {{valor_licenca}}
Forma de pagamento: {{forma_pagamento}}

CRÉDITOS:
{{creditos_obrigatorios}}

Este contrato é válido a partir de {{data_inicio}} até {{data_fim}}.',

'[
  {"key": "licenciante_nome", "label": "Nome do Licenciante", "type": "text", "required": true},
  {"key": "licenciante_email", "label": "E-mail do Licenciante", "type": "email", "required": true},
  {"key": "licenciante_cpf", "label": "CPF do Licenciante", "type": "text"},
  {"key": "licenciado_nome", "label": "Nome/Empresa Licenciado", "type": "text", "required": true},
  {"key": "licenciado_email", "label": "E-mail do Licenciado", "type": "email", "required": true},
  {"key": "licenciado_cnpj", "label": "CNPJ do Licenciado", "type": "text"},
  {"key": "descricao_imagens", "label": "Descrição das Imagens", "type": "textarea", "required": true},
  {"key": "tipo_licenca", "label": "Tipo de Licença", "type": "select", "options": ["Uso Simples", "Uso Exclusivo", "Cessão Total"], "required": true},
  {"key": "tipo_uso", "label": "Tipo de Uso", "type": "select", "options": ["Comercial", "Editorial", "Promocional", "Institucional"], "required": true},
  {"key": "territorio", "label": "Território", "type": "select", "options": ["Nacional", "Internacional", "Regional"], "required": true},
  {"key": "prazo_uso", "label": "Prazo de Uso", "type": "text", "required": true},
  {"key": "exclusividade", "label": "Exclusividade", "type": "select", "options": ["Sim", "Não"], "required": true},
  {"key": "restricoes", "label": "Restrições", "type": "textarea"},
  {"key": "valor_licenca", "label": "Valor da Licença", "type": "currency", "required": true},
  {"key": "forma_pagamento", "label": "Forma de Pagamento", "type": "text", "required": true},
  {"key": "creditos_obrigatorios", "label": "Créditos Obrigatórios", "type": "text", "required": true},
  {"key": "data_inicio", "label": "Data de Início", "type": "date", "required": true},
  {"key": "data_fim", "label": "Data de Término", "type": "date", "required": true}
]'::jsonb, true, true);

-- =======================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =======================

COMMENT ON TABLE user_profiles IS 'Perfis de usuário com integração FinanceFlow';
COMMENT ON TABLE contracts IS 'Contratos principais com assinatura digital jurídica';
COMMENT ON TABLE digital_certificates IS 'Certificados digitais para validação jurídica';
COMMENT ON TABLE contract_events IS 'Log completo de auditoria para rastreabilidade jurídica';
COMMENT ON TABLE webhooks IS 'Sistema de webhooks para integração com FinanceFlow e outros sistemas';
COMMENT ON COLUMN contracts.signature_data IS 'Dados da assinatura digital incluindo hash, geolocalização e metadados de segurança jurídica';
COMMENT ON COLUMN contracts.finance_flow_contract_id IS 'ID do contrato no sistema FinanceFlow para sincronização';

-- =======================
-- FUNÇÕES PARA INTEGRAÇÃO FINANCEFLOW
-- =======================

-- Função para sincronizar contrato com FinanceFlow
CREATE OR REPLACE FUNCTION sync_contract_with_financeflow(contract_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  contract_data RECORD;
  client_data RECORD;
  user_data RECORD;
  result JSONB;
BEGIN
  -- Buscar dados do contrato
  SELECT c.*, cl.name as client_name, cl.email as client_email, cl.cpf_cnpj
  INTO contract_data, client_data
  FROM contracts c
  JOIN clients cl ON c.client_id = cl.id
  WHERE c.id = contract_uuid;
  
  -- Buscar dados do usuário
  SELECT finance_flow_user_id, finance_flow_api_key
  INTO user_data
  FROM user_profiles
  WHERE id = contract_data.user_id;
  
  -- Aqui seria feita a chamada HTTP para o FinanceFlow
  -- Por enquanto, retornamos um mock
  result := jsonb_build_object(
    'success', true,
    'finance_flow_contract_id', gen_random_uuid(),
    'synced_at', NOW()
  );
  
  -- Atualizar o contrato com o ID do FinanceFlow
  UPDATE contracts 
  SET finance_flow_contract_id = (result->>'finance_flow_contract_id')::UUID
  WHERE id = contract_uuid;
  
  RETURN result;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Permissões para funções
GRANT EXECUTE ON FUNCTION sync_contract_with_financeflow(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_contracts() TO service_role;

-- =======================
-- POLÍTICAS PARA ASSINATURA PÚBLICA
-- =======================

-- Permitir que qualquer pessoa visualize contratos para assinatura (com token)
CREATE POLICY "Anyone can view contract for signing" ON contracts
  FOR SELECT USING (
    signature_token IS NOT NULL AND 
    status = 'sent' AND 
    expires_at > NOW()
  );

-- Permitir que qualquer pessoa assine contratos (com token válido)
CREATE POLICY "Anyone can sign contracts with valid token" ON contracts
  FOR UPDATE USING (
    signature_token IS NOT NULL AND 
    status = 'sent' AND 
    expires_at > NOW()
  );

-- =======================
-- CONFIGURAÇÕES FINAIS
-- =======================

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE contract_events;

-- Criar função para notificação em tempo real
CREATE OR REPLACE FUNCTION notify_contract_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'contract_update',
    json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    )::text
  );
  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ language 'plpgsql';

-- Trigger para notificações em tempo real
CREATE TRIGGER notify_contract_changes
  AFTER INSERT OR UPDATE OR DELETE ON contracts
  FOR EACH ROW EXECUTE FUNCTION notify_contract_update();
