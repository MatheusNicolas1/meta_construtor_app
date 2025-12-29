import React, { memo, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface OptimizedPricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

const PlanCard = memo(({ plan, isMonthly }: {
  plan: PricingPlan;
  isMonthly: boolean;
}) => {
  const navigate = useNavigate();

  const displayPrice = useMemo(() => 
    isMonthly ? plan.price : plan.yearlyPrice, 
    [isMonthly, plan.price, plan.yearlyPrice]
  );

  const billingText = useMemo(() => 
    isMonthly ? "faturado mensalmente" : "faturado anualmente", 
    [isMonthly]
  );

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className={cn(
        "rounded-2xl border p-5 bg-background text-center relative flex flex-col h-full min-h-[480px] w-full",
        plan.isPopular 
          ? "border-primary border-2 shadow-xl ring-2 ring-primary/20 transform scale-105 z-10 overflow-visible" 
          : "border-border hover:border-primary/30 transition-colors overflow-hidden"
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/90 py-2 px-5 rounded-full flex items-center shadow-xl border-2 border-background z-40">
          <Star className="text-primary-foreground h-3 w-3 fill-current mr-1.5" />
          <span className="text-primary-foreground font-bold text-xs tracking-wide">
            Mais Popular
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <p className="text-lg font-bold text-foreground mb-2 mt-2">
          {plan.name}
        </p>
        
        <div className="mt-3 flex items-center justify-center gap-x-2">
          {plan.price === "Grátis" || plan.price === "Sob consulta" ? (
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {displayPrice}
            </span>
          ) : (
            <>
              <span className="text-3xl font-bold tracking-tight text-foreground">
                R$ {displayPrice}
              </span>
              {plan.period && (
                <span className="text-sm font-medium leading-6 text-muted-foreground">
                  / {plan.period}
                </span>
              )}
            </>
          )}
        </div>

        {plan.price !== "Grátis" && plan.price !== "Sob consulta" && (
          <p className="text-xs text-muted-foreground mt-1">
            {billingText}
          </p>
        )}

        <p className="mt-3 text-sm text-muted-foreground px-1">
          {plan.description}
        </p>

        <ul className="mt-5 space-y-2.5 flex-1 text-left">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Button
            onClick={() => navigate(plan.href)}
            variant={plan.isPopular ? "default" : "outline"}
            className="w-full font-semibold"
          >
            {plan.buttonText}
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

PlanCard.displayName = 'PlanCard';

export const OptimizedPricing = memo(({ 
  plans, 
  title = "Planos Simples e Transparentes",
  description = "Escolha o plano que funciona para você"
}: OptimizedPricingProps) => {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 30,
        spread: 50,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["hsl(var(--primary))", "hsl(var(--accent))"],
        ticks: 150,
        gravity: 1,
        decay: 0.95,
        startVelocity: 25,
      });
    }
  };

  return (
    <div className="container py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-12 gap-4">
        <span className="text-sm font-medium">Mensal</span>
        <Label>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
          />
        </Label>
        <span className="text-sm font-medium">
          Anual <span className="text-primary font-semibold">(Economize 20%)</span>
        </span>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
          slidesToScroll: 1,
          watchDrag: true,
        }}
        className="w-full max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-center mb-8 gap-4">
          <CarouselPrevious className="relative left-0 translate-y-0 h-12 w-12 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200" />
          <CarouselNext className="relative right-0 translate-y-0 h-12 w-12 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200" />
        </div>
        
        <CarouselContent className="-ml-2 md:-ml-4">
          {plans.map((plan, index) => (
            <CarouselItem key={`${plan.name}-${index}`} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
              <PlanCard
                plan={plan}
                isMonthly={isMonthly}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-4">
          Teste gratuito de 05 dias • Cancele a qualquer momento • Suporte incluído
        </p>
      </div>
    </div>
  );
});

OptimizedPricing.displayName = 'OptimizedPricing';