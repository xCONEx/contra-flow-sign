
-- SQL para sistema de assinatura de contratos - ContratPro
-- Execute este código no Supabase SQL Editor

-- Função para marcar contrato como assinado
CREATE OR REPLACE FUNCTION mark_contract_as_signed(
  contract_id_param UUID,
  signer_name_param TEXT,
  signer_email_param TEXT,
  signer_ip_param INET DEFAULT NULL,
  signer_user_agent_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contract_user_id UUID;
  contract_title TEXT;
BEGIN
  -- Verificar se o contrato existe e obter informações
  SELECT user_id, title INTO contract_user_id, contract_title
  FROM contracts 
  WHERE id = contract_id_param;
  
  IF contract_user_id IS NULL THEN
    RAISE EXCEPTION 'Contrato não encontrado';
  END IF;

  -- Atualizar status do contrato para 'signed'
  UPDATE contracts 
  SET status = 'signed', 
      signed_at = NOW(),
      updated_at = NOW()
  WHERE id = contract_id_param;

  -- Registrar a assinatura
  INSERT INTO signatures (
    contract_id,
    signer_name,
    signer_email,
    signer_type,
    signature_method,
    ip_address,
    user_agent,
    signed_at
  ) VALUES (
    contract_id_param,
    signer_name_param,
    signer_email_param,
    'client',
    'electronic',
    signer_ip_param,
    signer_user_agent_param,
    NOW()
  );

  -- Criar notificação para o proprietário do contrato
  INSERT INTO notifications (
    user_id,
    contract_id,
    type,
    title,
    message,
    created_at
  ) VALUES (
    contract_user_id,
    contract_id_param,
    'contract_signed',
    'Contrato Assinado',
    'O contrato "' || contract_title || '" foi assinado com sucesso!'
  );

  -- Registrar no audit log
  INSERT INTO audit_logs (
    action,
    contract_id,
    user_id,
    details,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    'sign',
    contract_id_param,
    contract_user_id,
    jsonb_build_object(
      'signer_name', signer_name_param,
      'signer_email', signer_email_param,
      'signature_method', 'electronic'
    ),
    signer_ip_param,
    signer_user_agent_param,
    NOW()
  );

  RETURN TRUE;
END;
$$;

-- Função para obter estatísticas de contratos do usuário
CREATE OR REPLACE FUNCTION get_contract_stats(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_contracts', COUNT(*),
    'draft_contracts', COUNT(*) FILTER (WHERE status = 'draft'),
    'sent_contracts', COUNT(*) FILTER (WHERE status = 'sent'),
    'signed_contracts', COUNT(*) FILTER (WHERE status = 'signed'),
    'expired_contracts', COUNT(*) FILTER (WHERE status = 'expired'),
    'cancelled_contracts', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'total_value', COALESCE(SUM(total_value) FILTER (WHERE status = 'signed'), 0),
    'pending_value', COALESCE(SUM(total_value) FILTER (WHERE status IN ('draft', 'sent')), 0)
  ) INTO stats
  FROM contracts
  WHERE user_id = user_id_param;
  
  RETURN stats;
END;
$$;

-- Função para verificar contratos próximos ao vencimento
CREATE OR REPLACE FUNCTION check_expiring_contracts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contract_record RECORD;
BEGIN
  -- Buscar contratos que vencem em 7 dias
  FOR contract_record IN
    SELECT c.id, c.user_id, c.title, c.due_date, cl.name as client_name
    FROM contracts c
    JOIN clients cl ON c.client_id = cl.id
    WHERE c.status IN ('sent')
    AND c.due_date IS NOT NULL
    AND c.due_date <= CURRENT_DATE + INTERVAL '7 days'
    AND c.due_date > CURRENT_DATE
  LOOP
    -- Criar notificação de vencimento próximo
    INSERT INTO notifications (
      user_id,
      contract_id,
      type,
      title,
      message,
      created_at
    ) VALUES (
      contract_record.user_id,
      contract_record.id,
      'contract_expiring',
      'Contrato Próximo ao Vencimento',
      'O contrato "' || contract_record.title || '" com ' || contract_record.client_name || ' vence em breve (' || contract_record.due_date || ')'
    );
  END LOOP;

  -- Marcar contratos vencidos como expired
  UPDATE contracts 
  SET status = 'expired', updated_at = NOW()
  WHERE status IN ('sent') 
  AND due_date IS NOT NULL 
  AND due_date < CURRENT_DATE;
END;
$$;

-- Trigger para atualizar updated_at automaticamente em assinaturas
CREATE OR REPLACE FUNCTION update_signature_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.signed_at = NOW();
  RETURN NEW;
END;
$$;

-- View para relatórios de contratos
CREATE OR REPLACE VIEW contract_reports AS
SELECT 
  c.id,
  c.title,
  c.status,
  c.total_value,
  c.created_at,
  c.sent_at,
  c.signed_at,
  c.due_date,
  cl.name as client_name,
  cl.email as client_email,
  up.name as user_name,
  CASE 
    WHEN c.status = 'signed' THEN c.total_value
    ELSE 0 
  END as revenue,
  CASE 
    WHEN c.due_date IS NOT NULL AND c.due_date < CURRENT_DATE AND c.status IN ('sent') THEN true
    ELSE false 
  END as is_overdue,
  CASE 
    WHEN c.signed_at IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (c.signed_at - c.sent_at))/86400 
    ELSE NULL 
  END as days_to_sign
FROM contracts c
JOIN clients cl ON c.client_id = cl.id
JOIN user_profiles up ON c.user_id = up.id;

-- Políticas de segurança para as novas funções
ALTER FUNCTION mark_contract_as_signed(UUID, TEXT, TEXT, INET, TEXT) OWNER TO postgres;
ALTER FUNCTION get_contract_stats(UUID) OWNER TO postgres;
ALTER FUNCTION check_expiring_contracts() OWNER TO postgres;

-- Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION mark_contract_as_signed(UUID, TEXT, TEXT, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_stats(UUID) TO authenticated;
GRANT SELECT ON contract_reports TO authenticated;

-- RLS para a view de relatórios
CREATE POLICY "Users can view their own contract reports" ON contract_reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.id = contract_reports.id 
    AND contracts.user_id = auth.uid()
  )
);

-- Política RLS para signatures
CREATE POLICY "Users can view signatures of their contracts" ON signatures FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.id = signatures.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert signatures for their contracts" ON signatures FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.id = signatures.contract_id 
    AND contracts.user_id = auth.uid()
  )
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contracts_status_due_date ON contracts(status, due_date);
CREATE INDEX IF NOT EXISTS idx_signatures_contract_id ON signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_contract_id ON audit_logs(contract_id);

-- Exemplo de uso da função mark_contract_as_signed:
-- SELECT mark_contract_as_signed(
--   'uuid-do-contrato',
--   'Nome do Assinante', 
--   'email@exemplo.com',
--   '192.168.1.1'::inet,
--   'Mozilla/5.0...'
-- );

-- Exemplo de uso da função get_contract_stats:
-- SELECT get_contract_stats(auth.uid());
