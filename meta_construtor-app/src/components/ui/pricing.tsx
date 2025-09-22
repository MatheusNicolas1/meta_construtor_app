"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

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

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Atualiza estados dos botões quando o carousel muda
  useEffect(() => {
    if (!api) return;

    const updateButtons = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    api.on("select", updateButtons);
    api.on("reInit", updateButtons);
    updateButtons(); // Atualiza imediatamente

    return () => {
      api.off("select", updateButtons);
      api.off("reInit", updateButtons);
    };
  }, [api]);

  // Centralizar no plano correto ao carregar
  useEffect(() => {
    if (api && plans.length > 0) {
      // Verifica se veio de botão "Começar" através da URL ou localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const targetPlan = urlParams.get('plan') || localStorage.getItem('targetPlan');
      
      let targetIndex;
      if (targetPlan === 'free') {
        targetIndex = plans.findIndex(plan => plan.name === "FREE");
        localStorage.removeItem('targetPlan'); // Limpa após uso
        
        // Remove o parâmetro da URL após uso para limpar
        if (urlParams.has('plan')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else {
        // Default: centralizar no Profissional
        targetIndex = plans.findIndex(plan => plan.name === "PROFISSIONAL");
      }
      
      if (targetIndex !== -1) {
        // Pequeno delay para garantir que o carousel esteja totalmente inicializado
        setTimeout(() => {
          api.scrollTo(targetIndex, false);
        }, 100);
      }
    }
  }, [api, plans]);

  // Navegação com debounce
  const handlePrevious = () => {
    if (!api || isNavigating || !canScrollPrev) return;
    setIsNavigating(true);
    api.scrollPrev();
    setTimeout(() => setIsNavigating(false), 200);
  };

  const handleNext = () => {
    if (!api || isNavigating || !canScrollNext) return;
    setIsNavigating(true);
    api.scrollNext();
    setTimeout(() => setIsNavigating(false), 200);
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [api, isNavigating, canScrollPrev, canScrollNext]);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
      <div className="w-full max-w-[100vw] py-20 px-2 sm:px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="text-center space-y-4 mb-4 max-w-[960px] w-[90%] mx-auto px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg whitespace-pre-line max-w-3xl mx-auto leading-relaxed mb-8">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-4 gap-2 sm:gap-4 px-2 sm:px-4 max-w-[960px] w-[90%] mx-auto">
        <span className="text-xs sm:text-sm font-medium">Mensal</span>
        <Label>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
          />
        </Label>
        <span className="text-xs sm:text-sm font-medium text-center">
          Anual <span className="text-primary font-semibold text-xs block sm:inline">(Economize 20%)</span>
        </span>
      </div>

      <div className="relative w-full max-w-[100vw] px-2 sm:px-0 pt-8 sm:pt-12 md:pt-16 pb-4">
        {/* Setas de navegação posicionadas acima dos cards */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 gap-4 sm:gap-6 relative z-20">
          <button
            onClick={handlePrevious}
            disabled={!canScrollPrev || isNavigating}
            className="min-w-[44px] min-h-[44px] h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed bg-background shadow-lg hover:shadow-xl active:scale-95 z-25 touch-manipulation"
            aria-label="Plano anterior"
            type="button"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={!canScrollNext || isNavigating}
            className="min-w-[44px] min-h-[44px] h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed bg-background shadow-lg hover:shadow-xl active:scale-95 z-25 touch-manipulation"
            aria-label="Próximo plano"
            type="button"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: false,
            slidesToScroll: 1,
            skipSnaps: false,
            dragFree: false,
            containScroll: "trimSnaps",
            duration: 30,
            watchDrag: true,
            breakpoints: {
              '(max-width: 640px)': { 
                align: 'center',
                containScroll: 'keepSnaps',
                slidesToScroll: 1,
                dragFree: false,
                duration: 25,
                watchDrag: true
              },
              '(max-width: 480px)': {
                align: 'center',
                containScroll: 'keepSnaps', 
                slidesToScroll: 1,
                dragFree: false,
                duration: 25,
                watchDrag: true
              }
            }
          }}
          className="w-full mx-auto max-w-[100vw] focus-visible:outline-none"
          role="region"
          aria-label="Planos de preços"
        >
          <CarouselContent className="ml-0 md:ml-1 lg:ml-2 px-1 sm:px-0 max-w-[100vw] pb-4 overflow-visible pt-8">
            {plans.map((plan, index) => (
              <CarouselItem 
                key={`${plan.name}-${index}`} 
                className={cn(
                  "pl-1 pr-1 sm:pl-1 md:pl-2 sm:pr-1 md:pr-2",
                  // Mobile: Cards ocupam quase toda tela (~960px reference), Desktop: múltiplos cards
                  "basis-[96%] sm:basis-[90%] md:basis-[50%] lg:basis-[35%] xl:basis-[30%] 2xl:basis-[25%]"
                )}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 120,
                    damping: 25,
                    delay: Math.min(index * 0.08, 0.3),
                  }}
                   className={cn(
                    "rounded-xl sm:rounded-2xl border bg-background text-center relative flex flex-col w-full mx-auto transition-all duration-300 hover:shadow-lg",
                    plan.isPopular 
                      ? "border-primary border-2 shadow-2xl ring-2 sm:ring-4 ring-primary/15 md:scale-[1.03] z-10 p-4 sm:p-4 md:p-5 min-h-[500px] sm:min-h-[580px] md:min-h-[660px] lg:min-h-[700px] max-w-[960px] overflow-visible" 
                      : "border-border hover:border-primary/40 p-4 sm:p-4 min-h-[500px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[640px] max-w-[960px] overflow-hidden"
                   )}
                >
                   {plan.isPopular && (
                     <div className="absolute -top-4 sm:-top-5 md:-top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary via-primary to-primary/90 py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-full flex items-center shadow-xl border-2 border-background whitespace-nowrap z-40 max-w-[calc(100%-16px)] backdrop-blur-sm">
                       <Star className="text-primary-foreground h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 fill-current mr-1.5 sm:mr-2 flex-shrink-0" />
                       <span className="text-primary-foreground font-bold text-xs sm:text-sm md:text-sm leading-tight tracking-wide">
                         Mais Popular
                       </span>
                     </div>
                   )}
                  
                   <div className="flex-1 flex flex-col pt-4 sm:pt-5">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3 px-2 leading-tight">
                        {plan.name}
                      </p>
                     
                      <div className="mt-1 sm:mt-2 flex items-baseline justify-center gap-x-1 px-2 mb-1 sm:mb-2">
                       {plan.price === "0" || plan.price === "Sob consulta" ? (
                         <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                           {plan.price === "0" ? "Grátis" : plan.price}
                         </span>
                       ) : (
                         <>
                          <span className="text-sm sm:text-base text-muted-foreground">R$</span>
                            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                             <NumberFlow
                               value={
                                 isMonthly ? Number(plan.price.replace(',', '.')) : Number(plan.yearlyPrice.replace(',', '.'))
                               }
                               willChange
                             />
                           </span>
                            {plan.period && (
                              <span className="text-sm sm:text-base font-medium text-muted-foreground ml-1">
                                /{plan.period}
                              </span>
                            )}
                         </>
                       )}
                     </div>

                      {plan.price !== "0" && plan.price !== "Sob consulta" && (
                        <p className="text-sm text-muted-foreground mb-2 sm:mb-3 px-2">
                          {isMonthly ? "Faturado mensalmente" : "Faturado anualmente"}
                        </p>
                      )}

                      <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground px-2 leading-relaxed text-center mb-4 sm:mb-5">
                        {plan.description}
                      </p>

                      <ul className="space-y-2 sm:space-y-3 flex-1 text-left px-2 mb-4 sm:mb-5">
                       {plan.features.map((feature, idx) => (
                         <li key={idx} className="flex items-start gap-2 sm:gap-2.5 text-sm sm:text-base">
                           <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                           <span className="text-foreground leading-relaxed">{feature}</span>
                         </li>
                       ))}
                     </ul>

                      <div className="px-2 mt-auto pb-1">
                        <button
                          onClick={() => navigate(plan.href)}
                          className={cn(
                            buttonVariants({
                              variant: plan.isPopular ? "default" : "outline",
                              size: "default"
                            }),
                            "w-full font-semibold transition-all duration-200 text-sm sm:text-base lg:text-lg py-2.5 sm:py-3.5",
                            plan.isPopular && "shadow-lg hover:shadow-xl"
                          )}
                        >
                          {plan.buttonText}
                        </button>
                      </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
      <div className="text-center mt-12 max-w-[960px] w-[90%] mx-auto px-2 sm:px-4">
        <p className="text-sm text-muted-foreground mb-4">
          Teste gratuito de 05 dias • Cancele a qualquer momento • Suporte incluído
        </p>
      </div>
    </div>
  );
}