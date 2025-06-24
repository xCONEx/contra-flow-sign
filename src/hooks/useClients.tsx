
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf_cnpj?: string;
  address?: string;
  created_at: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existe, não mostra erro
        if (error.code === 'PGRST116' || error.message.includes('relation "public.clients" does not exist')) {
          console.log('Tabela clients ainda não existe no Supabase');
          setClients([]);
          return;
        }
        throw error;
      }
      setClients(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Aviso",
        description: "Sistema ainda sendo configurado. As tabelas serão criadas automaticamente.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [data, ...prev]);
      toast({
        title: "Cliente criado com sucesso!",
        description: `${clientData.name} foi adicionado aos seus clientes.`
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    loading,
    createClient,
    refetch: fetchClients
  };
};
