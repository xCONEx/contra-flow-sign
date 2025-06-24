
import { useState } from "react";
import { usePlans } from "@/contexts/PlansContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap, Star } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { plans, currentPlan } = usePlans();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("upgrade");
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [appliedDiscount, setAppliedDiscount] = useState(false);

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "upgrade") {
      setAppliedDiscount(true);
      toast({
        title: "Cupom aplicado!",
        description: "Desconto de 50% aplicado no primeiro mês!",
      });
    } else {
      toast({
        title: "Cupom inválido",
        description: "O cupom informado não é válido.",
        variant: "destructive"
      });
    }
  };

  const handleUpgrade = (planId: string) => {
    // Aqui integraria com o sistema de pagamento
    console.log(`Upgrade para plano: ${planId}`);
    toast({
      title: "Redirecionando para pagamento",
      description: "Você será redirecionado para finalizar a compra.",
    });
    // onOpenChange(false);
  };

  const getDiscountedPrice = (price: string) => {
    if (!appliedDiscount || price === "R$ 0") return price;
    const numericPrice = parseFloat(price.replace("R$ ", "").replace(",", "."));
    const discountedPrice = numericPrice * 0.5;
    return `R$ ${discountedPrice.toFixed(2).replace(".", ",")}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return Star;
      case 'professional': return Zap;
      case 'premium': return Crown;
      default: return Star;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'border-gray-200';
      case 'professional': return 'border-blue-300 bg-blue-50';
      case 'premium': return 'border-purple-300 bg-purple-50';
      default: return 'border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade seu plano</DialogTitle>
          <DialogDescription>
            Você atingiu o limite do seu plano atual. Faça upgrade para continuar criando contratos!
          </DialogDescription>
        </DialogHeader>

        {/* Cupom de desconto */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="coupon" className="text-sm font-medium">
                Cupom de desconto
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Digite seu cupom"
                  className="flex-1"
                />
                <Button 
                  onClick={applyCoupon}
                  variant="outline"
                  disabled={appliedDiscount}
                >
                  {appliedDiscount ? "Aplicado!" : "Aplicar"}
                </Button>
              </div>
            </div>
            {appliedDiscount && (
              <Badge className="bg-green-100 text-green-800">
                50% OFF no 1º mês
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.id);
            const isCurrentPlan = plan.id === currentPlan.planType;
            const isRecommended = plan.id === 'professional';

            return (
              <Card 
                key={plan.id} 
                className={`relative ${getPlanColor(plan.id)} ${
                  isCurrentPlan ? 'opacity-50' : 'cursor-pointer hover:shadow-lg'
                } transition-all duration-200`}
              >
                {isRecommended && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Recomendado
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Icon className={`h-8 w-8 ${
                      plan.id === 'premium' ? 'text-purple-600' : 
                      plan.id === 'professional' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      {appliedDiscount && plan.price !== "R$ 0" ? (
                        <div className="space-y-1">
                          <span className="line-through text-gray-400 text-xl">
                            {plan.price}
                          </span>
                          <div>{getDiscountedPrice(plan.price)}</div>
                        </div>
                      ) : (
                        plan.price
                      )}
                    </div>
                    {plan.price !== "R$ 0" && <span className="text-gray-500">/mês</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? "secondary" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan ? "Plano Atual" : `Escolher ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Você pode cancelar a qualquer momento</p>
          <p>Suporte técnico incluso em todos os planos</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
