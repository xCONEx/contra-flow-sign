
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowLeft } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

const NewContract = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    description: "",
    value: "",
    duration: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Criando contrato:", formData);
    // Aqui implementaremos a lógica de criação do contrato
    navigate("/contracts");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/contracts")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-lg font-semibold">Novo Contrato</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
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
                      <Label htmlFor="client">Cliente</Label>
                      <Input
                        id="client"
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        placeholder="Nome do cliente ou empresa"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descreva os serviços ou produtos do contrato"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="value">Valor (R$)</Label>
                        <Input
                          id="value"
                          name="value"
                          type="number"
                          step="0.01"
                          value={formData.value}
                          onChange={handleChange}
                          placeholder="0,00"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração (dias)</Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          value={formData.duration}
                          onChange={handleChange}
                          placeholder="30"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Criar Contrato
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NewContract;
