
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useStableData } from '@/hooks/useStableData';

export interface Contract {
  id: string;
  title: string;
  client_id: string;
  content: string;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled';
  total_value?: number;
  due_date?: string;
  created_at: string;
  sent_at?: string;
  signed_at?: string;
  client?: {
    name: string;
    email: string;
  };
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Use stable data para evitar recarregamento constante dos números
  const stableContracts = useStableData(contracts, 'contracts');

  const fetchContracts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(name, email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existe, não mostra erro
        if (error.code === 'PGRST116' || error.message.includes('relation "public.contracts" does not exist')) {
          console.log('Tabela contracts ainda não existe no Supabase');
          setContracts([]);
          return;
        }
        throw error;
      }
      setContracts(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar contratos:', error);
      toast({
        title: "Aviso",
        description: "Sistema ainda sendo configurado. As tabelas serão criadas automaticamente.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData: {
    title: string;
    client_id: string;
    content: string;
    total_value?: number;
    due_date?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert([{ 
          ...contractData, 
          user_id: user.id,
          status: 'draft'
        }])
        .select(`
          *,
          client:clients(name, email)
        `)
        .single();

      if (error) throw error;

      setContracts(prev => [data, ...prev]);
      toast({
        title: "Contrato criado com sucesso!",
        description: `${contractData.title} foi criado.`
      });

      return data;
    } catch (error: any) {
      console.error('Error creating contract:', error);
      toast({
        title: "Erro ao criar contrato",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const sendContractForSignature = async (contractId: string, clientEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select(`
          *,
          client:clients(name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Contrato enviado!",
        description: `Contrato enviado para ${clientEmail} para assinatura.`
      });

      setContracts(prev => prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'sent' as const, sent_at: new Date().toISOString() }
          : contract
      ));

      return data;
    } catch (error: any) {
      console.error('Error sending contract:', error);
      toast({
        title: "Erro ao enviar contrato",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const markContractAsSigned = async (contractId: string, signerInfo?: {
    signer_name: string;
    signer_email: string;
    ip_address?: string;
    user_agent?: string;
  }) => {
    try {
      // Atualizar o status do contrato
      const { error: contractError } = await supabase
        .from('contracts')
        .update({ 
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (contractError) throw contractError;

      // Se informações do assinante foram fornecidas, criar registro de assinatura
      if (signerInfo) {
        const { error: signatureError } = await supabase
          .from('signatures')
          .insert([{
            contract_id: contractId,
            signer_name: signerInfo.signer_name,
            signer_email: signerInfo.signer_email,
            signer_type: 'client',
            signature_method: 'electronic',
            ip_address: signerInfo.ip_address,
            user_agent: signerInfo.user_agent,
            signed_at: new Date().toISOString()
          }]);

        if (signatureError) {
          console.error('Erro ao registrar assinatura:', signatureError);
        }
      }

      // Criar notificação para o usuário
      if (user) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            contract_id: contractId,
            type: 'contract_signed',
            title: 'Contrato Assinado',
            message: 'Um contrato foi assinado com sucesso!'
          }]);

        if (notificationError) {
          console.error('Erro ao criar notificação:', notificationError);
        }
      }

      setContracts(prev => prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'signed' as const, signed_at: new Date().toISOString() }
          : contract
      ));

      toast({
        title: "Contrato assinado!",
        description: "O contrato foi marcado como assinado com sucesso."
      });

      return true;
    } catch (error: any) {
      console.error('Error marking contract as signed:', error);
      toast({
        title: "Erro ao marcar contrato como assinado",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateContractStatus = async (contractId: string, status: Contract['status']) => {
    try {
      const updateData: any = { status };
      
      if (status === 'signed') {
        updateData.signed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', contractId)
        .select(`
          *,
          client:clients(name, email)
        `)
        .single();

      if (error) throw error;

      setContracts(prev => prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, ...updateData }
          : contract
      ));

      return data;
    } catch (error: any) {
      console.error('Error updating contract status:', error);
      toast({
        title: "Erro ao atualizar contrato",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [user]);

  return {
    contracts: stableContracts,
    loading,
    createContract,
    sendContractForSignature,
    markContractAsSigned,
    updateContractStatus,
    refetch: fetchContracts
  };
};
