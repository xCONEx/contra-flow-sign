
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, CreditCard, Crown, PenTool, Upload } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePlans } from "@/contexts/PlansContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { user } = useAuth();
  const { currentPlan, plans } = usePlans();
  const { toast } = useToast();
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  
  const currentPlanDetails = plans.find(plan => plan.id === currentPlan.planType);

  const getPlanBadgeColor = () => {
    switch (currentPlan.planType) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSignatureUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}_signature.${fileExt}`;
      const filePath = `signatures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      setSignatureUrl(data.publicUrl);

      // Salvar na tabela user_profiles
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          signature_url: data.publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;
      
      toast({
        title: "Assinatura atualizada!",
        description: "Sua assinatura eletrônica foi salva com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSignatureUploading(false);
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

              {/* Assinatura Eletrônica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    Assinatura Eletrônica
                  </CardTitle>
                  <CardDescription>
                    Configure sua assinatura que será usada nos contratos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {signatureUrl && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <img 
                        src={signatureUrl} 
                        alt="Assinatura atual" 
                        className="max-h-20 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signature">Upload da Assinatura</Label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">
                          {signatureUploading ? "Enviando..." : "Escolher arquivo"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          disabled={signatureUploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Outras Configurações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Outras Configurações
                  </CardTitle>
                  <CardDescription>
                    Configure outras preferências da plataforma.
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
