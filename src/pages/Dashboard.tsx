import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, TrendingUp, Bell, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { AppSidebarProvider } from "@/components/AppSidebar";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlans } from "@/contexts/PlansContext";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { useContracts } from "@/hooks/useContracts";

const Dashboard = () => {
  const { canCreateContract, currentPlan, getRemainingContracts } = usePlans();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();
  const { clients } = useClients();
  const { contracts } = useContracts();
  
  const remainingContracts = getRemainingContracts();

  // Calcular estatísticas
  const activeContracts = contracts.filter(c => c.status === 'signed').length;
  const pendingContracts = contracts.filter(c => c.status === 'sent' || c.status === 'draft').length;
  const totalRevenue = contracts
    .filter(c => c.status === 'signed')
    .reduce((sum, contract) => sum + (contract.total_value || 0), 0);

  const handleNewContract = () => {
    if (!canCreateContract) {
      setUpgradeModalOpen(true);
      return;
    }
    navigate("/contracts/new");
  };

  return (
    <AppSidebarProvider>
      <div className="flex-1 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Bem-vindo ao ContratPro</p>
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

        {/* Alert de limite se necessário */}
        {remainingContracts !== null && remainingContracts <= 1 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="text-xs text-muted-foreground">
                {activeContracts === 0 ? 'Nenhum contrato ativo' : 'Contratos assinados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingContracts}</div>
              <p className="text-xs text-muted-foreground">
                {pendingContracts === 0 ? 'Nenhum pendente' : 'Aguardando assinatura'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Total de clientes'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalRevenue === 0 ? 'Nenhuma receita registrada' : 'Contratos assinados'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={handleNewContract}
                  disabled={!canCreateContract}
                  className="h-20 flex flex-col space-y-2"
                >
                  <FileText className="h-6 w-6" />
                  <span>Novo Contrato</span>
                </Button>
                
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
                  onClick={() => navigate("/pending")}
                >
                  <Clock className="h-6 w-6" />
                  <span>Ver Pendentes</span>
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

          <Card>
            <CardHeader>
              <CardTitle>Resumo da Atividade</CardTitle>
              <CardDescription>Status geral dos seus contratos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Contratos Assinados</span>
                      </div>
                      <span className="font-bold text-green-700">{activeContracts}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium">Aguardando Assinatura</span>
                      </div>
                      <span className="font-bold text-yellow-700">{pendingContracts}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Total de Clientes</span>
                      </div>
                      <span className="font-bold text-blue-700">{clients.length}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Você ainda não possui contratos. Crie seu primeiro contrato para começar!
                    </p>
                    <Button 
                      onClick={handleNewContract}
                      disabled={!canCreateContract}
                    >
                      Criar Primeiro Contrato
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <UpgradeModal 
          open={upgradeModalOpen} 
          onOpenChange={setUpgradeModalOpen} 
        />
      </div>
    </AppSidebarProvider>
  );
};

export default Dashboard;
