
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, CreditCard, Crown } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePlans } from "@/contexts/PlansContext";

const Settings = () => {
  const { user } = useAuth();
  const { currentPlan, plans } = usePlans();
  
  const currentPlanDetails = plans.find(plan => plan.id === currentPlan.planType);

  const getPlanBadgeColor = () => {
    switch (currentPlan.planType) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Configurações</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 max-w-4xl">
            <div className="space-y-6">
              {/* Perfil do Usuário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Perfil do Usuário
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas informações pessoais e preferências da conta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input 
                        id="name" 
                        defaultValue={user?.user_metadata?.name || ''} 
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        defaultValue={user?.email || ''} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <Button>Salvar Alterações</Button>
                </CardContent>
              </Card>

              {/* Plano Atual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Plano Atual
                  </CardTitle>
                  <CardDescription>
                    Gerencie sua assinatura e veja o uso atual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary" 
                        className={`${getPlanBadgeColor()}`}
                      >
                        {currentPlanDetails?.name}
                      </Badge>
                      {currentPlan.planType === 'premium' && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{currentPlanDetails?.price}</p>
                      <p className="text-sm text-gray-500">por mês</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Recursos inclusos:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {currentPlanDetails?.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline">Alterar Plano</Button>
                    <Button variant="outline">Gerenciar Faturamento</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preferências */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Preferências
                  </CardTitle>
                  <CardDescription>
                    Configure suas preferências de uso da plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <SettingsIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Configurações adicionais em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
