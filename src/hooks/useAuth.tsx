import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';

const DEPLOY_VERSION = '1.0.7';

// Singleton para controlar a inicialização global
let globalInitialized = false;
let globalInitializing = false;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const initialized = useRef(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Prevenir múltiplas inicializações
    if (initialized.current || globalInitialized || globalInitializing) {
      return;
    }

    initialized.current = true;
    globalInitializing = true;

    // Check for version update
    const lastVersion = localStorage.getItem('deploy_version');
    if (lastVersion && lastVersion !== DEPLOY_VERSION) {
      console.log('Nova versão detectada, limpando cache...');
      localStorage.clear();
      sessionStorage.clear();
    }
    localStorage.setItem('deploy_version', DEPLOY_VERSION);

    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        
        // Verificar se há um código OAuth na URL
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        
        if (authCode) {
          console.log('Código OAuth detectado, processando...');
          // Limpar a URL sem recarregar a página
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          if (mounted) {
            setInitializing(false);
            setLoading(false);
            globalInitializing = false;
          }
          return;
        }
        
        if (mounted) {
          console.log('Sessão obtida:', session ? 'ativa' : 'inativa');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Se há sessão e usuário, garantir que o perfil existe
          if (session?.user) {
            await ensureUserProfile(session.user);
          }
          
          setInitializing(false);
          setLoading(false);
          globalInitializing = false;
          globalInitialized = true;
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setInitializing(false);
          setLoading(false);
          globalInitializing = false;
        }
      }
    };

    // Configurar listener de mudanças de auth apenas uma vez
    if (!subscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          
          console.log('Auth state changed:', event, session ? 'com sessão' : 'sem sessão');
          
          try {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (event === 'SIGNED_IN' && session?.user) {
              console.log('Usuário logado, criando perfil se necessário...');
              await ensureUserProfile(session.user);
              
              // Limpar parâmetros OAuth da URL após login bem-sucedido
              const url = new URL(window.location.href);
              if (url.searchParams.has('code') || url.searchParams.has('state')) {
                url.searchParams.delete('code');
                url.searchParams.delete('state');
                window.history.replaceState({}, document.title, url.pathname);
              }
            }
            
            if (event === 'SIGNED_OUT') {
              console.log('Usuário deslogado');
              setSession(null);
              setUser(null);
              globalInitialized = false;
            }
          } catch (error) {
            console.error('Erro no processamento de auth state change:', error);
          }
        }
      );

      subscriptionRef.current = subscription;
    }

    initializeAuth();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Verificando perfil do usuário:', user.id);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', fetchError);
        return;
      }

      if (!existingProfile) {
        console.log('Criando novo perfil para o usuário');
        const profileData = {
          id: user.id,
          name: user.user_metadata?.name || 
                user.user_metadata?.full_name || 
                user.email?.split('@')[0] || 
                'Usuário',
          email: user.email!,
          phone: user.user_metadata?.phone || '',
          company_name: user.user_metadata?.company || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          has_contratpro: false,
          contracts_count: 0,
          contracts_limit: 5
        };

        const { error: insertError } = await supabase
          .from('user_profiles')
          .upsert(profileData, { onConflict: 'id' });
          
        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
        } else {
          console.log('Perfil criado com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
  };

  const signUp = async (email: string, password: string, userData?: { name?: string }) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });
      
      setLoading(false);
      return { data, error };
    } catch (error) {
      setLoading(false);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      setLoading(false);
      return { data, error };
    } catch (error) {
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
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      setLoading(false);
      return { data, error };
    } catch (error) {
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      console.log('Fazendo logout...');
      
      // Limpar storage local
      localStorage.clear();
      sessionStorage.clear();
      
      const { error } = await supabase.auth.signOut();
      
      setUser(null);
      setSession(null);
      setLoading(false);
      globalInitialized = false;
      
      // Redirecionar para login após logout
      window.location.href = '/login';
      
      return { error };
    } catch (error) {
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
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  };

  const updateProfile = async (updates: { 
    name?: string; 
    phone?: string; 
    company_name?: string;
    avatar_url?: string;
  }) => {
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

  const incrementContractCount = async () => {
    if (!user) return { error: new Error('Usuário não autenticado') };

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('contracts_count')
      .eq('id', user.id)
      .single();

    if (fetchError) return { error: fetchError };

    const newCount = (profile.contracts_count || 0) + 1;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ contracts_count: newCount })
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  };

  return {
    user,
    session,
    loading,
    initializing,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getUserProfile,
    incrementContractCount
  };
};
