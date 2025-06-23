
-- ContratPro Database Schema
-- Suporte completo para contratos digitais com assinatura jurídica

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (integração com Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  plan_type VARCHAR(50) DEFAULT 'free',
  finance_flow_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  cpf_cnpj VARCHAR(20),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract templates table
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  category VARCHAR(50) DEFAULT 'custom',
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  value DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- PDF and digital signature
  pdf_url TEXT,
  signature_token VARCHAR(128) UNIQUE,
  signature_data JSONB,
  
  -- Metadata
  variables JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  -- Integrations
  finance_flow_id UUID,
  external_id VARCHAR(255),
  
  -- Indexes
  CONSTRAINT valid_signature_token CHECK (
    (status = 'sent' AND signature_token IS NOT NULL) OR 
    (status != 'sent')
  ),
  CONSTRAINT valid_signature_data CHECK (
    (status = 'signed' AND signature_data IS NOT NULL) OR 
    (status != 'signed')
  )
);

-- Contract events table (auditoria completa)
CREATE TABLE contract_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  action_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook logs table
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital certificates table
CREATE TABLE digital_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  certificate TEXT NOT NULL,
  verification_code VARCHAR(32) NOT NULL UNIQUE,
  issuer VARCHAR(255) DEFAULT 'ContratPro Digital Signature Authority',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '10 years',
  is_valid BOOLEAN DEFAULT true
);

-- API Keys table (para integrações)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(128) NOT NULL UNIQUE,
  permissions TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX idx_contracts_signature_token ON contracts(signature_token) WHERE signature_token IS NOT NULL;

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);

CREATE INDEX idx_contract_events_contract_id ON contract_events(contract_id);
CREATE INDEX idx_contract_events_created_at ON contract_events(created_at DESC);

CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_templates_category ON contract_templates(category);
CREATE INDEX idx_templates_active ON contract_templates(is_active);

-- Create RLS (Row Level Security) policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Users can view own contracts" ON contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" ON contracts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft contracts" ON contracts
  FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- RLS Policies for clients
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for contract events
CREATE POLICY "Users can view events of own contracts" ON contract_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_events.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for templates
CREATE POLICY "Users can view public templates" ON contract_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own templates" ON contract_templates
  FOR ALL USING (auth.uid() = user_id);

-- Functions for automation
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create contract events
CREATE OR REPLACE FUNCTION create_contract_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Evento de criação
  IF TG_OP = 'INSERT' THEN
    INSERT INTO contract_events (contract_id, event_type, description, user_id)
    VALUES (NEW.id, 'created', 'Contrato criado', NEW.user_id);
    RETURN NEW;
  END IF;
  
  -- Eventos de mudança de status
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO contract_events (contract_id, event_type, description, user_id)
    VALUES (
      NEW.id, 
      NEW.status, 
      CASE NEW.status
        WHEN 'sent' THEN 'Contrato enviado para assinatura'
        WHEN 'signed' THEN 'Contrato assinado digitalmente'
        WHEN 'expired' THEN 'Contrato expirado'
        WHEN 'cancelled' THEN 'Contrato cancelado'
        ELSE 'Status alterado para ' || NEW.status
      END,
      NEW.user_id
    );
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para eventos automáticos
CREATE TRIGGER contract_events_trigger
  AFTER INSERT OR UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION create_contract_event();

-- Function to expire contracts
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
  RETURN expired_count;
END;
$$ language 'plpgsql';

-- Seed data for templates
INSERT INTO contract_templates (name, description, template_content, variables, category, is_public) VALUES
('Prestação de Serviços - Fotografia', 'Modelo padrão para serviços fotográficos', 
'CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

Contratante: {{cliente_nome}}
E-mail: {{cliente_email}}

Contratado: {{prestador_nome}}
Serviço: {{tipo_servico}}
Valor: R$ {{valor}}
Data do evento: {{data_evento}}

O presente contrato tem por objeto a prestação de serviços fotográficos...', 
'[
  {"key": "cliente_nome", "label": "Nome do Cliente", "type": "text", "required": true},
  {"key": "cliente_email", "label": "E-mail do Cliente", "type": "text", "required": true},
  {"key": "prestador_nome", "label": "Nome do Prestador", "type": "text", "required": true},
  {"key": "tipo_servico", "label": "Tipo de Serviço", "type": "select", "options": ["Casamento", "Evento Corporativo", "Ensaio"], "required": true},
  {"key": "valor", "label": "Valor", "type": "number", "required": true},
  {"key": "data_evento", "label": "Data do Evento", "type": "date", "required": true}
]'::jsonb, 
'service', true),

('Licenciamento de Imagem', 'Contrato para uso de imagens e direitos autorais',
'CONTRATO DE LICENCIAMENTO DE IMAGEM

Licenciante: {{licenciante_nome}}
Licenciado: {{licenciado_nome}}

Imagens: {{descricao_imagens}}
Uso permitido: {{tipo_uso}}
Prazo: {{prazo_uso}}
Valor: R$ {{valor}}

O presente contrato concede licença de uso das imagens especificadas...',
'[
  {"key": "licenciante_nome", "label": "Nome do Licenciante", "type": "text", "required": true},
  {"key": "licenciado_nome", "label": "Nome do Licenciado", "type": "text", "required": true},
  {"key": "descricao_imagens", "label": "Descrição das Imagens", "type": "text", "required": true},
  {"key": "tipo_uso", "label": "Tipo de Uso", "type": "select", "options": ["Comercial", "Editorial", "Promocional"], "required": true},
  {"key": "prazo_uso", "label": "Prazo de Uso", "type": "text", "required": true},
  {"key": "valor", "label": "Valor", "type": "number", "required": true}
]'::jsonb,
'licensing', true);

-- Create cron job for expiring contracts (requires pg_cron extension)
-- SELECT cron.schedule('expire-contracts', '0 1 * * *', 'SELECT expire_contracts();');

COMMENT ON TABLE contracts IS 'Tabela principal de contratos digitais com suporte a assinatura jurídica';
COMMENT ON TABLE contract_events IS 'Log completo de eventos para auditoria e rastreabilidade';
COMMENT ON TABLE digital_certificates IS 'Certificados digitais para validação jurídica das assinaturas';
COMMENT ON COLUMN contracts.signature_data IS 'Dados da assinatura digital incluindo hash, geolocalização e metadados de segurança';
COMMENT ON COLUMN contracts.signature_token IS 'Token único e temporário para processo de assinatura';
