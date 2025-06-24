
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type PlanType = 'free' | 'professional' | 'premium';

export interface Plan {
  id: PlanType;
  name: string;
  price: string;
  description: string;
  features: string[];
  contractLimit: number | null; // null = unlimited
}

export interface UserPlan {
  planType: PlanType;
  contractsUsed: number;
  resetDate: Date;
}

interface PlansContextType {
  currentPlan: UserPlan;
  plans: Plan[];
  canCreateContract: boolean;
  incrementContractCount: () => void;
  decrementContractCount: () => void;
  getRemainingContracts: () => number | null;
  resetMonthlyCount: () => void;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',
    description: 'Perfeito para começar',
    features: [
      '3 contratos por mês',
      'Modelos básicos',
      'Assinatura eletrônica',
      'Suporte por email'
    ],
    contractLimit: 3
  },
  {
    id: 'professional',
    name: 'Profissional',
    price: 'R$ 29,90/mês',
    description: 'Para freelancers e PMEs',
    features: [
      '50 contratos por mês',
      'Todos os modelos',
      'Customização avançada',
      'Relatórios básicos',
      'Suporte prioritário'
    ],
    contractLimit: 50
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 79,90/mês',
    description: 'Para empresas e agências',
    features: [
      'Contratos ilimitados',
      'API completa',
      'Webhooks',
      'Relatórios avançados',
      'Suporte dedicado',
      'Integração FinanceFlow Pro'
    ],
    contractLimit: null
  }
];

const PlansContext = createContext<PlansContextType | undefined>(undefined);

export const PlansProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<UserPlan>({
    planType: 'free',
    contractsUsed: 0,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  });

  // Load user plan from localStorage
  useEffect(() => {
    if (user) {
      const savedPlan = localStorage.getItem(`userPlan_${user.id}`);
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        setCurrentPlan({
          ...parsed,
          resetDate: new Date(parsed.resetDate)
        });
      }
    }
  }, [user]);

  // Save user plan to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`userPlan_${user.id}`, JSON.stringify(currentPlan));
    }
  }, [currentPlan, user]);

  // Check if we need to reset monthly count
  useEffect(() => {
    const now = new Date();
    if (now >= currentPlan.resetDate) {
      resetMonthlyCount();
    }
  }, [currentPlan.resetDate]);

  const getCurrentPlanDetails = () => {
    return plans.find(plan => plan.id === currentPlan.planType) || plans[0];
  };

  const canCreateContract = () => {
    const planDetails = getCurrentPlanDetails();
    if (planDetails.contractLimit === null) return true; // unlimited
    return currentPlan.contractsUsed < planDetails.contractLimit;
  };

  const incrementContractCount = () => {
    setCurrentPlan(prev => ({
      ...prev,
      contractsUsed: prev.contractsUsed + 1
    }));
  };

  const decrementContractCount = () => {
    setCurrentPlan(prev => ({
      ...prev,
      contractsUsed: Math.max(0, prev.contractsUsed - 1)
    }));
  };

  const getRemainingContracts = () => {
    const planDetails = getCurrentPlanDetails();
    if (planDetails.contractLimit === null) return null; // unlimited
    return Math.max(0, planDetails.contractLimit - currentPlan.contractsUsed);
  };

  const resetMonthlyCount = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    setCurrentPlan(prev => ({
      ...prev,
      contractsUsed: 0,
      resetDate: nextMonth
    }));
  };

  return (
    <PlansContext.Provider value={{
      currentPlan,
      plans,
      canCreateContract: canCreateContract(),
      incrementContractCount,
      decrementContractCount,
      getRemainingContracts,
      resetMonthlyCount
    }}>
      {children}
    </PlansContext.Provider>
  );
};

export const usePlans = () => {
  const context = useContext(PlansContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
};
