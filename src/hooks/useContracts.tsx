
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Contract {
  id: string;
  title: string;
  client_id: string;
  content: string;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled';
  total_value?: number;
  due_date?: string;
  created_at: string;
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

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar contratos",
        description: error.message,
        variant: "destructive"
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
        .insert([{ ...contractData, user_id: user.id }])
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
        .select()
        .single();

      if (error) throw error;

      // Aqui você pode integrar com um serviço de email
      toast({
        title: "Contrato enviado!",
        description: `Contrato enviado para ${clientEmail} para assinatura.`
      });

      setContracts(prev => prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'sent' as const }
          : contract
      ));

      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao enviar contrato",
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
    contracts,
    loading,
    createContract,
    sendContractForSignature,
    refetch: fetchContracts
  };
};
