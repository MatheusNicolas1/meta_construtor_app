import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePricingNavigation } from '@/hooks/usePricingNavigation';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';

const EnhancedTestimonials = () => {
  const navigate = useNavigate();
  const { navigateToFreePlan } = usePricingNavigation();

  const testimonials = [
    {
      quote: "Reduzimos 35% dos retrabalhos e aumentamos a produtividade em 28%. O ROI foi imediato e a equipe adorou a interface intuitiva.",
      name: "Carlos Eduardo Santos",
      designation: "Diretor de Operações • Construtora Alfa",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face&auto=format&q=80",
    },
    {
      quote: "A digitalização do RDO nos poupou 3 horas por dia. Relatórios automáticos e assinaturas digitais revolucionaram nossa operação.",
      name: "Marina Silva Costa",
      designation: "Gerente de Projetos • Horizonte Engenharia",
      src: "https://images.unsplash.com/photo-1494790108755-2616b612b742?w=500&h=500&fit=crop&crop=face&auto=format&q=80",
    },
    {
      quote: "Eliminamos 90% da papelada e ganhamos transparência total. Nossos clientes acompanham o progresso em tempo real.",
      name: "Roberto Mendes Lima",
      designation: "CEO • ObraSul",
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=face&auto=format&q=80",
    },
    {
      quote: "O controle de qualidade com checklists digitais nos permitiu reduzir não conformidades em 60%. Auditoria aprovada sem ressalvas.",
      name: "Ana Carolina Ferreira",
      designation: "Coordenadora de Obras • Urbanis",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop&crop=face&auto=format&q=80",
    },
    {
      quote: "A gestão de equipamentos nos salvou R$ 80 mil em manutenções. O sistema previne falhas antes que aconteçam.",
      name: "João Paulo Rodrigues",
      designation: "Engenheiro Civil • Ponte Azul Infra",
      src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&crop=face&auto=format&q=80",
    },
    {
      quote: "Conseguimos certificação ISO mais rápido com a documentação organizada. Transparência total em todos os processos.",
      name: "Fernanda Oliveira Santos",
      designation: "Diretora Técnica • NorteSteel",
      src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&h=500&fit=crop&crop=face&auto=format&q=80",
    }
  ];


  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground">
            Depoimentos verificados de quem usa o MetaConstrutor no dia a dia
          </p>
        </div>

        {/* Animated Testimonials */}
        <AnimatedTestimonials 
          testimonials={testimonials}
          autoplay={true}
          className="mb-12"
        />

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl"
            onClick={navigateToFreePlan}
          >
            Começar Gratuitamente
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Sem cartão de crédito • Teste grátis por 14 dias
          </p>
        </div>
      </div>
    </section>
  );
};

export default EnhancedTestimonials;