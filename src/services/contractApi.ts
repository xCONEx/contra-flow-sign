
// Service para integração com a API REST do ContratPro
import { 
  Contract, 
  Client, 
  ContractTemplate, 
  CreateContractRequest,
  SendContractRequest,
  SignContractRequest,
  ApiResponse,
  PaginatedResponse,
  ContractEvent,
  Notification
} from '@/types/api';

// Base URL será configurada via variável de ambiente
const API_BASE_URL = process.env.REACT_APP_CONTRATPRO_API_URL || 'https://api.contratpro.com/v1';

class ContractApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async requestPaginated<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<PaginatedResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Contracts endpoints
  async getContracts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    client_id?: string;
  }): Promise<PaginatedResponse<Contract>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/contracts${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.requestPaginated<Contract>(endpoint);
  }

  async getContract(id: string): Promise<ApiResponse<Contract>> {
    return this.request<Contract>(`/contracts/${id}`);
  }

  async createContract(data: CreateContractRequest): Promise<ApiResponse<Contract>> {
    return this.request<Contract>('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<ApiResponse<Contract>> {
    return this.request<Contract>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendContract(data: SendContractRequest): Promise<ApiResponse<Contract>> {
    return this.request<Contract>(`/contracts/${data.contract_id}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signContract(data: SignContractRequest): Promise<ApiResponse<Contract>> {
    return this.request<Contract>(`/contracts/${data.contract_id}/sign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteContract(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/contracts/${id}`, {
      method: 'DELETE',
    });
  }

  // PDF Operations
  async generateContractPdf(id: string): Promise<ApiResponse<{ pdf_url: string }>> {
    return this.request<{ pdf_url: string }>(`/contracts/${id}/generate-pdf`, {
      method: 'POST',
    });
  }

  async downloadContractPdf(id: string): Promise<Blob> {
    const url = `${this.baseURL}/contracts/${id}/download-pdf`;
    const headers = {
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
    };

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Digital Signature Operations
  async validateSignature(contractId: string): Promise<ApiResponse<{ valid: boolean; details: any }>> {
    return this.request<{ valid: boolean; details: any }>(`/contracts/${contractId}/validate-signature`);
  }

  async getDigitalCertificate(contractId: string): Promise<ApiResponse<{ certificate: string; verificationCode: string }>> {
    return this.request<{ certificate: string; verificationCode: string }>(`/contracts/${contractId}/certificate`);
  }

  // Clients endpoints
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Client>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/clients${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.requestPaginated<Client>(endpoint);
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`);
  }

  async createClient(data: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Client>> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Templates endpoints
  async getTemplates(): Promise<ApiResponse<ContractTemplate[]>> {
    return this.request<ContractTemplate[]>('/templates');
  }

  async getTemplate(id: string): Promise<ApiResponse<ContractTemplate>> {
    return this.request<ContractTemplate>(`/templates/${id}`);
  }

  async createTemplate(data: Omit<ContractTemplate, 'id' | 'created_at'>): Promise<ApiResponse<ContractTemplate>> {
    return this.request<ContractTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: Partial<ContractTemplate>): Promise<ApiResponse<ContractTemplate>> {
    return this.request<ContractTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  // Events endpoints
  async getContractEvents(contractId: string): Promise<ApiResponse<ContractEvent[]>> {
    return this.request<ContractEvent[]>(`/contracts/${contractId}/events`);
  }

  // Notifications endpoints
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.requestPaginated<Notification>(endpoint);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.request<void>('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  // Analytics endpoints
  async getContractAnalytics(params?: {
    period?: 'week' | 'month' | 'year';
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<{
    total_contracts: number;
    signed_contracts: number;
    pending_contracts: number;
    total_value: number;
    conversion_rate: number;
    monthly_data: Array<{
      month: string;
      contracts: number;
      value: number;
    }>;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/analytics/contracts${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Integration with FinanceFlow
  async validateFinanceFlowPlan(financeFlowUserId: string): Promise<ApiResponse<{ has_premium: boolean; plan_details: any }>> {
    return this.request<{ has_premium: boolean; plan_details: any }>(`/integrations/financeflow/validate-plan`, {
      method: 'POST',
      body: JSON.stringify({ finance_flow_user_id: financeFlowUserId }),
    });
  }

  async syncWithFinanceFlow(contractId: string): Promise<ApiResponse<{ synced: boolean }>> {
    return this.request<{ synced: boolean }>(`/integrations/financeflow/sync-contract`, {
      method: 'POST',
      body: JSON.stringify({ contract_id: contractId }),
    });
  }

  // Webhook management
  async registerWebhook(url: string, events: string[]): Promise<ApiResponse<{ webhook_id: string }>> {
    return this.request<{ webhook_id: string }>('/webhooks', {
      method: 'POST',
      body: JSON.stringify({ url, events }),
    });
  }

  async testWebhook(webhookId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/webhooks/${webhookId}/test`, {
      method: 'POST',
    });
  }
}

export const contractApi = new ContractApiService();
export default contractApi;
