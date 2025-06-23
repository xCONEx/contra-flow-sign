
import React from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { ContractCard } from '@/components/ContractCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentActivity } from '@/components/RecentActivity';
import { 
  FileText, 
  Users, 
  DollarSign, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const mockContracts = [
  {
    id: '1',
    title: 'Contrato de Serviços - Site Institucional',
    client: 'Maria Silva',
    status: 'sent' as const,
    value: 5000,
    dueDate: '15/07/2024',
    createdAt: '10/06/2024',
  },
  {
    id: '2',
    title: 'Briefing Criativo - Campanha Redes Sociais',
    client: 'João Santos',
    status: 'signed' as const,
    value: 3500,
    dueDate: '20/07/2024',
    createdAt: '05/06/2024',
  },
  {
    id: '3',
    title: 'Licenciamento de Imagem',
    client: 'Ana Costa',
    status: 'draft' as const,
    value: 2000,
    dueDate: '25/07/2024',
    createdAt: '12/06/2024',
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao ContratPro! 👋</h1>
          <p className="text-blue-100 text-lg">
            Gerencie seus contratos digitais com facilidade e segurança jurídica.
          </p>
          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Válido juridicamente</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Aumente sua produtividade</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Contratos"
            value="24"
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Contratos Assinados"
            value="18"
            icon={CheckCircle}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Clientes Ativos"
            value="12"
            icon={Users}
            trend={{ value: 4, isPositive: true }}
          />
          <StatCard
            title="Faturamento"
            value="R$ 45.000"
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contracts Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Contratos Recentes</h2>
              <a href="/contracts" className="text-blue-600 hover:text-blue-700 font-medium">
                Ver todos
              </a>
            </div>
            <div className="grid gap-4">
              {mockContracts.map((contract) => (
                <ContractCard key={contract.id} {...contract} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
