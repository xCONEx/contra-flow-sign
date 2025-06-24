
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Search, Filter, Eye, Download, Calendar } from "lucide-react";
import { AppSidebarProvider } from "@/components/AppSidebar";
import { ContractViewDialog } from "@/components/ContractViewDialog";
import { useContracts, Contract } from "@/hooks/useContracts";

const Signed = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { contracts, loading } = useContracts();

  const signedContracts = contracts.filter(contract => 
    contract.status === 'signed'
  );

  const filteredContracts = signedContracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = signedContracts.reduce((sum, contract) => 
    sum + (contract.total_value || 0), 0
  );

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    return `há ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <AppSidebarProvider>
      <div className="p-4 md:p-6 overflow-x-hidden">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contratos Assinados</h1>
          <p className="text-gray-500 break-words">
            {signedContracts.length} contratos assinados • 
            Valor total: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </header>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contratos assinados..."
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

        {/* Resumo */}
        {signedContracts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{signedContracts.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600 break-words">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600 break-words">
                  R$ {(totalValue / signedContracts.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando contratos...</p>
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="truncate">{contract.title}</span>
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      </CardTitle>
                      <CardDescription className="break-words">
                        Cliente: {contract.client?.name} • {contract.client?.email}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Assinado
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {contract.total_value && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-sm text-gray-600">Valor:</span>
                          <span className="text-lg font-semibold text-green-600">
                            R$ {contract.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Assinado {getDaysAgo(contract.created_at)}
                      </p>
                      {contract.due_date && (
                        <p className="text-xs text-gray-600">
                          Vigência até: {new Date(contract.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
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
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-initial"
                        onClick={() => handleViewContract(contract)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Nenhum contrato encontrado" : "Nenhum contrato assinado"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "Tente ajustar sua busca ou verifique outros status."
                : "Quando seus clientes assinarem os contratos, eles aparecerão aqui."
              }
            </p>
          </div>
        )}

        {/* Contract View Dialog */}
        {selectedContract && (
          <ContractViewDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            contract={selectedContract}
          />
        )}
      </div>
    </AppSidebarProvider>
  );
};

export default Signed;
