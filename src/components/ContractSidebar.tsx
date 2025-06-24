
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
  CheckCircle
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      count: null
    },
    {
      id: "contracts",
      label: "Contratos",
      icon: FileText,
      count: 12
    },
    {
      id: "clients",
      label: "Clientes",
      icon: Users,
      count: 28
    },
    {
      id: "pending",
      label: "Pendentes",
      icon: Clock,
      count: 5
    },
    {
      id: "signed",
      label: "Assinados",
      icon: CheckCircle,
      count: 47
    },
    {
      id: "analytics",
      label: "Relatórios",
      icon: BarChart3,
      count: null
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      count: null
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-xl z-30 transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
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

      {/* Create Button */}
      <div className="p-4">
        <Button 
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${
            !isOpen ? 'px-2' : 'px-4'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          {isOpen && <span className="ml-2">Novo Contrato</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
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
              {isOpen && item.count && (
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
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">João Doe</p>
                <p className="text-xs text-gray-500">Plano Pro</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
