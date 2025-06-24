import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowLeft } from "lucide-react";
import { AppSidebarProvider } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import { ClientSelector } from "@/components/ClientSelector";
import { useContracts } from "@/hooks/useContracts";
import { Client } from "@/hooks/useClients";
import { usePlans } from "@/contexts/PlansContext";

const NewContract = () => {
  const navigate = useNavigate();
  const { createContract } = useContracts();
  const { canCreateContract, incrementContractCount } = usePlans();
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    total_value: "",
    due_date: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      alert("Por favor, selecione um cliente.");
      return;
    }

    if (!canCreateContract) {
      alert("Você atingiu o limite de contratos do seu plano.");
      return;
    }

    setLoading(true);

    try {
      await createContract({
        title: formData.title,
        client_id: selectedClient.id,
        content: formData.content,
        total_value: formData.total_value ? parseFloat(formData.total_value) : undefined,
        due_date: formData.due_date || undefined
      });

      incrementContractCount();
      navigate("/contracts");
    } catch (error) {
      console.error('Error creating contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AppSidebarProvider>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/contracts")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Novo Contrato</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Criar Novo Contrato
              </CardTitle>
              <CardDescription>
                Preencha as informações básicas para criar um novo contrato.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Contrato</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Contrato de Prestação de Serviços"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <div className="flex gap-2">
                    <Input
                      value={selectedClient?.name || ""}
                      placeholder="Selecione um cliente"
                      readOnly
                      required
                    />
                    <ClientSelector
                      selectedClient={selectedClient || undefined}
                      onClientSelect={setSelectedClient}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo do Contrato</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Descreva os termos e condições do contrato"
                    rows={8}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_value">Valor (R$)</Label>
                    <Input
                      id="total_value"
                      name="total_value"
                      type="number"
                      step="0.01"
                      value={formData.total_value}
                      onChange={handleChange}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Data de Vencimento</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || !canCreateContract}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Criando..." : "Criar Contrato"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate("/contracts")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebarProvider>
  );
};

export default NewContract;
