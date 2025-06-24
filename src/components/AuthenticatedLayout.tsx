
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText, Bell, LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";

interface AuthenticatedLayoutProps {
  children?: React.ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ContratPro</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-500" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Olá, {user?.user_metadata?.name || user?.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children || <Outlet />}
      </main>
    </div>
  );
};
