
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const useSecureNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const navigateToLogin = (from?: string) => {
    navigate('/login', { 
      state: { from: from || location.pathname },
      replace: true 
    })
  }

  const navigateToDashboard = () => {
    const from = location.state?.from?.pathname || '/dashboard'
    navigate(from, { replace: true })
  }

  const navigateToHome = () => {
    navigate('/', { replace: true })
  }

  const secureNavigate = (path: string, options?: { replace?: boolean }) => {
    // Se a rota requer autenticação e usuário não está logado
    const protectedRoutes = ['/dashboard']
    const requiresAuth = protectedRoutes.some(route => path.startsWith(route))
    
    if (requiresAuth && !user) {
      navigateToLogin(path)
      return
    }

    navigate(path, options)
  }

  return {
    navigateToLogin,
    navigateToDashboard,
    navigateToHome,
    secureNavigate,
    isAuthenticated: !!user
  }
}
