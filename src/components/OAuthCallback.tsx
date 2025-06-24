
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
        console.log('Handling OAuth callback...');
        
        // Get the session from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Erro no login",
            description: "Erro ao processar login com Google. Tente novamente.",
            variant: "destructive"
          });
          navigate('/login', { replace: true });
          return;
        }

        if (data.session) {
          console.log('OAuth successful, redirecting to dashboard');
          // Clear the URL hash and redirect to dashboard
          window.history.replaceState({}, document.title, '/dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login', { replace: true });
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

    // Check if this is an OAuth callback by looking for hash fragments
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      handleOAuthCallback();
    } else {
      // If no OAuth tokens, just redirect to dashboard normally
      navigate('/dashboard', { replace: true });
    }
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
