
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlansProvider } from "@/contexts/PlansContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { OAuthCallback } from "@/components/OAuthCallback";
import { AppSidebarProvider } from "@/components/AppSidebar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import NewContract from "./pages/NewContract";
import Clients from "./pages/Clients";
import Pending from "./pages/Pending";
import Signed from "./pages/Signed";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PlansProvider>
            <Routes>
              {/* Rota inicial - Landing page pública */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              
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
              
              {/* Rota específica para callback do OAuth - sempre acessível */}
              <Route path="/auth/callback" element={<OAuthCallback />} />
              
              {/* Rotas protegidas com sidebar */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <Dashboard />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contracts" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <Contracts />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contracts/new" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <NewContract />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <Clients />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pending" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <Pending />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/signed" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <Signed />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <Analytics />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <AppSidebarProvider>
                      <Settings />
                    </AppSidebarProvider>
                  </ProtectedRoute>
                } 
              />
              
              {/* Página 404 */}
              <Route path="/404" element={<NotFound />} />
              
              {/* Captura todas as rotas não definidas e redireciona para 404 */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </PlansProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
