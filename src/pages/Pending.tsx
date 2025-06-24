
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, Filter, Send, Eye, AlertCircle } from "lucide-react";
import { AppSidebarProvider } from "@/components/AppSidebar";
import { useContracts } from "@/hooks/useContracts";

const Pending = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { contracts, loading, sendContractForSignature } = useContracts();

  const pendingContracts = contracts.filter(contract => 
    contract.status === 'draft' || contract.status === 'sent'
  );

  const filteredContracts = pendingContracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendContract = async (contractId: string, clientEmail: string) => {
    try {
      await sendContractForSignature(contractId, clientEmail);
    } catch (error) {
      console.error('Error sending contract:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Rascunho", className: "bg-orange-100 text-orange-800", icon: AlertCircle },
      sent: { label: "Enviado", className: "bg-blue-100 text-blue-800", icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${config.className}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
      <div className="p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contratos Pendentes</h1>
          <p className="text-gray-500">
            {pendingContracts.length} contratos aguardando ação
          </p>
        </header>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contratos pendentes..."
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
                        Criado {getDaysAgo(contract.created_at)}
                      </p>
                      {contract.due_date && (
                        <p className="text-xs text-yellow-600">
                          Vencimento: {new Date(contract.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
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
                      {contract.status === 'sent' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Aguardando
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
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Nenhum contrato encontrado" : "Nenhum contrato pendente"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "Tente ajustar sua busca ou verifique outros status."
                : "Todos os seus contratos estão assinados ou você ainda não criou nenhum."
              }
            </p>
          </div>
        )}
      </div>
    </AppSidebarProvider>
  );
};

export default Pending;
