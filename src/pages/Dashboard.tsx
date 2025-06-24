
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, TrendingUp, Bell } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlans } from "@/contexts/PlansContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { canCreateContract, currentPlan, getRemainingContracts } = usePlans();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const remainingContracts = getRemainingContracts();

  const handleNewContract = () => {
    if (!canCreateContract) {
      setUpgradeModalOpen(true);
      return;
    }
    navigate("/contracts/new");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-gray-500" />
                {!canCreateContract && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    Fazer Upgrade
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {/* Alert de limite se necessário */}
            {remainingContracts !== null && remainingContracts <= 1 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-yellow-800">
                      {remainingContracts === 0 ? 'Limite atingido!' : 'Último contrato disponível!'}
                    </h3>
                    <p className="text-sm text-yellow-700">
                      {remainingContracts === 0 
                        ? 'Você atingiu o limite de contratos do seu plano.' 
                        : `Você tem apenas ${remainingContracts} contrato restante este mês.`
                      }
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => setUpgradeModalOpen(true)}
                  >
                    Fazer Upgrade
                  </Button>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bem-vindo ao ContratPro
              </h2>
              <p className="text-gray-600">
                Gerencie seus contratos e clientes de forma eficiente
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Nenhum contrato criado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Nenhum cliente cadastrado</p>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground">Nenhuma receita registrada</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Primeiros Passos</CardTitle>
                  <CardDescription>Comece criando seu primeiro contrato</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Você ainda não possui contratos. Crie seu primeiro contrato para começar!
                      </p>
                      <Button 
                        onClick={handleNewContract}
                        disabled={!canCreateContract}
                        className="w-full"
                      >
                        Criar Primeiro Contrato
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => navigate("/clients")}
                    >
                      <Users className="h-6 w-6" />
                      <span>Gerenciar Clientes</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => navigate("/analytics")}
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span>Ver Relatórios</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen} 
      />
    </SidebarProvider>
  );
};

export default Dashboard;
