
import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute - Loading:', loading, 'User:', !!user, 'RequireAuth:', requireAuth);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se requer autenticação e usuário não está logado
  if (requireAuth && !user) {
    console.log('Redirecionando para login - usuário não autenticado');
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Se não requer autenticação e usuário está logado (ex: páginas de login)
  if (!requireAuth && user) {
    console.log('Redirecionando para dashboard - usuário já autenticado');
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
