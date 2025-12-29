import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';

const Atualizacoes = () => {
  const updates = [
    {
      version: '2.5.0',
      date: '2024-01-15',
      type: 'feature',
      title: 'Sistema de Créditos por Compartilhamento',
      description: 'Ganhe créditos ao compartilhar obras e RDOs nas redes sociais.',
      items: [
        'Integração com redes sociais',
        'Sistema de créditos automático',
        'Dashboard de créditos acumulados'
      ]
    },
    {
      version: '2.4.0',
      date: '2024-01-10',
      type: 'feature',
      title: 'Melhorias em Checklists',
      description: 'Assinatura digital e templates personalizados.',
      items: [
        'Assinatura digital integrada',
        'Templates de checklist reutilizáveis',
        'Anexos por item'
      ]
    },
    {
      version: '2.3.5',
      date: '2024-01-05',
      type: 'improvement',
      title: 'Otimizações de Performance',
      description: 'Melhorias significativas na velocidade de carregamento.',
      items: [
        'Cache inteligente',
        'Lazy loading de componentes',
        'Redução de 40% no tempo de carregamento'
      ]
    },
    {
      version: '2.3.0',
      date: '2023-12-20',
      type: 'feature',
      title: 'Sistema de Integrações',
      description: 'Conecte com ferramentas externas.',
      items: [
        'Integração com Google Drive',
        'Webhooks personalizados',
        'API REST documentada'
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-primary text-primary-foreground';
      case 'improvement':
        return 'bg-accent text-accent-foreground';
      case 'fix':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'Novo';
      case 'improvement':
        return 'Melhoria';
      case 'fix':
        return 'Correção';
      default:
        return 'Atualização';
    }
  };

  return (
    <>
      <SEO 
        title="Atualizações - Meta Construtor"
        description="Acompanhe as últimas atualizações, novos recursos e melhorias do Meta Construtor"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Atualizações da Plataforma
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhe as últimas novidades e melhorias do Meta Construtor
            </p>
          </div>

          <div className="space-y-6">
            {updates.map((update) => (
              <Card key={update.version}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getTypeColor(update.type)}>
                          {getTypeLabel(update.type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Versão {update.version}
                        </span>
                      </div>
                      <CardTitle className="text-xl mb-2">{update.title}</CardTitle>
                      <CardDescription>{update.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
                      <Clock className="h-4 w-4" />
                      {new Date(update.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {update.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 bg-accent/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Em Desenvolvimento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Próximas funcionalidades que estamos desenvolvendo:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <span>App móvel nativo para iOS e Android</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <span>Relatórios avançados com IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <span>Integração com ERPs da construção civil</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Atualizacoes;
