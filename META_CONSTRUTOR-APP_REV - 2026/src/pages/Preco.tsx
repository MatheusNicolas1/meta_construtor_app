import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from "@/components/SEO";
import LandingNavigation from '@/components/landing/LandingNavigation';
import { Pricing } from '@/components/ui/pricing';
import FooterSection from '@/components/landing/FooterSection';
import { PerformanceManager } from '@/components/PerformanceManager';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const demoPlans = [
  {
    name: "GRATUITO",
    price: "0,00",
    yearlyPrice: "0,00",
    period: "por mês",
    features: [
      "7 Créditos RDO Gratuitos",
      "1 crédito = 1 RDO criado",
      "100% Grátis - Sem pegadinhas",
      "1 usuário",
      "1 obra",
      "RDO digital completo",
      "Suporte por email",
      "Sem cartão de crédito",
    ],
    description: "Plataforma gratuita - teste sem limites de tempo!",
    buttonText: "Começar Grátis Agora",
    href: "/login",
    isPopular: false,
  },
  {
    name: "BÁSICO",
    price: "129,90",
    yearlyPrice: "103,92",
    period: "por mês",
    features: [
      "Até 3 usuários",
      "Armazenamento ilimitado",
      "RDO digital completo",
      "Relatórios básicos",
      "Suporte por email",
      "Backup automático",
    ],
    description: "Perfeito para pequenas construtoras",
    buttonText: "Começar Agora",
    href: "/checkout?plan=basic",
    isPopular: false,
  },
  {
    name: "PROFISSIONAL",
    price: "199,90",
    yearlyPrice: "159,92",
    period: "por mês",
    features: [
      "Até 5 usuários",
      "Obras ilimitadas",
      "Relatórios avançados",
      "Integrações WhatsApp",
      "Suporte via chat 24h",
      "Dashboard avançado",
      "Controle de estoque",
    ],
    description: "Ideal para construtoras em crescimento",
    buttonText: "Começar Agora",
    href: "/checkout?plan=professional",
    isPopular: true,
  },
  {
    name: "MASTER",
    price: "499,90",
    yearlyPrice: "399,92",
    period: "por mês",
    features: [
      "Até 15 usuários",
      "Obras ilimitadas",
      "Todas as funcionalidades do Profissional",
      "API personalizada",
      "Integração com ERP",
      "Suporte prioritário (SLA 8h)",
      "Treinamento dedicado",
    ],
    description: "Para construtoras estabelecidas",
    buttonText: "Começar Agora",
    href: "/checkout?plan=master",
    isPopular: false,
  },
  {
    name: "BUSINESS",
    price: "Sob consulta",
    yearlyPrice: "Sob consulta",
    period: "",
    features: [
      "Usuários ilimitados",
      "Integrações customizadas",
      "SLA 24/7",
      "Onboarding dedicado",
      "Gerente de conta exclusivo",
      "White label disponível",
      "Múltiplas empresas",
    ],
    description: "Para grandes incorporadoras e construtoras",
    buttonText: "Solicitar Proposta",
    href: "/checkout?plan=business",
    isPopular: false,
  },
];

const Preco = () => {
  const navigate = useNavigate();

  return (
    <PerformanceManager>
      <SEO
        title="Preços - Meta Construtor | Planos e Valores"
        description="Conheça nossos planos de preços. Desde R$ 129,90/mês. Sistema de créditos gratuito disponível. Escolha o plano ideal para sua construtora."
        canonical={window.location.href}
      />

      <div className="min-h-screen bg-background">
        <LandingNavigation />

        <main className="pt-16 md:pt-20 overflow-x-hidden">
          {/* Hero Section */}
          <section className="py-8 md:py-10 bg-background w-full">
            <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Comece Gratuitamente com 7 Créditos RDO
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-3 sm:mt-4 max-w-2xl mx-auto">
                Sem cartão de crédito. Sem compromisso. 100% Gratuito para começar! Precisa de mais? Escolha um plano ilimitado.
              </p>
            </div>
          </section>

          {/* Pricing Cards */}
          <section id="pricing" className="py-6 md:py-8 w-full">
            <Pricing plans={demoPlans} />
          </section>

          {/* CTA Section */}
          <section className="py-10 md:py-12 bg-muted/30 w-full">
            <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Pronto para transformar sua gestão de obras?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6">
                Junte-se a centenas de construtoras que já otimizaram seus processos com o Meta Construtor.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Começar Gratuitamente
                </button>
                <button
                  onClick={() => navigate('/contato')}
                  className="border-2 border-border hover:border-primary hover:bg-muted text-foreground px-8 py-3.5 rounded-lg font-semibold transition-all duration-300"
                >
                  Falar com Especialista
                </button>
              </div>
            </div>
          </section>
        </main>

        <FooterSection />
      </div>
    </PerformanceManager>
  );
};

export default Preco;