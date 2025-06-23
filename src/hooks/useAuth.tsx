
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, userData?: { name?: string }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: Provider) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  updateProfile: (updates: any) => Promise<any>;
  getUserProfile: () => Promise<any>;
  incrementContractCount: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Flag global para evitar múltiplas inicializações
let isInitialized = false;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (isInitialized) return;
    isInitialized = true;

    console.log('🔐 Inicializando sistema de autenticação...');

    const initAuth = async () => {
      try {
        // Limpar parâmetros OAuth da URL se existirem
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('code') || urlParams.get('access_token')) {
          console.log('🔗 Limpando parâmetros OAuth da URL...');
          window.history.replaceState({}, '', window.location.pathname);
        }

        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error && !error.message.includes('Invalid Refresh Token')) {
          console.error('❌ Erro ao obter sessão:', error);
        }

        console.log('📋 Sessão obtida:', session ? 'ativa' : 'inativa');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await createUserProfile(session.user);
        }

      } catch (error) {
        console.error('❌ Erro na inicialização da autenticação:', error);
      } finally {
        setInitializing(false);
        console.log('✅ Sistema de autenticação inicializado');
      }
    };

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Mudança de autenticação:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          await createUserProfile(session.user);
        }
      }
    );

    initAuth();

    return () => {
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
          console.log('✅ Perfil de usuário criado');
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

  const value = {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
