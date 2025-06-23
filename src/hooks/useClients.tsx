
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  cpf_cnpj?: string;
  type: 'person' | 'company';
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        ...clientData
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchClients();
    return data;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchClients();
    return data;
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchClients();
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};
