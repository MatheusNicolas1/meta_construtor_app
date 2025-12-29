import React, { useRef, useEffect, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePricingNavigation } from '@/hooks/usePricingNavigation';
import { Card, CardContent } from '@/components/ui/card';

const VideoDemo = () => {
  const navigate = useNavigate();
  const { navigateToFreePlan } = usePricingNavigation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Intersection Observer para carregar vídeo apenas quando visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section id="demo-section" ref={sectionRef} className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Veja o MetaConstrutor em ação
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Acompanhe um fluxo completo: da busca global à criação de atividades, 
            passando pelo RDO até o acompanhamento de progresso das obras.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* Left - Video Demo */}
          <div className="relative order-2 lg:order-1">
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent className="p-0">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-background">
                  {isInView && (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster="/lovable-uploads/d26b1c16-cf45-4b95-907f-6a9dc3d91c1b.png"
                    >
                      {/* Placeholder - substitua pela URL do vídeo real */}
                      <source src="/demo-video.mp4" type="video/mp4" />
                      <source src="/demo-video.webm" type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {/* Fallback image se vídeo não carregar */}
                  {!isInView && (
                    <img
                      src="/lovable-uploads/d26b1c16-cf45-4b95-907f-6a9dc3d91c1b.png"
                      alt="Preview do dashboard MetaConstrutor"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Controls overlay */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-black/50 hover:bg-black/70 text-white border-0 w-8 h-8"
                      onClick={toggleMute}
                      aria-label={isMuted ? "Ativar som" : "Desativar som"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>

          {/* Right - Features Highlights */}
          <div className="order-1 lg:order-2">
            <div className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Fluxo completo em minutos
                </h3>
                <p className="text-muted-foreground">
                  Desde a busca rápida até o acompanhamento de resultados, 
                  veja como nossa plataforma acelera sua gestão diária.
                </p>
              </div>

              {/* Demo Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Busca Global Inteligente</h4>
                    <p className="text-sm text-muted-foreground">Encontre qualquer informação em segundos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Criação Rápida de Atividades</h4>
                    <p className="text-sm text-muted-foreground">Interface intuitiva para planejamento ágil</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">RDO Digital Automático</h4>
                    <p className="text-sm text-muted-foreground">Relatórios gerados sem esforço manual</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Progresso em Tempo Real</h4>
                    <p className="text-sm text-muted-foreground">Acompanhe obras recentes e métricas</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto touch-manipulation"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Começar Gratuitamente
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => window.open('https://youtube.com/watch?v=demo', '_blank')}
                  className="border-border hover:bg-muted w-full sm:w-auto touch-manipulation"
                >
                  Assistir Vídeo Completo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemo;