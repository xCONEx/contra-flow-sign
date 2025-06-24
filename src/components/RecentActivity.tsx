
import { CheckCircle, Clock, Send, FileText, User } from "lucide-react";

const activities = [
  {
    id: 1,
    action: "Contrato assinado",
    description: "Video Corporativo - Empresa XYZ",
    time: "2 horas atrás",
    type: "signed",
    icon: CheckCircle
  },
  {
    id: 2,
    action: "Contrato enviado",
    description: "Cessão de Direitos - Marketing Pro",
    time: "5 horas atrás",
    type: "sent",
    icon: Send
  },
  {
    id: 3,
    action: "Cliente adicionado",
    description: "Fashion Brand cadastrada",
    time: "1 dia atrás",
    type: "client",
    icon: User
  },
  {
    id: 4,
    action: "Contrato criado",
    description: "Briefing - Startup Tech",
    time: "2 dias atrás",
    type: "created",
    icon: FileText
  },
  {
    id: 5,
    action: "Lembrete enviado",
    description: "Pendência - Criativa Studios",
    time: "3 dias atrás",
    type: "reminder",
    icon: Clock
  }
];

const getActivityColor = (type: string) => {
  switch (type) {
    case 'signed':
      return 'bg-green-100 text-green-600';
    case 'sent':
      return 'bg-blue-100 text-blue-600';
    case 'client':
      return 'bg-purple-100 text-purple-600';
    case 'created':
      return 'bg-indigo-100 text-indigo-600';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const RecentActivity = () => {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
