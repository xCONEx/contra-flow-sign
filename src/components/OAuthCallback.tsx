
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('Handling OAuth callback...', window.location.hash);
        
        // Extract tokens from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Found OAuth tokens in URL, setting session...');
          
          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Erro no login",
              description: "Erro ao processar login com Google. Tente novamente.",
              variant: "destructive"
            });
            navigate('/login', { replace: true });
            return;
          }

          if (data.session) {
            console.log('Session set successfully, user:', data.session.user.email);
            toast({
              title: "Login realizado com sucesso!",
              description: "Bem-vindo ao ContratPro"
            });
            
            // Redirect to dashboard without hash in URL
            navigate('/dashboard', { replace: true });
          } else {
            console.log('No session created, redirecting to login');
            navigate('/login', { replace: true });
          }
        } else {
          console.log('No OAuth tokens found in URL');
          // Check if there's already a session
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('Existing session found, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('No session found, redirecting to login');
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Unexpected error in OAuth callback:', error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro durante o login. Tente novamente.",
          variant: "destructive"
        });
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando login...</p>
      </div>
    </div>
  );
};
