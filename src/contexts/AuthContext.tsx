
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        
        // Limpar localStorage se necessário (tokens corrompidos)
        if (localStorage.getItem('sb-tmxbgvlijandyvjwstsx-auth-token')) {
          const storedData = localStorage.getItem('sb-tmxbgvlijandyvjwstsx-auth-token');
          try {
            const parsed = JSON.parse(storedData || '{}');
            if (!parsed.access_token || !parsed.refresh_token) {
              console.log('Tokens inválidos encontrados, limpando localStorage');
              localStorage.removeItem('sb-tmxbgvlijandyvjwstsx-auth-token');
            }
          } catch (e) {
            console.log('Dados corrompidos no localStorage, limpando');
            localStorage.removeItem('sb-tmxbgvlijandyvjwstsx-auth-token');
          }
        }

        // Configurar listener primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (!mounted) return;

            if (session?.user) {
              setSession(session);
              setUser(session.user);
            } else {
              setSession(null);
              setUser(null);
            }
            
            setLoading(false);
          }
        );

        // Verificar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          // Se há erro na sessão, limpar tudo
          localStorage.removeItem('sb-tmxbgvlijandyvjwstsx-auth-token');
          setSession(null);
          setUser(null);
        } else if (session?.user) {
          console.log('Sessão encontrada:', session.user.email);
          setSession(session);
          setUser(session.user);
        } else {
          console.log('Nenhuma sessão ativa');
          setSession(null);
          setUser(null);
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentando fazer login com:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      if (data.user) {
        console.log('Login bem-sucedido:', data.user.email);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!"
        });
      }
    } catch (error: any) {
      console.error('Erro completo no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('Tentando criar conta para:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        throw error;
      }

      console.log('Cadastro realizado:', data.user?.email);
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta."
      });
    } catch (error: any) {
      console.error('Erro completo no cadastro:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Iniciando login com Google...');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Erro no login com Google:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Erro completo no login com Google:', error);
      toast({
        title: "Erro no login com Google",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Fazendo logout...');
      await supabase.auth.signOut();
      
      // Limpar localStorage manualmente
      localStorage.removeItem('sb-tmxbgvlijandyvjwstsx-auth-token');
      
      setSession(null);
      setUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      loading, 
      signOut, 
      signIn, 
      signUp, 
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
