
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    type: 'info',
    title: 'Contrato assinado',
    message: 'O contrato "Prestação de Serviços - João Silva" foi assinado.',
    time: '2 min atrás',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Contrato pendente',
    message: 'O contrato "Licenciamento - Maria Santos" está aguardando assinatura há 2 dias.',
    time: '1 hora atrás',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'Novo cliente cadastrado',
    message: 'Pedro Lima foi adicionado à sua lista de clientes.',
    time: '3 horas atrás',
    read: true,
  },
];

export const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {notification.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button onClick={() => console.log('Marcar todas como lidas')} className="flex-1">
            Marcar como lidas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
