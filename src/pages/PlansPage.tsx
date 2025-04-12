
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const PlansPage = () => {
  const { plans, userProfile, isOnTrialPeriod, getDaysLeftInTrial } = usePlans();
  const queryClient = useQueryClient();
  
  const handleUpgrade = async (planId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('profiles')
        .update({
          plan_id: planId,
          trial_start: null,
          trial_end: null
        })
        .eq('id', user.id);
      
      toast.success("Plano atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error("Erro ao atualizar plano. Tente novamente.");
    }
  };
  
  if (!plans) return <div>Carregando planos...</div>;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Planos</h1>
        <p className="text-meta-gray-dark dark:text-meta-gray mt-1">Escolha o plano ideal para o seu negócio</p>
      </div>
      
      {isOnTrialPeriod() && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-md">
          <h2 className="text-lg font-semibold">Período de Teste</h2>
          <p>Você está em um período de teste do plano Premium. Aproveite todas as funcionalidades premium por mais {getDaysLeftInTrial()} dias antes que o teste termine.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`${userProfile?.plan_id === plan.id ? 'border-2 border-meta-orange' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>R$ {plan.price.toFixed(2)}/mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Recursos:</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {plan.max_collaborators === 1 ? '1 colaborador' : `${plan.max_collaborators} colaboradores`}
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {plan.max_obras === 0 ? 'Obras ilimitadas' : `Até ${plan.max_obras} obras ativas`}
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    WhatsApp integrado
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Painel Web
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Suporte
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Análises e Estatísticas
                  </li>
                </ul>
              </div>
              {plan.description && <p className="text-sm">{plan.description}</p>}
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${userProfile?.plan_id === plan.id ? 'bg-gray-400' : 'bg-meta-blue hover:bg-meta-blue/90'}`}
                disabled={userProfile?.plan_id === plan.id}
                onClick={() => handleUpgrade(plan.id)}
              >
                {userProfile?.plan_id === plan.id ? 'Plano Atual' : 'Escolher Plano'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
