
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth Callback - Current URL:', window.location.href);
        
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Verificar se há erro na URL
        const urlError = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
        
        if (urlError) {
          console.error('Erro OAuth na URL:', {
            error: urlError,
            description: errorDescription,
            code: errorCode
          });
          
          let errorMessage = "Erro durante o login";
          
          if (errorDescription?.includes('Database error saving new user')) {
            errorMessage = "Erro no servidor. Tente fazer login novamente ou entre em contato com o suporte.";
          } else if (urlError === 'access_denied') {
            errorMessage = "Login cancelado pelo usuário.";
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription);
          }
          
          toast({
            title: "Erro no login",
            description: errorMessage,
            variant: "destructive"
          });
          
          // Limpar URL de erro e redirecionar
          window.history.replaceState({}, document.title, '/login');
          navigate('/login', { replace: true });
          return;
        }

        // Aguardar processamento do Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar sessão atual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          toast({
            title: "Erro no login",
            description: "Erro ao processar autenticação. Tente novamente.",
            variant: "destructive"
          });
          navigate('/login', { replace: true });
          return;
        }

        if (sessionData.session?.user) {
          console.log('Login realizado com sucesso:', sessionData.session.user.email);
          
          const userName = sessionData.session.user.user_metadata?.name || 
                          sessionData.session.user.user_metadata?.full_name || 
                          sessionData.session.user.email;
          
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${userName}!`
          });
          
          // Limpar URL e redirecionar
          window.history.replaceState({}, document.title, '/dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('Nenhuma sessão encontrada, redirecionando para login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Erro inesperado no callback OAuth:', error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro durante o login. Tente novamente.",
          variant: "destructive"
        });
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando login...</p>
          <p className="text-gray-400 text-sm mt-2">Aguarde enquanto validamos sua autenticação</p>
        </div>
      </div>
    );
  }

  return null;
};
