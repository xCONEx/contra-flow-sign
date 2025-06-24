
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, MapPin, Calendar, Building } from "lucide-react";
import { Client } from "@/hooks/useClients";

interface ClientViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

export const ClientViewDialog = ({ open, onOpenChange, client }: ClientViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client.name}
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações principais */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{client.email}</p>
              </div>
            </div>

            {client.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Telefone</p>
                  <p className="text-sm text-gray-600">{client.phone}</p>
                </div>
              </div>
            )}

            {client.cpf_cnpj && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge variant="outline" className="h-5 w-5">ID</Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900">CPF/CNPJ</p>
                  <p className="text-sm text-gray-600">{client.cpf_cnpj}</p>
                </div>
              </div>
            )}

            {client.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Endereço</p>
                  <p className="text-sm text-gray-600">{client.address}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Informações adicionais */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Botão de fechar */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
