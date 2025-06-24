
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPanel } from "@/components/NotificationPanel";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import { useContracts } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { usePlans } from "@/contexts/PlansContext";
import { supabase } from "@/integrations/supabase/client";
import { useStableData } from "@/hooks/useStableData";

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { contracts } = useContracts();
  const { clients } = useClients();
  const { currentPlan, plans, getRemainingContracts } = usePlans();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Use stable data to prevent constant recalculation
  const stableContracts = useStableData(contracts, 'contracts');
  const stableClients = useStableData(clients, 'clients');

  // Memoizar os valores para evitar recálculo constante
  const pendingContracts = stableContracts.filter(c => c.status === 'draft' || c.status === 'sent');
  const signedContracts = stableContracts.filter(c => c.status === 'signed');

  // Get current plan details
  const currentPlanDetails = plans.find(plan => plan.id === currentPlan.planType);
  const remainingContracts = getRemainingContracts();

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
      count: stableContracts.length
    },
    {
      id: "clients",
      label: "Clientes",
      icon: Users,
      url: "/clients",
      count: stableClients.length
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
  };

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
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 group-data-[collapsible=icon]:hidden">
              ContratPro
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              {/* Create Button */}
              <div className="px-2 mb-4">
                <Button 
                  onClick={() => handleNavigation('/contracts/new')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="group-data-[collapsible=icon]:hidden ml-2">
                    Novo Contrato
                  </span>
                </Button>
                
                {/* Contador de contratos restantes */}
                {currentPlanDetails && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center group-data-[collapsible=icon]:hidden">
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

              {/* Navigation Menu */}
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        asChild
                        isActive={isActive}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <button className="w-full flex items-center">
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                          {item.count !== null && (
                            <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getUserAvatar()} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.name || user?.user_metadata?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">{currentPlanDetails?.name || 'Plano Gratuito'}</p>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-gray-400 group-data-[collapsible=icon]:hidden" />
                </Button>
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
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* User Profile Dialog - Apenas renderizar quando necessário */}
      {profileDialogOpen && (
        <UserProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
      )}
    </>
  );
};

export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header mobile - sem duplicação */}
          <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">ContratPro</span>
            </div>
            <NotificationPanel />
          </div>
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
