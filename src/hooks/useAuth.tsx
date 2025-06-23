
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';

const DEPLOY_VERSION = '1.0.6';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check for version update
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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setInitializing(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setInitializing(false);
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
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

        await supabase
          .from('user_profiles')
          .upsert(profileData, { onConflict: 'id' });
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
          redirectTo: `${window.location.origin}/`
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
      localStorage.clear();
      sessionStorage.clear();
      
      const { error } = await supabase.auth.signOut();
      
      setUser(null);
      setSession(null);
      setLoading(false);
      
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
