
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
    return this.request<Contract[]>(endpoint);
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
    return this.request<Client[]>(endpoint);
  }

  async createClient(data: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Client>> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Templates endpoints
  async getTemplates(): Promise<ApiResponse<ContractTemplate[]>> {
    return this.request<ContractTemplate[]>('/templates');
  }

  async getTemplate(id: string): Promise<ApiResponse<ContractTemplate>> {
    return this.request<ContractTemplate>(`/templates/${id}`);
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
    return this.request<Notification[]>(endpoint);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Integration with FinanceFlow
  async validateFinanceFlowPlan(financeFlowUserId: string): Promise<ApiResponse<{ has_premium: boolean }>> {
    return this.request<{ has_premium: boolean }>(`/integrations/financeflow/validate-plan`, {
      method: 'POST',
      body: JSON.stringify({ finance_flow_user_id: financeFlowUserId }),
    });
  }
}

export const contractApi = new ContractApiService();
export default contractApi;
