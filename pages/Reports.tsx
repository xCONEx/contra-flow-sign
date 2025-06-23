
import React from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign,
  Calendar
} from 'lucide-react';

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Analise o desempenho dos seus contratos</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Contratos Este Mês"
            value="12"
            icon={FileText}
            trend={{ value: 25, isPositive: true }}
          />
          <StatCard
            title="Taxa de Conversão"
            value="85%"
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Tempo Médio Assinatura"
            value="2.3 dias"
            icon={Calendar}
            trend={{ value: 10, isPositive: false }}
          />
          <StatCard
            title="Receita Mensal"
            value="R$ 18.500"
            icon={DollarSign}
            trend={{ value: 18, isPositive: true }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Contratos por Status</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                { label: 'Assinados', value: 18, percentage: 75, color: 'bg-green-500' },
                { label: 'Enviados', value: 4, percentage: 17, color: 'bg-blue-500' },
                { label: 'Rascunho', value: 2, percentage: 8, color: 'bg-gray-400' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Faturamento por Mês</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                { month: 'Janeiro', value: 12000 },
                { month: 'Fevereiro', value: 15000 },
                { month: 'Março', value: 18500 },
                { month: 'Abril', value: 16000 },
                { month: 'Maio', value: 22000 },
                { month: 'Junho', value: 18500 },
              ].map((item, index) => (
                <div key={item.month} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <span className="font-medium">R$ {item.value.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Novos Clientes</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">8</p>
            <p className="text-sm text-gray-500">Neste mês</p>
          </Card>

          <Card className="p-6 text-center">
            <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contratos Assinados</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">18</p>
            <p className="text-sm text-gray-500">Neste mês</p>
          </Card>

          <Card className="p-6 text-center">
            <DollarSign className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ticket Médio</h3>
            <p className="text-3xl font-bold text-purple-600 mb-2">R$ 2.5k</p>
            <p className="text-sm text-gray-500">Por contrato</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
