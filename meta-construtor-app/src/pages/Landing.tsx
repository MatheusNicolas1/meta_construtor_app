
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CheckSquare, Users, FileText, Calendar, AlertTriangle, Settings } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: FileText,
      title: 'RDO Automático via WhatsApp',
      description: 'Colete relatórios diários diretamente do campo através do WhatsApp'
    },
    {
      icon: Calendar,
      title: 'Dashboard Completo',
      description: 'Visualize todas as atividades e progresso da obra em tempo real'
    },
    {
      icon: Users,
      title: 'Gestão de Equipes',
      description: 'Controle colaboradores, escalas e produtividade'
    },
    {
      icon: Settings,
      title: 'Controle de Equipamentos',
      description: 'Monitore máquinas, manutenções e falhas'
    },
    {
      icon: AlertTriangle,
      title: 'Registro de Segurança',
      description: 'Documente acidentes e implemente medidas preventivas'
    },
    {
      icon: CheckSquare,
      title: 'Controle de Atividades',
      description: 'Organize tarefas, prazos e status de execução'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-construction-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline">Entrar</Button>
            <Button className="gradient-primary">Começar Grátis</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-build-up">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Revolucione a Gestão da sua Obra
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Automatize relatórios via WhatsApp, controle equipes e equipamentos, 
            e tenha total visibilidade do progresso da sua construção em uma plataforma integrada.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="gradient-primary px-8">
              Experimentar Grátis
            </Button>
            <Button size="lg" variant="outline">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Funcionalidades Completas</h2>
          <p className="text-muted-foreground text-lg">
            Tudo que você precisa para gerenciar sua obra com eficiência
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 animate-build-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-construction py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">
              Pronto para Transformar sua Obra?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a centenas de construtoras que já otimizaram seus processos
            </p>
            <Button size="lg" variant="secondary" className="px-8">
              Começar Agora - Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo className="text-white mb-4 md:mb-0" />
            <p className="text-sm opacity-80">
              © 2024 MetaConstrutor. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
