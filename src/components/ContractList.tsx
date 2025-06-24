
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Send, MoreVertical } from "lucide-react";

const contracts = [
  {
    id: 1,
    title: "Contrato de Produção - Video Corporativo",
    client: "Empresa XYZ Ltda",
    status: "signed",
    statusLabel: "Assinado",
    value: "R$ 5.000,00",
    date: "2024-01-20",
    daysAgo: "2 dias atrás"
  },
  {
    id: 2,
    title: "Cessão de Direitos - Campanha Digital",
    client: "Marketing Pro",
    status: "pending",
    statusLabel: "Pendente",
    value: "R$ 3.500,00",
    date: "2024-01-18",
    daysAgo: "4 dias atrás"
  },
  {
    id: 3,
    title: "Prestação de Serviços - Edição de Video",
    client: "Criativa Studios",
    status: "draft",
    statusLabel: "Rascunho",
    value: "R$ 2.800,00",
    date: "2024-01-17",
    daysAgo: "5 dias atrás"
  },
  {
    id: 4,
    title: "Licenciamento de Imagem - Produto",
    client: "Fashion Brand",
    status: "sent",
    statusLabel: "Enviado",
    value: "R$ 1.200,00",
    date: "2024-01-16",
    daysAgo: "6 dias atrás"
  },
  {
    id: 5,
    title: "Briefing - Projeto Audiovisual",
    client: "Startup Tech",
    status: "signed",
    statusLabel: "Assinado",
    value: "R$ 4.200,00",
    date: "2024-01-15",
    daysAgo: "1 semana atrás"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'signed':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'sent':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'draft':
      return 'bg-gray-100 text-gray-700 border border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const ContractList = () => {
  return (
    <div className="divide-y divide-gray-100">
      {contracts.map((contract) => (
        <div key={contract.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {contract.title}
                </h4>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="text-sm text-gray-500">{contract.client}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">{contract.daysAgo}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{contract.value}</p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(contract.status)}`}
                >
                  {contract.statusLabel}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="w-4 h-4 text-gray-400" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Send className="w-4 h-4 text-gray-400" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
