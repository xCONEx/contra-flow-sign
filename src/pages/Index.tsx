
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Clock, CheckCircle, PlusCircle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ContractList } from "@/components/ContractList";
import { RecentActivity } from "@/components/RecentActivity";

const Index = () => {
  const stats = [
    {
      title: "Contratos Ativos",
      value: "12",
      description: "Em andamento",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Clientes",
      value: "28",
      description: "Total cadastrados",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pendentes",
      value: "5",
      description: "Aguardando assinatura",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Assinados",
      value: "47",
      description: "Este mês",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Gerencie seus contratos e clientes de forma eficiente
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg">
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contracts List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-white rounded-t-lg border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Contratos Recentes</CardTitle>
                    <CardDescription>Últimas atividades dos seus contratos</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    12 ativos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ContractList />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-white rounded-t-lg border-b border-gray-100">
                <CardTitle className="text-xl text-gray-900">Atividade Recente</CardTitle>
                <CardDescription>Últimas ações no sistema</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Começe agora mesmo
                  </h3>
                  <p className="text-blue-100">
                    Crie seu primeiro contrato em menos de 2 minutos
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    Novo Cliente
                  </Button>
                  <Button variant="secondary" className="bg-blue-500 text-white hover:bg-blue-400">
                    Criar Contrato
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
