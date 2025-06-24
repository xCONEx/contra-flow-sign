
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/hooks/useClients";
import { AlertTriangle } from "lucide-react";

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onClientDeleted: () => void;
}

export const DeleteClientDialog = ({ open, onOpenChange, client, onClientDeleted }: DeleteClientDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído!",
        description: `${client.name} foi removido com sucesso.`,
      });

      onClientDeleted();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Excluir Cliente
          </DialogTitle>
          <DialogDescription className="text-left">
            Tem certeza que deseja excluir <strong>{client.name}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados do cliente serão perdidos permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Sim, Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
