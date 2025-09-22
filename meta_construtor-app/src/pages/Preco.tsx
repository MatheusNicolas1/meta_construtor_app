import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from "@/components/SEO";
import LandingNavigation from '@/components/landing/LandingNavigation';
import { Pricing } from '@/components/ui/pricing';
import FooterSection from '@/components/landing/FooterSection';
import { PerformanceManager } from '@/components/PerformanceManager';

const demoPlans = [
  {
    name: "FREE",
    price: "0",
    yearlyPrice: "0",
    period: "por 14 dias",
    features: [
      "Teste gratuito de 14 dias",
      "1 usuário",
      "1 obra",
      "RDO básico",
      "Suporte por email",
      "Sem cartão de crédito",
    ],
    description: "Experimente todas as funcionalidades sem compromisso",
    buttonText: "Começar Grátis",
    href: "/criar-conta",
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
        description="Conheça nossos planos de preços. Desde R$ 129,90/mês. Teste gratuito de 14 dias. Escolha o plano ideal para sua construtora."
        canonical={window.location.href}
      />
      
      <LandingNavigation />
      
      <div className="min-h-screen bg-background w-full page-preco">
        <section id="pricing" className="page-first-section pt-32 pb-16 md:pt-40 md:pb-24 lg:py-20">
            <Pricing 
              plans={demoPlans}
              title="Planos que se adaptam ao seu negócio"
              description="Escolha o plano ideal para sua construtora. Todos os planos incluem acesso completo à plataforma, suporte técnico e atualizações gratuitas."
            />
        </section>
        <FooterSection />
      </div>
    </PerformanceManager>
  );
};

export default Preco;