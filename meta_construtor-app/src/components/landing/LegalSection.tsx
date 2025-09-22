import React, { useState } from 'react';
import { ChevronRight, FileText, Shield, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LegalSection = () => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const legalItems = [
    {
      id: 'terms',
      icon: FileText,
      title: 'Termos de Uso',
      description: 'Condições gerais para utilização da plataforma',
      content: `
        Ao utilizar o Meta Construtor, você concorda com os seguintes termos:
        
        1. O serviço é fornecido "como está", sem garantias expressas ou implícitas.
        2. Você é responsável por manter a confidencialidade de sua conta.
        3. É proibido usar o serviço para atividades ilegais ou não autorizadas.
        4. Podemos modificar ou descontinuar o serviço a qualquer momento.
        5. Seus dados serão tratados conforme nossa Política de Privacidade.
        
        Para mais detalhes, entre em contato conosco.
      `
    },
    {
      id: 'privacy',
      icon: Shield,
      title: 'Política de Privacidade',
      description: 'Como protegemos e utilizamos suas informações',
      content: `
        Sua privacidade é importante para nós:
        
        1. Coletamos apenas informações necessárias para prestar o serviço.
        2. Seus dados são criptografados e armazenados com segurança.
        3. Não vendemos ou compartilhamos suas informações pessoais.
        4. Você pode solicitar a exclusão de seus dados a qualquer momento.
        5. Utilizamos cookies apenas para melhorar sua experiência.
        
        Estamos em conformidade com a LGPD (Lei Geral de Proteção de Dados).
      `
    },
    {
      id: 'compliance',
      icon: Scale,
      title: 'Conformidade Legal',
      description: 'Regulamentações e certificações que seguimos',
      content: `
        O Meta Construtor está em conformidade com:
        
        1. LGPD - Lei Geral de Proteção de Dados Pessoais
        2. ISO 27001 - Gestão de Segurança da Informação
        3. Regulamentações da construção civil brasileira
        4. Normas de acessibilidade digital (WCAG 2.1)
        5. Certificações de segurança SOC 2 Type II
        
        Mantemos auditorias regulares para garantir o cumprimento.
      `
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <section id="legal" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Termos Legais
          </h2>
          <p className="text-lg text-muted-foreground">
            Transparência total sobre nossos termos, políticas e conformidades legais.
          </p>
        </div>

        <div className="space-y-4">
          {legalItems.map((item) => (
            <div 
              key={item.id}
              className="border border-border rounded-lg bg-card overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight 
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    expandedItem === item.id ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              {expandedItem === item.id && (
                <div className="px-6 pb-6 pt-0">
                  <div className="pl-14 prose prose-sm max-w-none text-muted-foreground">
                    <pre className="whitespace-pre-line text-sm leading-relaxed font-sans">
                      {item.content.trim()}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary/5 rounded-xl text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Dúvidas sobre questões legais?
          </h3>
          <p className="text-muted-foreground mb-4">
            Nossa equipe jurídica está disponível para esclarecer qualquer questão.
          </p>
          <Button variant="outline">
            Entrar em Contato
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LegalSection;