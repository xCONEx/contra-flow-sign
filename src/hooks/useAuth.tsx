
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';

// Versão do deploy para forçar logout em atualizações
const DEPLOY_VERSION = '1.0.2';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se houve atualização do deploy
    const lastVersion = localStorage.getItem('deploy_version');
    if (lastVersion && lastVersion !== DEPLOY_VERSION) {
      console.log('Nova versão detectada, forçando logout...');
      localStorage.clear();
      sessionStorage.clear();
      supabase.auth.signOut();
    }
    localStorage.setItem('deploy_version', DEPLOY_VERSION);

    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
        }
        
        if (mounted) {
          console.log('Initial session:', session?.user?.id || 'null');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização da sessão:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id || 'null');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setLoading(false);
        }

        // Criar perfil do usuário se for um novo registro
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user);
          setLoading(false);
        }

        if (event === 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Verificando perfil do usuário:', user.id);
      
      // Usar RPC ou função que bypass RLS ou ajustar para usar auth.uid()
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Perfil existente:', existingProfile, 'Erro:', fetchError);

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

        // Usar upsert para evitar problemas de RLS
        const { error: insertError } = await supabase
          .from('user_profiles')
          .upsert(profileData, { onConflict: 'id' })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar perfil do usuário:', insertError);
          // Tentar novamente com insert simples após um delay
          setTimeout(async () => {
            const { error: retryError } = await supabase
              .from('user_profiles')
              .insert(profileData);
            
            if (retryError) {
              console.error('Erro na segunda tentativa de criar perfil:', retryError);
            } else {
              console.log('Perfil criado na segunda tentativa');
            }
          }, 1000);
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
      
      // Limpar storage local
      localStorage.clear();
      sessionStorage.clear();
      
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
