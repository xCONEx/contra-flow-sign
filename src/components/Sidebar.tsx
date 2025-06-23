
import React from 'react';
import { 
  FileText, 
  Users, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  Bell,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: true },
  { icon: FileText, label: 'Contratos', href: '/contracts' },
  { icon: Users, label: 'Clientes', href: '/clients' },
  { icon: PlusCircle, label: 'Novo Contrato', href: '/contracts/new' },
  { icon: BarChart3, label: 'Relatórios', href: '/reports' },
  { icon: Bell, label: 'Notificações', href: '/notifications' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

export const Sidebar = () => {
  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 opacity-0 pointer-events-none transition-opacity" />
      
      {/* Sidebar */}
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
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  item.active
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </a>
            ))}
          </nav>
          
          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  João Designer
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Plano Gratuito
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
