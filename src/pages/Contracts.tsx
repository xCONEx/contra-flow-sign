
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Plus, Filter, Send, Eye } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { usePlans } from "@/contexts/PlansContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useContracts } from "@/hooks/useContracts";

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();
  const { canCreateContract } = usePlans();
  const { contracts, loading, sendContractForSignature } = useContracts();

  const handleNewContract = () => {
    if (!canCreateContract) {
      setUpgradeModalOpen(true);
      return;
    }
    navigate("/contracts/new");
  };

  const handleSendContract = async (contractId: string, clientEmail: string) => {
    try {
      await sendContractForSignature(contractId, clientEmail);
    } catch (error) {
      console.error('Error sending contract:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Rascunho", className: "bg-gray-100 text-gray-800" },
      sent: { label: "Enviado", className: "bg-blue-100 text-blue-800" },
      signed: { label: "Assinado", className: "bg-green-100 text-green-800" },
      expired: { label: "Expirado", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelado", className: "bg-orange-100 text-orange-800" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Contratos</h1>
              </div>
              
              <Button 
                onClick={handleNewContract}
                disabled={!canCreateContract}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Contrato
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar contratos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando contratos...</p>
              </div>
            ) : filteredContracts.length > 0 ? (
              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{contract.title}</CardTitle>
                          <CardDescription>
                            Cliente: {contract.client?.name} • {contract.client?.email}
                          </CardDescription>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {contract.total_value && (
                            <p className="text-sm text-gray-600">
                              Valor: R$ {contract.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            Criado em {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {contract.status === 'draft' && (
                            <Button 
                              size="sm"
                              onClick={() => handleSendContract(contract.id, contract.client?.email || '')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Enviar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "Nenhum contrato encontrado" : "Nenhum contrato criado"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "Tente ajustar sua busca ou crie um novo contrato."
                    : "Comece criando seu primeiro contrato para gerenciar seus acordos."
                  }
                </p>
                <Button 
                  onClick={handleNewContract}
                  disabled={!canCreateContract}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              </div>
            )}
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

export default Contracts;
