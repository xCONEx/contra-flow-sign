
import { useEffect } from 'react';
import { useAuth } from './useAuth';

// Hook para implementar medidas de segurança
export const useSecurity = () => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Detectar tentativas de XSS
    const detectXSS = () => {
      const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];

      const checkElement = (element: Element) => {
        const content = element.innerHTML;
        return suspiciousPatterns.some(pattern => pattern.test(content));
      };

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (checkElement(element)) {
                  console.warn('⚠️ Tentativa de XSS detectada');
                  element.remove();
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return observer;
    };

    // Detectar múltiplas tentativas de login
    const detectBruteForce = () => {
      const maxAttempts = 5;
      const timeWindow = 15 * 60 * 1000; // 15 minutos
      
      const getAttempts = () => {
        const stored = localStorage.getItem('login_attempts');
        return stored ? JSON.parse(stored) : [];
      };

      const addAttempt = () => {
        const attempts = getAttempts();
        const now = Date.now();
        
        // Remover tentativas antigas
        const recentAttempts = attempts.filter((attempt: number) => 
          now - attempt < timeWindow
        );
        
        recentAttempts.push(now);
        localStorage.setItem('login_attempts', JSON.stringify(recentAttempts));

        if (recentAttempts.length >= maxAttempts) {
          console.warn('⚠️ Muitas tentativas de login detectadas');
          // Bloquear temporariamente
          localStorage.setItem('blocked_until', (now + timeWindow).toString());
        }
      };

      const isBlocked = () => {
        const blockedUntil = localStorage.getItem('blocked_until');
        if (!blockedUntil) return false;
        
        const now = Date.now();
        if (now < parseInt(blockedUntil)) {
          return true;
        } else {
          localStorage.removeItem('blocked_until');
          return false;
        }
      };

      return { addAttempt, isBlocked };
    };

    // Verificar integridade da sessão
    const checkSessionIntegrity = () => {
      if (!user) return;

      const interval = setInterval(async () => {
        try {
          // Verificar se a sessão ainda é válida no servidor
          const response = await fetch('/api/verify-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }).catch(() => null);

          if (!response || !response.ok) {
            console.warn('⚠️ Sessão inválida detectada, fazendo logout');
            signOut();
          }
        } catch (error) {
          console.error('Erro na verificação de integridade:', error);
        }
      }, 5 * 60 * 1000); // Verificar a cada 5 minutos

      return interval;
    };

    // Proteger contra ataques de timing
    const protectTiming = () => {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const start = Date.now();
        const result = await originalFetch(...args);
        const duration = Date.now() - start;
        
        // Adicionar delay mínimo para prevenir timing attacks
        const minDelay = 100;
        if (duration < minDelay) {
          await new Promise(resolve => 
            setTimeout(resolve, minDelay - duration)
          );
        }
        
        return result;
      };

      return () => {
        window.fetch = originalFetch;
      };
    };

    // Implementar CSP via JavaScript (backup)
    const enforceCSP = () => {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://tmxbgvlijandyvjwstsx.supabase.co;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        connect-src 'self' https://tmxbgvlijandyvjwstsx.supabase.co wss://tmxbgvlijandyvjwstsx.supabase.co;
        frame-ancestors 'none';
      `.replace(/\s+/g, ' ').trim();
      
      document.head.appendChild(meta);
    };

    // Inicializar proteções
    const xssObserver = detectXSS();
    const bruteForce = detectBruteForce();
    const sessionInterval = checkSessionIntegrity();
    const timingProtection = protectTiming();
    
    // Aplicar CSP apenas em produção
    if (window.location.hostname !== 'localhost') {
      enforceCSP();
    }

    // Cleanup
    return () => {
      xssObserver?.disconnect();
      if (sessionInterval) clearInterval(sessionInterval);
      timingProtection?.();
    };
  }, [user, signOut]);

  return null;
};
