import { supabase } from '../../lib/supabase';
import { Contract, CreateContractRequest, SendContractRequest, SignContractRequest, ContractEvent } from '../../types/api';
import { digitalSignatureService } from './DigitalSignatureService';
import crypto from 'crypto';

export class ContractsService {
  async getContracts(params: {
    userId: string;
    page: number;
    limit: number;
    status?: string;
    clientId?: string;
  }) {
    let query = supabase
      .from('contracts')
      .select(`
        *,
        clients:client_id(*),
        templates:template_id(*)
      `, { count: 'exact' })
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.clientId) {
      query = query.eq('client_id', params.clientId);
    }

    const offset = (params.page - 1) * params.limit;
    const { data, error, count } = await query
      .range(offset, offset + params.limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / params.limit),
      },
    };
  }

  async getContractById(id: string, userId: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        clients:client_id(*),
        templates:template_id(*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async createContract(contractData: CreateContractRequest & { user_id: string }): Promise<Contract> {
    // Aplicar variáveis do template se especificado
    let content = contractData.content;
    if (contractData.template_id && contractData.variables) {
      content = await this.applyTemplateVariables(contractData.template_id, contractData.variables);
    }

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        ...contractData,
        content,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Registrar evento de criação
    await this.createContractEvent(data.id, 'created', 'Contrato criado');

    return data;
  }

  async updateContract(id: string, userId: string, updateData: Partial<Contract>): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async sendContract(id: string, userId: string, sendData: SendContractRequest): Promise<Contract | null> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (sendData.expires_in_days || 30));

    // Gerar token único para assinatura
    const signatureToken = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        signature_token: signatureToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Registrar evento de envio
    await this.createContractEvent(id, 'sent', 'Contrato enviado para assinatura', {
      expires_at: expiresAt.toISOString(),
      custom_message: sendData.custom_message,
    });

    return data;
  }

  async signContract(id: string, signData: SignContractRequest): Promise<Contract | null> {
    // Verificar token de assinatura
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('signature_token', signData.signature_token)
      .eq('status', 'sent')
      .single();

    if (fetchError || !contract) return null;

    // Verificar se não expirou
    if (new Date() > new Date(contract.expires_at)) {
      await this.updateContract(id, contract.user_id, { status: 'expired' });
      return null;
    }

    // Gerar assinatura digital
    const signatureHash = await digitalSignatureService.generateSignature({
      contractId: id,
      signerData: signData.signer_data,
      content: contract.content,
    });

    const signatureData = {
      signer_name: signData.signer_data.name,
      signer_email: signData.signer_data.email,
      signed_at: new Date().toISOString(),
      ip_address: signData.signer_data.ip_address,
      user_agent: signData.signer_data.user_agent,
      geolocation: signData.signer_data.geolocation,
      signature_hash: signatureHash,
    };

    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data: signatureData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar evento de assinatura
    await this.createContractEvent(id, 'signed', 'Contrato assinado digitalmente', {
      signer: signData.signer_data.name,
      signature_hash: signatureHash,
    });

    return data;
  }

  async deleteContract(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }

    return true;
  }

  async getContractEvents(contractId: string, userId: string): Promise<ContractEvent[]> {
    // Verificar se o usuário tem acesso ao contrato
    const contract = await this.getContractById(contractId, userId);
    if (!contract) return [];

    const { data, error } = await supabase
      .from('contract_events')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  async createContractEvent(
    contractId: string,
    eventType: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('contract_events')
      .insert({
        contract_id: contractId,
        event_type: eventType,
        description,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  async validatePremiumPlan(userId: string): Promise<boolean> {
    // Aqui seria feita a validação com o FinanceFlow
    // Por enquanto, retornamos true para permitir testes
    try {
      // Chamada para API do FinanceFlow para validar plano
      const response = await fetch(`${process.env.FINANCEFLOW_API_URL}/users/${userId}/plan`, {
        headers: {
          'Authorization': `Bearer ${process.env.FINANCEFLOW_API_KEY}`,
        },
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.plan === 'premium' || data.plan === 'enterprise';
    } catch (error) {
      console.error('Error validating premium plan:', error);
      return false;
    }
  }

  private async applyTemplateVariables(templateId: string, variables: Record<string, any>): Promise<string> {
    const { data: template, error } = await supabase
      .from('contract_templates')
      .select('template_content')
      .eq('id', templateId)
      .single();

    if (error) throw error;

    let content = template.template_content;

    // Substituir variáveis no formato {{variavel}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  }
}

export const contractsService = new ContractsService();
