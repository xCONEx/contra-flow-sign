
import React from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { QuickActions } from '@/components/QuickActions';
import { FileText, Users, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { useNotifications } from '@/hooks/useNotifications';

const Index = () => {
  const { contracts, loading: contractsLoading } = useContracts();
  const { notifications, loading: notificationsLoading } = useNotifications();

  // Calcular estatísticas dos contratos
  const totalContracts = contracts.length;
  const signedContracts = contracts.filter(c => c.status === 'signed').length;
  const pendingContracts = contracts.filter(c => c.status === 'sent').length;
  const draftContracts = contracts.filter(c => c.status === 'draft').length;

  // Calcular taxa de conversão
  const conversionRate = totalContracts > 0 ? (signedContracts / totalContracts) * 100 : 0;

  // Atividades recentes (contratos criados/atualizados recentemente)
  const recentActivities = contracts
    .slice(0, 5)
    .map(contract => ({
      id: contract.id,
      action: contract.status === 'draft' ? 'Contrato criado' : 
              contract.status === 'sent' ? 'Contrato enviado' :
              contract.status === 'signed' ? 'Contrato assinado' : 'Contrato atualizado',
      target: contract.title,
      time: new Date(contract.updated_at).toLocaleString('pt-BR'),
      type: contract.status === 'signed' ? 'success' as const : 
            contract.status === 'sent' ? 'info' as const : 'default' as const
    }));

  if (contractsLoading || notificationsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe seus contratos e estatísticas
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Contratos"
            value={totalContracts}
            icon={FileText}
            trend={{ value: totalContracts > 0 ? 100 : 0, isPositive: true }}
          />
          <StatCard
            title="Contratos Assinados"
            value={signedContracts}
            icon={CheckCircle}
            trend={{ 
              value: Math.round(conversionRate), 
              isPositive: conversionRate > 0
            }}
          />
          <StatCard
            title="Aguardando Assinatura"
            value={pendingContracts}
            icon={Clock}
            trend={{ value: pendingContracts > 0 ? 5 : 0, isPositive: pendingContracts === 0 }}
          />
          <StatCard
            title="Rascunhos"
            value={draftContracts}
            icon={FileText}
            trend={{ value: draftContracts > 0 ? 2 : 0, isPositive: draftContracts === 0 }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'info' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.target}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-6">
            {/* Resumo Mensal */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Resumo do Mês</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Contratos este mês</span>
                  </div>
                  <span className="font-semibold">{totalContracts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Taxa de sucesso</span>
                  </div>
                  <span className="font-semibold">{conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Pendentes</span>
                  </div>
                  <span className="font-semibold">{pendingContracts}</span>
                </div>
              </div>
            </div>

            {/* Plano Atual */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Plano Gratuito</h3>
              <p className="text-blue-100 mb-4">
                {Math.max(3 - totalContracts, 0)} contratos restantes este mês
              </p>
              <div className="w-full bg-blue-400 rounded-full h-2 mb-4">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((totalContracts / 3) * 100, 100)}%` }}
                ></div>
              </div>
              <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Fazer Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
