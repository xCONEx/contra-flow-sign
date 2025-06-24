import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Home,
  PlusCircle,
  Clock,
  CheckCircle,
  LogOut,
  User
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPanel } from "@/components/NotificationPanel";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import { useContracts } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { usePlans } from "@/contexts/PlansContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AppSidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { contracts } = useContracts();
  const { clients } = useClients();
  const { currentPlan, plans, getRemainingContracts } = usePlans();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const pendingContracts = contracts.filter(c => c.status === 'draft' || c.status === 'sent');
  const signedContracts = contracts.filter(c => c.status === 'signed');

  // Get current plan details
  const currentPlanDetails = plans.find(plan => plan.id === currentPlan.planType);
  const remainingContracts = getRemainingContracts();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      url: "/dashboard",
      count: null
    },
    {
      id: "contracts",
      label: "Contratos",
      icon: FileText,
      url: "/contracts",
      count: contracts.length
    },
    {
      id: "clients",
      label: "Clientes",
      icon: Users,
      url: "/clients",
      count: clients.length
    },
    {
      id: "pending",
      label: "Pendentes",
      icon: Clock,
      url: "/pending",
      count: pendingContracts.length
    },
    {
      id: "signed",
      label: "Assinados",
      icon: CheckCircle,
      url: "/signed",
      count: signedContracts.length
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      url: "/analytics",
      count: null
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      url: "/settings",
      count: null
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavigation = (url: string) => {
    navigate(url);
    // No mobile, fechar sidebar após navegação
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full bg-white shadow-xl z-30 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">ContratPro</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {isOpen && <NotificationPanel />}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-2 hover:bg-gray-100"
              >
                {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="p-4">
          <Button 
            onClick={() => handleNavigation('/contracts/new')}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${
              !isOpen ? 'px-2' : 'px-4'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {isOpen && <span className="ml-2">Novo Contrato</span>}
          </Button>
          
          {/* Contador de contratos restantes */}
          {isOpen && currentPlanDetails && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-blue-600">
                {remainingContracts === null ? 'Contratos ilimitados' : `${remainingContracts} contratos restantes`}
              </p>
              {remainingContracts !== null && currentPlanDetails.contractLimit && (
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(currentPlan.contractsUsed / currentPlanDetails.contractLimit) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.url)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </div>
                {isOpen && item.count !== null && (
                  <Badge 
                    variant="secondary" 
                    className={`${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        {isOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.user_metadata?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">{currentPlanDetails?.name || 'Plano Gratuito'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProfileDialogOpen(true)}
                    className="p-1 hover:bg-gray-200"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="p-1 hover:bg-gray-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UserProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </>
  );
};

export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'} min-w-0`}>
        {children}
      </div>
    </div>
  );
}
