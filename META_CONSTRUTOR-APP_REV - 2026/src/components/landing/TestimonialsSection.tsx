import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import caseHorizonte from '@/assets/case-construtora-horizonte.jpg';
import caseSilva from '@/assets/case-engenharia-silva.jpg';
import caseModerna from '@/assets/case-incorporadora-moderna.jpg';

const TestimonialsSection = () => {

  const cases = [
    {
      title: 'Redução de 20% nos atrasos de obra',
      client: 'Construtora Horizonte',
      summary: 'Implementação do sistema de alertas automáticos e gestão de cronograma resultou em entregas pontuais.',
      result: 'R$ 80 mil economia',
      metric: 'redução de multas por atraso',
      image: caseHorizonte
    },
    {
      title: 'Economia de R$ 50 mil em retrabalho',
      client: 'Engenharia & Construção Silva',
      summary: 'Checklist digital e controle de qualidade preventivo eliminaram 85% dos retrabalhos identificados.',
      result: 'R$ 50 mil poupados',
      metric: 'em correções evitadas',
      image: caseSilva
    },
    {
      title: 'Aumento de 35% na produtividade',
      client: 'Incorporadora Moderna',
      summary: 'Digitalização completa dos processos e integração de equipes resultou em ganho significativo de eficiência.',
      result: '+35% produtividade',
      metric: 'das equipes de campo',
      image: caseModerna
    }
  ];

  const testimonials = [
    {
      quote: "O MetaConstrutor transformou nossa gestão. Conseguimos ter controle total das obras em tempo real e reduzimos drasticamente os retrabalhos.",
      name: "Carlos Eduardo Santos",
      designation: "Diretor de Operações • Construtora Horizonte",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "A digitalização do RDO foi um divisor de águas. Nossa equipe ganhou agilidade e os relatórios ficaram muito mais precisos e organizados.",
      name: "Marina Silva Costa",
      designation: "Gerente de Projetos • Engenharia & Construção Silva",
      src: "https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "Implementamos em todas as nossas obras. O ROI foi imediato com a redução de custos operacionais e melhoria na qualidade das entregas.",
      name: "Roberto Mendes",
      designation: "CEO • Incorporadora Moderna",
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "A plataforma revolucionou nossa forma de trabalhar. Agora temos transparência total nos processos e a comunicação entre equipes melhorou drasticamente.",
      name: "Ana Carolina Ferreira",
      designation: "Coordenadora de Obras • Construtora Vanguarda",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "O controle de qualidade através dos checklists digitais nos permitiu identificar e corrigir problemas antes que se tornassem custosos retrabalhos.",
      name: "João Paulo Rodrigues",
      designation: "Engenheiro Civil • Edificar Construtora",
      src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "Eliminamos 90% da papelada em nossas obras. O sistema de assinatura digital e aprovações online agilizou todo nosso processo.",
      name: "Fernanda Oliveira",
      designation: "Diretora Técnica • Construções Inovadora",
      src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "A gestão de equipamentos nos salvou milhares de reais em manutenções desnecessárias. O sistema previne falhas antes que aconteçam.",
      name: "Paulo Roberto Lima",
      designation: "Supervisor de Manutenção • Mega Construções",
      src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "Nossa produtividade aumentou 45% depois que começamos a usar os relatórios automáticos. Decisões rápidas com dados precisos.",
      name: "Larissa Monteiro",
      designation: "Gerente de Obras • Alpha Construções",
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "O cronograma visual me permite acompanhar 15 obras simultaneamente. Nunca mais perdi prazos importantes.",
      name: "Ricardo Almeida",
      designation: "Diretor de Projetos • Delta Empreendimentos",
      src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "A integração com WhatsApp centralizou toda nossa comunicação. Agora coordeno equipes direto do canteiro de obra.",
      name: "Juliana Santos",
      designation: "Coordenadora de Campo • Obra Prime",
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "Reduzimos custos de material em 30% com o controle de estoque integrado. O sistema evita desperdícios e compras desnecessárias.",
      name: "Marcos Vinicius",
      designation: "Gerente de Suprimentos • Construtech",
      src: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "A equipe aprendeu a usar em 2 dias. Interface intuitiva que não precisa de treinamento complexo para implementar.",
      name: "Camila Rodrigues",
      designation: "Analista de Processos • Nova Era Construções",
      src: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "Os alertas automáticos de segurança nos ajudaram a reduzir acidentes em 80%. Segurança nunca foi tão simples de gerenciar.",
      name: "André Felipe",
      designation: "Técnico em Segurança • SafeBuild",
      src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "Nossos clientes agora acompanham o progresso da obra em tempo real. Transparência total aumentou nossa credibilidade.",
      name: "Beatriz Lima",
      designation: "Gerente de Relacionamento • Premium Construtora",
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "O sistema de medições automatizadas eliminou erros humanos em 95%. Nossos cronogramas físico-financeiros são agora impecáveis.",
      name: "Diego Nascimento",
      designation: "Engenheiro de Planejamento • Precisão Engenharia",
      src: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    },
    {
      quote: "Conseguimos certificação PBQP-H mais rápido com a documentação digital organizada. Auditoria foi aprovada sem ressalvas.",
      name: "Priscila Moreira",
      designation: "Coordenadora de Qualidade • Excellence Build",
      src: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cases de Sucesso */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Resultados reais dos nossos clientes
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Veja como empresas de construção estão transformando sua gestão e 
              alcançando resultados extraordinários com o MetaConstrutor.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cases.map((case_item, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={case_item.image}
                      alt={`Case ${case_item.client}`}
                      className="w-full h-48 object-cover rounded-t-lg"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {case_item.result}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {case_item.title}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {case_item.client}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      {case_item.summary}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Métrica: <span className="font-medium">{case_item.metric}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Client Logos */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Empresas que confiam no MetaConstrutor
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60 flex-wrap">
              <div className="text-lg font-bold text-muted-foreground">CONSTRUTORA</div>
              <div className="text-lg font-bold text-muted-foreground">HORIZONTE</div>
              <div className="text-lg font-bold text-muted-foreground">ENG. SILVA</div>
              <div className="text-lg font-bold text-muted-foreground">INCORPORADORA</div>
              <div className="text-lg font-bold text-muted-foreground">MODERNA</div>
            </div>
          </div>
        </div>

        {/* Depoimentos */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-muted-foreground">
              Depoimentos reais de quem usa o MetaConstrutor no dia a dia
            </p>
          </div>

          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;