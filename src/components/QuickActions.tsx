
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  UserPlus, 
  FileText, 
  Send
} from 'lucide-react';
import { NewContractModal } from './modals/NewContractModal';
import { NewClientModal } from './modals/NewClientModal';

const actions = [
  {
    icon: PlusCircle,
    title: 'Criar',
    description: 'Novo contrato',
    color: 'bg-blue-600 hover:bg-blue-700',
    action: 'new-contract',
  },
  {
    icon: FileText,
    title: 'Modelo',
    description: 'Usar template',
    color: 'bg-green-600 hover:bg-green-700',
    action: 'templates',
  },
  {
    icon: UserPlus,
    title: 'Cliente',
    description: 'Cadastrar novo',
    color: 'bg-purple-600 hover:bg-purple-700',
    action: 'new-client',
  },
  {
    icon: Send,
    title: 'Enviar',
    description: 'Para assinatura',
    color: 'bg-orange-600 hover:bg-orange-700',
    action: 'send',
  },
];

export const QuickActions = () => {
  const [newContractModalOpen, setNewContractModalOpen] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case 'new-contract':
        setNewContractModalOpen(true);
        break;
      case 'new-client':
        setNewClientModalOpen(true);
        break;
      case 'templates':
        window.location.href = '/templates';
        break;
      case 'send':
        window.location.href = '/contracts?status=draft';
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center space-y-2 hover:border-blue-300"
              onClick={() => handleAction(action.action)}
            >
              <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-xs">{action.title}</p>
                <p className="text-xs text-gray-500 leading-tight">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Modals */}
      <NewContractModal 
        isOpen={newContractModalOpen} 
        onClose={() => setNewContractModalOpen(false)} 
      />
      
      <NewClientModal 
        isOpen={newClientModalOpen} 
        onClose={() => setNewClientModalOpen(false)} 
      />
    </>
  );
};
