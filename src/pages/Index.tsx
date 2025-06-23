
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { QuickActions } from '@/components/QuickActions';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { supabase } from '@/lib/supabase';

const Index = () => {
  const { user } = useAuth();
  useSecurity(); // Ativar proteções de segurança
  
  const [stats, setStats] = useState({
    totalContracts: 0,
    signedContracts: 0,
    pendingContracts: 0,
    draftContracts: 0
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        console.log('Carregando dados do dashboard...');
        
        // Fetch contracts count com timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );

        const contractsPromise = Promise.all([
          supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'signed'),
          supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
          supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'draft')
        ]);

        const profilePromise = supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const [contractsData, profileData] = await Promise.race([
          Promise.all([contractsPromise, profilePromise]),
          timeoutPromise
        ]) as any;

        const [totalResult, signedResult, pendingResult, draftResult] = contractsData;

        setStats({
          totalContracts: totalResult.count || 0,
          signedContracts: signedResult.count || 0,
          pendingContracts: pendingResult.count || 0,
          draftContracts: draftResult.count || 0
        });

        setUserProfile(profileData.data);
        console.log('Dados carregados com sucesso');
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        // Em caso de erro, definir valores padrão
        setStats({
          totalContracts: 0,
          signedContracts: 0,
          pendingContracts: 0,
          draftContracts: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const conversionRate = stats.totalContracts > 0 ? (stats.signedContracts / stats.totalContracts) * 100 : 0;
  const contractsUsed = userProfile?.contracts_count || 0;
  const contractsLimit = userProfile?.contracts_limit || 5;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, {userProfile?.name || 'Usuário'}
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Contratos"
            value={stats.totalContracts}
            icon={FileText}
            trend={{ value: stats.totalContracts, isPositive: true }}
          />
          <StatCard
            title="Contratos Assinados"
            value={stats.signedContracts}
            icon={CheckCircle}
            trend={{ 
              value: Math.round(conversionRate), 
              isPositive: conversionRate > 0
            }}
          />
          <StatCard
            title="Aguardando Assinatura"
            value={stats.pendingContracts}
            icon={Clock}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Rascunhos"
            value={stats.draftContracts}
            icon={FileText}
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Resumo</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contratos criados este mês</span>
                  <span className="font-semibold">{contractsUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de sucesso</span>
                  <span className="font-semibold">{conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contratos pendentes</span>
                  <span className="font-semibold">{stats.pendingContracts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plano Atual */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Plano Gratuito</h3>
            <p className="text-blue-100 mb-4">
              {Math.max(contractsLimit - contractsUsed, 0)} contratos restantes
            </p>
            <div className="w-full bg-blue-400 rounded-full h-2 mb-4">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((contractsUsed / contractsLimit) * 100, 100)}%` }}
              ></div>
            </div>
            <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Fazer Upgrade
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
