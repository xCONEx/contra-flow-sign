
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  UserPlus, 
  FileText, 
  Send,
  Users,
  BarChart3
} from 'lucide-react';

const actions = [
  {
    icon: PlusCircle,
    title: 'Novo Contrato',
    description: 'Criar contrato do zero',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    icon: FileText,
    title: 'Usar Modelo',
    description: 'Templates prontos',
    color: 'bg-green-600 hover:bg-green-700',
  },
  {
    icon: UserPlus,
    title: 'Novo Cliente',
    description: 'Cadastrar cliente',
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    icon: Send,
    title: 'Enviar Contrato',
    description: 'Enviar para assinatura',
    color: 'bg-orange-600 hover:bg-orange-700',
  },
];

export const QuickActions = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 hover:border-blue-300"
          >
            <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
              <action.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};
