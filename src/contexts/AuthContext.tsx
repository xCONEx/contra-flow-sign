
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle successful authentication
        if (event === 'SIGNED_IN' && session) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao ContratPro"
          })
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Logout realizado",
            description: "Até logo!"
          })
        }
      }
    )

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          console.log('Initial session:', session?.user?.email)
          if (mounted) {
            setSession(session)
            setUser(session?.user ?? null)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [toast])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        let errorMessage = error.message
        
        // Improve error messages for better UX
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login'
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive"
        })
      }
      
      return { error }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      
      // Use the current window location for redirect
      const redirectUrl = `${window.location.origin}/dashboard`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      })
      
      if (error) {
        let errorMessage = error.message
        
        // Improve error messages
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.'
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres'
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar sua conta"
        })
      }
      
      return { error }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro. Tente novamente.",
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      
      // Use the current window location for redirect
      const redirectUrl = `${window.location.origin}/dashboard`
      
      console.log('Attempting Google sign in with redirect to:', redirectUrl)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('Google sign in error:', error)
        let errorMessage = error.message
        
        if (error.message.includes('OAuth')) {
          errorMessage = 'Erro na autenticação com Google. Verifique as configurações.'
        }
        
        toast({
          title: "Erro no login com Google",
          description: errorMessage,
          variant: "destructive"
        })
      }
      
      return { error }
    } catch (error: any) {
      console.error('Unexpected Google sign in error:', error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login com Google. Tente novamente.",
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast({
          title: "Erro no logout",
          description: error.message,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o logout. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
