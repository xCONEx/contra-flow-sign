
// Tipos para a API REST do ContratPro

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  plan_type: 'free' | 'premium';
  finance_flow_user_id?: string; // Para integração com FinanceFlow
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  cpf_cnpj?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template_content: string;
  variables: TemplateVariable[];
  category: 'service' | 'licensing' | 'rights' | 'custom';
  is_active: boolean;
  created_at: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[]; // Para campos do tipo select
}

export interface Contract {
  id: string;
  user_id: string;
  client_id: string;
  template_id?: string;
  title: string;
  description?: string;
  content: string;
  value?: number;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
  sent_at?: string;
  signed_at?: string;
  expires_at?: string;
  pdf_url?: string;
  signature_data?: SignatureData;
}

export interface SignatureData {
  signer_name: string;
  signer_email: string;
  signed_at: string;
  ip_address: string;
  user_agent: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  signature_hash: string;
}

export interface ContractEvent {
  id: string;
  contract_id: string;
  event_type: 'created' | 'sent' | 'viewed' | 'signed' | 'expired' | 'cancelled';
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  contract_id?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  success: boolean;
}

// API Request types
export interface CreateContractRequest {
  client_id: string;
  template_id?: string;
  title: string;
  description?: string;
  content: string;
  value?: number;
  variables?: Record<string, any>;
}

export interface SendContractRequest {
  contract_id: string;
  expires_in_days?: number;
  custom_message?: string;
}

export interface SignContractRequest {
  contract_id: string;
  signature_token: string;
  signer_data: {
    name: string;
    email: string;
    ip_address: string;
    user_agent: string;
    geolocation?: {
      latitude: number;
      longitude: number;
    };
  };
}

// Webhook types para integração com FinanceFlow
export interface WebhookPayload {
  event: 'contract.created' | 'contract.sent' | 'contract.signed' | 'contract.expired';
  contract_id: string;
  user_id: string;
  timestamp: string;
  data: Contract;
}
