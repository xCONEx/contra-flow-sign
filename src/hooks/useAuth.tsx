import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão atual
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
        }
        
        console.log('Initial session:', session);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erro na inicialização da sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Criar perfil do usuário se for um novo registro
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Verificando perfil do usuário:', user.id);
      
      // Verificar se o perfil já existe
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Perfil existente:', existingProfile, 'Erro:', fetchError);

      // Se não existe perfil, criar um novo
      if (!existingProfile && (!fetchError || fetchError.code === 'PGRST116')) {
        console.log('Criando novo perfil para:', user.id);
        
        const profileData = {
          id: user.id,
          name: user.user_metadata?.name || 
                user.user_metadata?.full_name || 
                user.email?.split('@')[0] || 
                'Usuário',
          email: user.email!,
          has_contratpro: false
        };

        console.log('Dados do perfil:', profileData);

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(profileData);

        if (insertError) {
          console.error('Erro ao criar perfil do usuário:', insertError);
        } else {
          console.log('Perfil criado com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/criar perfil:', error);
    }
  };

  const signUp = async (email: string, password: string, userData?: { name?: string }) => {
    setLoading(true);
    
    try {
      console.log('Iniciando cadastro para:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      console.log('Resultado do cadastro:', data, error);
      
      setLoading(false);
      return { data, error };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log('Iniciando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Resultado do login:', data?.user?.id, error);
      
      setLoading(false);
      return { data, error };
    } catch (error) {
      console.error('Erro no login:', error);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      console.log('Login com provider:', provider, data, error);
      
      setLoading(false);
      return { data, error };
    } catch (error) {
      console.error('Erro no login com provider:', error);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      console.log('Iniciando logout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
      return { error };
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      setLoading(false);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    return { data, error };
  };

  const updateProfile = async (updates: { name?: string; phone?: string; company_name?: string }) => {
    if (!user) return { error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  };

  const getUserProfile = async () => {
    if (!user) return { data: null, error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getUserProfile
  };
};
