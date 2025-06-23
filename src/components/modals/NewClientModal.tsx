
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal = ({ isOpen, onClose }: NewClientModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    type: 'person' as 'person' | 'company',
    company_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { createClient } = useClients();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await createClient(formData);
      
      toast({
        title: "Sucesso!",
        description: "Cliente cadastrado com sucesso."
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf_cnpj: '',
        type: 'person',
        company_name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar cliente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Cliente</Label>
            <Select value={formData.type} onValueChange={(value: 'person' | 'company') => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Pessoa Física</SelectItem>
                <SelectItem value="company">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">
              {formData.type === 'company' ? 'Razão Social' : 'Nome Completo'} *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.type === 'company' ? 'Empresa Ltda' : 'João Silva'}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="cliente@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="cpf_cnpj">
              {formData.type === 'company' ? 'CNPJ' : 'CPF'}
            </Label>
            <Input
              id="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
              placeholder={formData.type === 'company' ? '00.000.000/0000-00' : '000.000.000-00'}
            />
          </div>

          {formData.type === 'company' && (
            <div>
              <Label htmlFor="company_name">Nome Fantasia</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Nome comercial"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
