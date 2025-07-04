
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Plus, Filter, Send, Eye } from "lucide-react";
import { AppSidebarProvider } from "@/components/AppSidebar";
import { ContractViewDialog } from "@/components/ContractViewDialog";
import { useNavigate } from "react-router-dom";
import { usePlans } from "@/contexts/PlansContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useContracts, Contract } from "@/hooks/useContracts";

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
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
    <AppSidebarProvider>
      <div className="p-4 md:p-6 overflow-x-hidden">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
              <p className="text-gray-500">Gerencie todos os seus contratos</p>
            </div>
            
            <Button 
              onClick={handleNewContract}
              disabled={!canCreateContract}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </header>

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
            <Button variant="outline" className="w-full sm:w-auto">
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
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <CardDescription className="break-words">
                        Cliente: {contract.client?.name} • {contract.client?.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      {contract.total_value && (
                        <p className="text-sm text-gray-600">
                          Valor: R$ {contract.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Criado em {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewContract(contract)}
                        className="flex-1 sm:flex-initial"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {contract.status === 'draft' && (
                        <Button 
                          size="sm"
                          onClick={() => handleSendContract(contract.id, contract.client?.email || '')}
                          className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
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
      </div>

      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen} 
      />

      {selectedContract && (
        <ContractViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          contract={selectedContract}
        />
      )}
    </AppSidebarProvider>
  );
};

export default Contracts;
