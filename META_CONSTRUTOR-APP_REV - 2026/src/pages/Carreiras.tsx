import React from 'react';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';

const Carreiras = () => {
  const openPositions = [
    {
      title: 'Desenvolvedor Full Stack Sênior',
      department: 'Engenharia',
      location: 'Remoto',
      type: 'Full-time',
      description: 'Procuramos desenvolvedor experiente em React, TypeScript e Node.js para arquitetar soluções inovadoras.'
    },
    {
      title: 'Designer UX/UI',
      department: 'Produto',
      location: 'São Paulo, SP',
      type: 'Full-time',
      description: 'Crie experiências incríveis para profissionais da construção civil.'
    },
    {
      title: 'Engenheiro Civil - Produto',
      department: 'Produto',
      location: 'Remoto',
      type: 'Full-time',
      description: 'Ajude-nos a criar funcionalidades que realmente atendam às necessidades da construção civil.'
    }
  ];

  const benefits = [
    'Trabalho remoto flexível',
    'Plano de saúde e odontológico',
    'Vale refeição/alimentação',
    'Auxílio home office',
    'Cursos e certificações',
    'Day off no aniversário',
    'Ambiente colaborativo',
    'Equipamentos de trabalho'
  ];

  return (
    <>
      <SEO 
        title="Carreiras - Meta Construtor"
        description="Junte-se à equipe Meta Construtor e ajude a revolucionar a gestão de obras na construção civil"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Construa sua carreira conosco
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Junte-se a uma equipe apaixonada por tecnologia e inovação na construção civil
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Por que trabalhar conosco?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <p className="text-foreground">{benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Open Positions */}
          <h2 className="text-3xl font-bold text-center mb-12">Vagas Abertas</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {openPositions.map((position, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{position.title}</CardTitle>
                      <CardDescription className="mb-4">
                        {position.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {position.department}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {position.location}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                    <Button className="ml-4">
                      Candidatar-se
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="mt-16 bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Não encontrou a vaga ideal?</h3>
              <p className="text-lg mb-6 opacity-90">
                Envie seu currículo para nosso banco de talentos
              </p>
              <Button variant="secondary" size="lg">
                Enviar Currículo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Carreiras;
