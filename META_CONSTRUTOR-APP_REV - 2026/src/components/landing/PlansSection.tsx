import React from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const PlansSection = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: 'para sempre',
      description: 'Ideal para pequenas obras e teste da plataforma',
      popular: false,
      features: [
        'Até 2 obras ativas',
        'RDO digital básico',
        'Checklist simples',
        'Relatórios básicos',
        'Suporte por email'
      ],
      cta: 'Começar Gratuitamente',
      ctaVariant: 'outline' as const
    },
    {
      name: 'Profissional',
      price: 'R$ 97',
      period: 'por mês',
      description: 'Solução completa para construtoras em crescimento',
      popular: true,
      badge: 'Mais Popular',
      features: [
        'Obras ilimitadas',
        'RDO digital completo',
        'Gestão avançada de equipes',
        'Relatórios personalizados',
        'Integrações WhatsApp + Gmail',
        'Backup automático',
        'Suporte prioritário'
      ],
      cta: 'Teste Gratuito por 14 dias',
      ctaVariant: 'default' as const
    },
    {
      name: 'Empresa',
      price: 'Sob consulta',
      period: 'personalizado',
      description: 'Solução enterprise para grandes construtoras',
      popular: false,
      features: [
        'Tudo do Profissional',
        'API completa disponível',
        'Customizações sob medida',
        'Múltiplas empresas',
        'SSO (Single Sign-On)',
        'Suporte 24/7 dedicado',
        'Implementação assistida'
      ],
      cta: 'Falar com Especialista',
      ctaVariant: 'outline' as const
    }
  ];

  const handlePlanClick = (plan: typeof plans[0]) => {
    // Analytics tracking
    if ((window as any).gtag) {
      (window as any).gtag('event', 'plan_click', {
        plan_name: plan.name,
        plan_price: plan.price,
        page_location: window.location.href
      });
    }

    if (plan.name === 'Empresa') {
      navigate('/contato');
    } else if (plan.name === 'Gratuito') {
      navigate('/login');
    } else {
      navigate(`/checkout?plan=${plan.name.toLowerCase()}`);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 bg-card' 
                  : 'border-border bg-card'
              } transition-all duration-300 hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge || 'Mais Popular'}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.price !== 'Sob consulta' && (
                    <span className="text-muted-foreground text-sm ml-1">
                      /{plan.period}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'border-2 border-primary text-primary hover:bg-primary/5'
                  }`}
                  variant={plan.ctaVariant}
                  size="lg"
                  onClick={() => handlePlanClick(plan)}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PlansSection;