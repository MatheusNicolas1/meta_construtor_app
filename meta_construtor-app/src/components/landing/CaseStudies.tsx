import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePricingNavigation } from '@/hooks/usePricingNavigation';

const CaseStudies = () => {
  const navigate = useNavigate();
  const { navigateToFreePlan } = usePricingNavigation();

  const cases = [
    {
      sector: 'Residencial',
      location: 'São Paulo/SP',
      company: 'Construtora Horizonte',
      problem: 'Atrasos recorrentes e falta de visibilidade',
      solution: 'Cronograma inteligente e alertas automáticos',
      impact: [
        { metric: '-35%', label: 'retrabalho' },
        { metric: '+28%', label: 'produtividade' },
        { metric: '1,2h', label: 'poupadas/dia' }
      ],
      image: '/src/assets/case-construtora-horizonte.jpg',
      alt: 'Case Construtora Horizonte - Edifício residencial'
    },
    {
      sector: 'Comercial', 
      location: 'Rio de Janeiro/RJ',
      company: 'Engenharia Silva',
      problem: 'Documentação dispersa e RDO manual',
      solution: 'Digitalização completa e automação de processos',
      impact: [
        { metric: '-50%', label: 'tempo RDO' },
        { metric: '+40%', label: 'precisão' },
        { metric: '2,5h', label: 'economia/dia' }
      ],
      image: '/src/assets/case-engenharia-silva.jpg',
      alt: 'Case Engenharia Silva - Complexo comercial'
    },
    {
      sector: 'Industrial',
      location: 'Belo Horizonte/MG', 
      company: 'Incorporadora Moderna',
      problem: 'Controle de qualidade inconsistente',
      solution: 'Checklists digitais e evidências fotográficas',
      impact: [
        { metric: '-60%', label: 'não conformidades' },
        { metric: '+45%', label: 'qualidade' },
        { metric: '3,1h', label: 'ganho semanal' }
      ],
      image: '/src/assets/case-incorporadora-moderna.jpg',
      alt: 'Case Incorporadora Moderna - Complexo industrial'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Resultados reais
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Conheça empresas que transformaram sua gestão com o MetaConstrutor e 
            alcançaram resultados extraordinários em diferentes segmentos.
          </p>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-2 sm:px-0">
          {cases.map((case_item, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-border bg-card overflow-hidden">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <picture>
                    <source 
                      srcSet={`${case_item.image}?format=avif&w=400 400w, ${case_item.image}?format=avif&w=800 800w`}
                      type="image/avif"
                    />
                    <source 
                      srcSet={`${case_item.image}?format=webp&w=400 400w, ${case_item.image}?format=webp&w=800 800w`}
                      type="image/webp"
                    />
                    <img
                      src={case_item.image}
                      alt={case_item.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="225"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    />
                  </picture>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Sector badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">
                      {case_item.sector}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Company and location */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {case_item.company}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {case_item.location}
                    </p>
                  </div>

                  {/* Problem → Solution */}
                  <div className="mb-6 space-y-3">
                    <div>
                      <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                        PROBLEMA
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {case_item.problem}
                      </p>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                        SOLUÇÃO
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {case_item.solution}
                      </p>
                    </div>
                  </div>

                  {/* Impact KPIs */}
                  <div className="mb-6">
                    <div className="text-xs font-medium text-primary mb-2">
                      IMPACTO
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {case_item.impact.map((kpi, kpiIndex) => (
                        <div key={kpiIndex} className="flex items-center gap-1 text-xs">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="font-bold text-foreground">{kpi.metric}</span>
                          <span className="text-muted-foreground">{kpi.label}</span>
                          {kpiIndex < case_item.impact.length - 1 && (
                            <span className="text-muted-foreground ml-1">•</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between hover:bg-primary/10 text-primary hover:text-primary group/btn"
                    onClick={() => navigate(`/case-${case_item.company.toLowerCase().replace(/\s+/g, '-')}`)}
                  >
                    <span className="text-sm font-medium">Ver estudo de caso</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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

export default CaseStudies;