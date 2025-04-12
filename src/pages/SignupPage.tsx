
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Plan } from "@/types/plans";

const plans: Plan[] = [
  {
    id: "basico",
    name: "Plano Básico",
    price: 97,
    description: "Ideal para pequenas obras",
    features: [
      "Até 2 obras ativas",
      "5 RDOs por mês",
      "Acesso ao painel básico",
      "Suporte por e-mail"
    ]
  },
  {
    id: "avancado",
    name: "Plano Avançado",
    price: 197,
    recommended: true,
    description: "Perfeito para equipes médias",
    features: [
      "Até 5 obras ativas",
      "15 RDOs por mês",
      "Acesso a todas as análises",
      "Suporte prioritário",
      "Exportação de relatórios"
    ]
  },
  {
    id: "premium",
    name: "Plano Premium",
    price: 597,
    description: "Para grandes projetos",
    features: [
      "Obras ilimitadas",
      "RDOs ilimitados", 
      "Acesso completo às análises",
      "Suporte 24/7",
      "Exportação de relatórios",
      "API de integração"
    ]
  }
];

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leadSource, setLeadSource] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);

  useEffect(() => {
    // Extract lead tracking parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const source = queryParams.get('leadSource');
    const id = queryParams.get('leadId');
    
    if (source) setLeadSource(source);
    if (id) setLeadId(id);
    
    // Save lead tracking data to localStorage if present
    if (source && id) {
      localStorage.setItem('leadSource', source);
      localStorage.setItem('leadId', id);
    }
  }, [location]);

  const handleSelectPlan = (planId: string) => {
    // Build query parameters including plan and lead tracking data
    const params = new URLSearchParams();
    params.append('plan', planId);
    if (leadSource) params.append('leadSource', leadSource);
    if (leadId) params.append('leadId', leadId);
    
    navigate(`/signup/register?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#022241] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Meta</span>
            <span className="text-meta-orange">Construtor</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Escolha seu plano</h2>
          <p className="text-lg text-gray-300">Selecione o plano que melhor atende às necessidades da sua empresa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`bg-[#1A2A44]/80 border-none shadow-lg text-white relative ${
                plan.recommended ? "ring-2 ring-meta-orange" : ""
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-meta-orange text-white text-sm font-medium py-1 px-4 rounded-full">
                    Recomendado
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-gray-300">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-meta-orange">R$ {plan.price}</span>
                  <span className="text-gray-300">/mês</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-meta-orange mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-meta-orange hover:bg-meta-orange/90 text-white"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Escolher Plano
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/auth" className="text-meta-orange hover:underline">
            Já tem uma conta? Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
