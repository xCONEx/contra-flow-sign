
import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar contratos, clientes..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </span>
          </Button>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 hidden sm:flex"
            onClick={() => window.location.href = '/contracts/new'}
          >
            Novo Contrato
          </Button>
        </div>
      </div>
    </header>
  );
};
