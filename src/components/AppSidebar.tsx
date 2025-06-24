
import { useState } from "react";
import { FileText, Users, Clock, CheckCircle, BarChart, Settings, LogOut, User, ChevronUp } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePlans } from "@/contexts/PlansContext";
import { UserProfileModal } from "@/components/UserProfileModal";

const items = [
  { title: "Dashboard", url: "/", icon: BarChart },
  { title: "Contratos", url: "/contracts", icon: FileText },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Pendentes", url: "/pending", icon: Clock },
  { title: "Assinados", url: "/signed", icon: CheckCircle },
  { title: "Analytics", url: "/analytics", icon: BarChart },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentPlan, plans } = usePlans();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  const currentPath = location.pathname;
  const currentPlanDetails = plans.find(plan => plan.id === currentPlan.planType);
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors";
    return isActive(path) 
      ? `${baseClasses} bg-blue-100 text-blue-700 font-medium` 
      : `${baseClasses} text-gray-700 hover:bg-gray-100`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Sidebar
        className={`border-r border-gray-200 ${isCollapsed ? "w-16" : "w-64"}`}
        collapsible="icon"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-xl text-gray-900">ContratPro</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <SidebarContent className="flex-1 p-4">
            <SidebarGroup>
              <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls(item.url)}>
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User Section */}
          <SidebarFooter className="p-4 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userName}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-blue-100 text-blue-700 mt-1"
                      >
                        {currentPlanDetails?.name}
                      </Badge>
                    </div>
                  )}
                  {!isCollapsed && <ChevronUp className="h-4 w-4 text-gray-400" />}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </div>
      </Sidebar>

      <UserProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </>
  );
}
