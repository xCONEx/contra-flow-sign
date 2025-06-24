
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
        console.log('OAuth Callback - Hash:', window.location.hash);
        
        // Aguardar um pouco para garantir que o Supabase processe a URL
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar se já existe uma sessão válida
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          toast({
            title: "Erro no login",
            description: "Erro ao processar login. Tente novamente.",
            variant: "destructive"
          });
          navigate('/login', { replace: true });
          return;
        }

        if (sessionData.session) {
          console.log('Sessão encontrada:', sessionData.session.user.email);
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${sessionData.session.user.user_metadata?.name || sessionData.session.user.email}!`
          });
          
          // Limpar a URL e redirecionar para o dashboard
          window.history.replaceState({}, document.title, '/dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('Nenhuma sessão encontrada após callback');
          
          // Tentar processar tokens manualmente se não houver sessão
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('Tentando definir sessão com tokens da URL...');
            
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('Erro ao definir sessão:', error);
              toast({
                title: "Erro no login",
                description: "Erro ao processar tokens de autenticação.",
                variant: "destructive"
              });
              navigate('/login', { replace: true });
            } else if (data.session) {
              console.log('Sessão definida com sucesso:', data.session.user.email);
              toast({
                title: "Login realizado com sucesso!",
                description: `Bem-vindo, ${data.session.user.user_metadata?.name || data.session.user.email}!`
              });
              
              // Limpar a URL e redirecionar para o dashboard
              window.history.replaceState({}, document.title, '/dashboard');
              navigate('/dashboard', { replace: true });
            } else {
              console.log('Falha ao definir sessão');
              navigate('/login', { replace: true });
            }
          } else {
            console.log('Nenhum token encontrado na URL');
            navigate('/login', { replace: true });
          }
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
