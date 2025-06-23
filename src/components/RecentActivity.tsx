
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  UserPlus,
  Clock
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'contract_signed',
    icon: CheckCircle,
    title: 'Contrato assinado',
    description: 'Contrato de serviços com Maria Silva foi assinado',
    time: '2 horas atrás',
    color: 'text-green-600',
  },
  {
    id: 2,
    type: 'contract_sent',
    icon: Send,
    title: 'Contrato enviado',
    description: 'Briefing criativo enviado para João Santos',
    time: '4 horas atrás',
    color: 'text-blue-600',
  },
  {
    id: 3,
    type: 'client_added',
    icon: UserPlus,
    title: 'Novo cliente',
    description: 'Ana Costa foi adicionada como cliente',
    time: '1 dia atrás',
    color: 'text-purple-600',
  },
  {
    id: 4,
    type: 'contract_created',
    icon: FileText,
    title: 'Contrato criado',
    description: 'Novo contrato de licenciamento de imagem',
    time: '2 dias atrás',
    color: 'text-gray-600',
  },
];

export const RecentActivity = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
