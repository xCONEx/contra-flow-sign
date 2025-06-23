import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, Send, User, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';
import { contractTemplates } from '@/data/contractTemplates';

const NewContract = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [template, setTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { createContract } = useContracts();
  const { toast } = useToast();

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título do contrato é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await createContract({
        title,
        content: content || `Contrato: ${title}\n\nCliente: ${clientName}\nEmail: ${clientEmail}\nValor: R$ ${value}\nPrazo: ${dueDate}\n\n${content}`,
        client_name: clientName,
        client_email: clientEmail,
        value: value ? parseFloat(value) : undefined
      });
      
      toast({
        title: "Sucesso!",
        description: "Contrato salvo como rascunho."
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setClientName('');
      setClientEmail('');
      setValue('');
      setDueDate('');
      setTemplate('');
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar contrato.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (templateId: string) => {
    const selectedTemplate = contractTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      let templateContent = selectedTemplate.content;
      
      // Substituir placeholders com dados do formulário
      templateContent = templateContent.replace(/\[Nome do Cliente\]/g, clientName || '[Nome do Cliente]');
      templateContent = templateContent.replace(/\[Email\]/g, clientEmail || '[Email]');
      templateContent = templateContent.replace(/\[Valor\]/g, value || '[Valor]');
      templateContent = templateContent.replace(/\[Data\]/g, dueDate || '[Data]');
      
      setContent(templateContent);
      setTitle(selectedTemplate.name);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Contrato</h1>
            <p className="text-gray-600">Crie um novo contrato para seus clientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Contrato *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Contrato de Desenvolvimento de Website"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={template} onValueChange={(value) => {
                    setTemplate(value);
                    loadTemplate(value);
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTemplates.map((temp) => (
                        <SelectItem key={temp.id} value={temp.id}>
                          {temp.name} - {temp.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nome completo"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email do Cliente</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detalhes Financeiros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="5000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Conteúdo do Contrato</h3>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo do contrato ou selecione um template acima..."
                className="min-h-[300px]"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ações</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button 
                  disabled={!title.trim() || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Cliente
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{clientName || 'Cliente não informado'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span>R$ {value || '0'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{dueDate || 'Data não definida'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewContract;
