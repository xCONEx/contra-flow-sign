
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlans } from "@/contexts/PlansContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Home,
  PlusCircle,
  Clock,
  CheckCircle,
  User,
  LogOut,
  Crown,
  AlertTriangle
} from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    url: "/dashboard",
    icon: Home
  },
  {
    id: "contracts",
    label: "Contratos",
    url: "/contracts",
    icon: FileText
  },
  {
    id: "clients",
    label: "Clientes", 
    url: "/clients",
    icon: Users
  },
  {
    id: "pending",
    label: "Pendentes",
    url: "/pending",
    icon: Clock
  },
  {
    id: "signed",
    label: "Assinados",
    url: "/signed", 
    icon: CheckCircle
  },
  {
    id: "analytics",
    label: "Relatórios",
    url: "/analytics",
    icon: BarChart3
  },
  {
    id: "settings",
    label: "Configurações",
    url: "/settings",
    icon: Settings
  }
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { currentPlan, plans, canCreateContract, getRemainingContracts } = usePlans();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, setOpenMobile } = useSidebar();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  const currentPlanDetails = plans.find(plan => plan.id === currentPlan.planType);
  const remainingContracts = getRemainingContracts();
  const isCollapsed = state === "collapsed";

  const handleCreateContract = () => {
    if (!canCreateContract) {
      setUpgradeModalOpen(true);
      return;
    }
    navigate("/contracts/new");
    setOpenMobile(false); // Fecha sidebar no mobile após navegação
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleNavigation = () => {
    setOpenMobile(false); // Fecha sidebar no mobile após navegação
  };

  const getPlanBadgeColor = () => {
    switch (currentPlan.planType) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0">
            <FileText className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-900 truncate">ContratPro</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Create Button */}
        <div className="p-4">
          <Button 
            onClick={handleCreateContract}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white relative ${
              !canCreateContract ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!canCreateContract}
          >
            <PlusCircle className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2">Novo Contrato</span>}
            {!canCreateContract && !isCollapsed && (
              <AlertTriangle className="h-4 w-4 ml-2 text-yellow-400 flex-shrink-0" />
            )}
          </Button>
          
          {!isCollapsed && remainingContracts !== null && (
            <div className="mt-2 text-center">
              <span className={`text-xs ${remainingContracts === 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {remainingContracts} contratos restantes
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink 
                        to={item.url} 
                        className="flex items-center gap-3"
                        onClick={handleNavigation}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {!isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 flex-shrink-0">
                    <span className="text-xs font-semibold text-white">
                      {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPlanBadgeColor()}`}
                      >
                        {currentPlanDetails?.name}
                      </Badge>
                      {currentPlan.planType === 'premium' && (
                        <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                  <span className="text-xs font-semibold text-white">
                    {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs mt-1 ${getPlanBadgeColor()}`}
                >
                  {currentPlanDetails?.name}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
