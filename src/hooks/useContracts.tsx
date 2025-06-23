
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Contract {
  id: string;
  user_id: string;
  title: string;
  content: string;
  client_name?: string;
  client_email?: string;
  value?: number;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  signature_token?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, incrementContractCount } = useAuth();

  const fetchContracts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContracts(data || []);
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData: {
    title: string;
    content: string;
    client_name?: string;
    client_email?: string;
    value?: number;
  }) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        title: contractData.title,
        content: contractData.content,
        client_name: contractData.client_name,
        client_email: contractData.client_email,
        value: contractData.value,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Incrementar contador apenas quando criar um novo contrato
    await incrementContractCount();
    
    await fetchContracts();
    return data;
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchContracts();
    return data;
  };

  const deleteContract = async (id: string) => {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchContracts();
  };

  const sendContract = async (id: string, expiresInDays: number = 30) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    const signatureToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return updateContract(id, {
      status: 'sent',
      signature_token: signatureToken,
      expires_at: expiresAt.toISOString()
    });
  };

  useEffect(() => {
    fetchContracts();
  }, [user]);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    sendContract
  };
};
