
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ContractCard } from '@/components/ContractCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus } from 'lucide-react';

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
  {
    id: '4',
    title: 'Contrato de Prestação de Serviços',
    client: 'Pedro Oliveira',
    status: 'expired' as const,
    value: 4000,
    dueDate: '10/06/2024',
    createdAt: '20/05/2024',
  },
];

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockContracts.length,
    draft: mockContracts.filter(c => c.status === 'draft').length,
    sent: mockContracts.filter(c => c.status === 'sent').length,
    signed: mockContracts.filter(c => c.status === 'signed').length,
    expired: mockContracts.filter(c => c.status === 'expired').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
            <p className="text-gray-600">Gerencie todos os seus contratos</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar contratos ou clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {[
              { key: 'all', label: 'Todos', count: statusCounts.all },
              { key: 'draft', label: 'Rascunho', count: statusCounts.draft },
              { key: 'sent', label: 'Enviados', count: statusCounts.sent },
              { key: 'signed', label: 'Assinados', count: statusCounts.signed },
              { key: 'expired', label: 'Expirados', count: statusCounts.expired },
            ].map((filter) => (
              <Badge
                key={filter.key}
                variant={statusFilter === filter.key ? 'default' : 'outline'}
                className={`cursor-pointer whitespace-nowrap ${
                  statusFilter === filter.key 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label} ({filter.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <ContractCard key={contract.id} {...contract} />
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum contrato encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou criar um novo contrato.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contracts;
