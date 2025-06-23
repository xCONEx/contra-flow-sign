
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  Bell,
  Home,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Contratos', href: '/contracts' },
  { icon: Users, label: 'Clientes', href: '/clients' },
  { icon: PlusCircle, label: 'Novo Contrato', href: '/contracts/new' },
  { icon: BarChart3, label: 'Relatórios', href: '/reports' },
  { icon: Bell, label: 'Notificações', href: '/notifications' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

export const Sidebar = () => {
  const { signOut, user, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await getUserProfile();
        setUserProfile(data);
      }
    };
    
    fetchProfile();
  }, [user, getUserProfile]);

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const handleLogout = async () => {
    try {
      console.log('Tentando fazer logout...');
      await signOut();
      console.log('Logout concluído, redirecionando...');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      navigate('/login', { replace: true });
    }
  };

  const contractsCount = userProfile?.contracts_count || 0;
  const contractsLimit = userProfile?.contracts_limit || 5;
  const remainingContracts = Math.max(0, contractsLimit - contractsCount);

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform -translate-x-full lg:translate-x-0 transition-transform">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ContratPro</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
                  currentPath === item.href
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Plan Info */}
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Plano Gratuito</h4>
              <p className="text-xs text-blue-700">
                {remainingContracts} de {contractsLimit} contratos restantes
              </p>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all" 
                  style={{ width: `${(contractsCount / contractsLimit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.name || user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile?.company_name || 'Freelancer'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
