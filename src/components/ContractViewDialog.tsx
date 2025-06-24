
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText } from "lucide-react";
import { Contract } from "@/hooks/useContracts";
import { downloadContractPDF } from "@/utils/pdfGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ContractViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
}

export const ContractViewDialog = ({ open, onOpenChange, contract }: ContractViewDialogProps) => {
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();

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

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    try {
      let signatureUrl = '';
      
      // Buscar assinatura do usuário se o contrato estiver assinado
      if (contract.status === 'signed' && user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('signature_url')
          .eq('id', user.id)
          .single();
        
        signatureUrl = profile?.signature_url || '';
      }
      
      downloadContractPDF(contract, signatureUrl);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {contract.title}
          </DialogTitle>
          <DialogDescription>
            Visualização completa do contrato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do contrato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Cliente</h4>
              <p className="text-sm text-gray-600">{contract.client?.name}</p>
              <p className="text-sm text-gray-600">{contract.client?.email}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Status</h4>
              {getStatusBadge(contract.status)}
            </div>
            
            {contract.total_value && (
              <div>
                <h4 className="font-medium text-gray-900">Valor</h4>
                <p className="text-sm text-gray-600">
                  R$ {contract.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            {contract.due_date && (
              <div>
                <h4 className="font-medium text-gray-900">Data de Vencimento</h4>
                <p className="text-sm text-gray-600">
                  {new Date(contract.due_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-900">Criado em</h4>
              <p className="text-sm text-gray-600">
                {new Date(contract.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            {contract.signed_at && (
              <div>
                <h4 className="font-medium text-gray-900">Assinado em</h4>
                <p className="text-sm text-gray-600">
                  {new Date(contract.signed_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Conteúdo do contrato */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Conteúdo do Contrato</h4>
            <ScrollArea className="h-64 w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm">
                {contract.content}
              </div>
            </ScrollArea>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button 
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Gerando PDF..." : "Baixar PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
