
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      console.log('🔐 Inicializando autenticação...');

      try {
        // Processar OAuth se presente
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('code')) {
          console.log('🔗 OAuth detectado, limpando URL...');
          window.history.replaceState({}, '', window.location.pathname);
        }

        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
        }

        if (mountedRef.current) {
          setSession(session);
          setUser(session?.user ?? null);
          setInitializing(false);
          
          if (session?.user) {
            await createUserProfile(session.user);
          }
        }

        console.log('✅ Autenticação inicializada:', session ? 'logado' : 'não logado');

      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        if (mountedRef.current) {
          setInitializing(false);
        }
      }
    };

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth mudou:', event);
        
        if (mountedRef.current) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          if (event === 'SIGNED_IN' && session?.user) {
            await createUserProfile(session.user);
          }
        }
      }
    );

    initAuth();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            email: user.email!,
            phone: user.user_metadata?.phone || '',
            company_name: user.user_metadata?.company || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            has_contratpro: false,
            contracts_count: 0,
            contracts_limit: 5
          });

        if (error) {
          console.error('Erro ao criar perfil:', error);
        } else {
          console.log('✅ Perfil criado');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
    }
  };

  const signUp = async (email: string, password: string, userData?: { name?: string }) => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData || {} }
    });
    
    setLoading(false);
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    setLoading(false);
    return { data, error };
  };

  const signInWithProvider = async (provider: Provider) => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    
    localStorage.clear();
    sessionStorage.clear();
    
    const { error } = await supabase.auth.signOut();
    
    setUser(null);
    setSession(null);
    setLoading(false);
    
    window.location.href = '/login';
    
    return { error };
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
