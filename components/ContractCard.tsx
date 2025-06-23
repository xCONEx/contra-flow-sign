
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, User, MoreHorizontal } from 'lucide-react';

interface ContractCardProps {
  id: string;
  title: string;
  client: string;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  value: number;
  dueDate: string;
  createdAt: string;
}

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
  signed: { label: 'Assinado', color: 'bg-green-100 text-green-800' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-800' },
};

export const ContractCard = ({ title, client, status, value, dueDate, createdAt }: ContractCardProps) => {
  const statusInfo = statusConfig[status];
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <User className="w-4 h-4 mr-1" />
              {client}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Badge className={statusInfo.color}>
          {statusInfo.label}
        </Badge>
        <span className="text-lg font-semibold text-gray-900">
          R$ {value.toLocaleString('pt-BR')}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Vence em {dueDate}
        </div>
        <span>Criado em {createdAt}</span>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button variant="outline" size="sm" className="flex-1">
          Visualizar
        </Button>
        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
          {status === 'draft' ? 'Enviar' : 'Detalhes'}
        </Button>
      </div>
    </Card>
  );
};
