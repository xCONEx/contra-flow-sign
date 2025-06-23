
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
import { Textarea } from '@/components/ui/textarea';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewContractModal = ({ isOpen, onClose }: NewContractModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    templateId: '',
    description: '',
    value: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Criando novo contrato:', formData);
    // Aqui será feita a integração com a API
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Contrato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Contrato</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Contrato de Prestação de Serviços"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="client">Cliente</Label>
            <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">João Silva</SelectItem>
                <SelectItem value="2">Maria Santos</SelectItem>
                <SelectItem value="3">Pedro Lima</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="template">Modelo</Label>
            <Select value={formData.templateId} onValueChange={(value) => setFormData({ ...formData, templateId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Prestação de Serviços</SelectItem>
                <SelectItem value="2">Licenciamento de Imagem</SelectItem>
                <SelectItem value="3">Cessão de Direitos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes do contrato..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar Contrato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
