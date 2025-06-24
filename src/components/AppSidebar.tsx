
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User,
  ChevronsUpDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPanel } from "@/components/NotificationPanel";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import { useContracts } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { usePlans } from "@/contexts/PlansContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const pendingContracts = contracts.filter(c => c.status === 'draft' || c.status === 'sent');
  const signedContracts = contracts.filter(c => c.status === 'signed');

  // Get current plan details
  const currentPlanDetails = plans.find(plan => plan.id === currentPlan.planType);
  const remainingContracts = getRemainingContracts();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load user profile
  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setUserProfile(data);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      };

      loadProfile();
    }
  }, [user]);

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
    if (isMobile) {
      onToggle();
    }
  };

  // Sidebar should be open if hovered (desktop) or manually opened (mobile)
  const sidebarIsOpen = isMobile ? isOpen : (isOpen || isHovered);

  // Get user avatar
  const getUserAvatar = () => {
    if (userProfile?.avatar_url) return userProfile.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    return '';
  };

  const getUserInitials = () => {
    const name = userProfile?.name || user?.user_metadata?.name || user?.email || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onToggle}
        />
      )}
      
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-xl z-30 transition-all duration-300 ${
          sidebarIsOpen ? 'w-64' : 'w-16'
        } ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarIsOpen && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">ContratPro</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {sidebarIsOpen && <NotificationPanel />}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100"
                >
                  {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="p-4">
          <Button 
            onClick={() => handleNavigation('/contracts/new')}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${
              !sidebarIsOpen ? 'px-2' : 'px-4'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {sidebarIsOpen && <span className="ml-2">Novo Contrato</span>}
          </Button>
          
          {/* Contador de contratos restantes */}
          {sidebarIsOpen && currentPlanDetails && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-blue-600">
                {remainingContracts === null ? 'Contratos ilimitados' : `${remainingContracts} contratos restantes`}
              </p>
              {remainingContracts !== null && currentPlanDetails.contractLimit && (
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((currentPlan.contractsUsed / currentPlanDetails.contractLimit) * 100, 100)}%` }}
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
                  {sidebarIsOpen && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </div>
                {sidebarIsOpen && item.count !== null && (
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
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            {sidebarIsOpen ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <div className="flex items-center gap-2 hover:bg-gray-100 rounded-md p-2 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={getUserAvatar()} />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userProfile?.name || user?.user_metadata?.name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500">{currentPlanDetails?.name || 'Plano Gratuito'}</p>
                    </div>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={getUserAvatar()} />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userProfile?.name || user?.user_metadata?.name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex justify-center">
                <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                  <AvatarImage src={getUserAvatar()} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
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
      <div className={`flex-1 transition-all duration-300 md:ml-16 min-w-0`}>
        {children}
      </div>
    </div>
  );
}
