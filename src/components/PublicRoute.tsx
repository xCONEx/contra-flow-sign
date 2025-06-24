
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const PublicRoute = ({ 
  children, 
  redirectTo = '/dashboard' 
}: PublicRouteProps) => {
  const { user, loading } = useAuth()

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

  // Se usuário está logado, redireciona para dashboard
  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
