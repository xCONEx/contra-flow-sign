
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { OAuthCallback } from "@/components/OAuthCallback";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rota inicial - sempre acessível */}
            <Route path="/" element={<Landing />} />
            
            {/* Rotas públicas - redirecionam se usuário já está logado */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } 
            />
            
            {/* Rota para callback do OAuth */}
            <Route path="/dashboard" element={<DashboardRoute />} />
            
            {/* Página 404 */}
            <Route path="/404" element={<NotFound />} />
            
            {/* Captura todas as rotas não definidas e redireciona para 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Componente especial para lidar com dashboard e OAuth callback
const DashboardRoute = () => {
  // Check if this is an OAuth callback
  const hasOAuthTokens = window.location.hash.includes('access_token');
  
  if (hasOAuthTokens) {
    return <OAuthCallback />;
  }
  
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

export default App;
