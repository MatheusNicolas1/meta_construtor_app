import React, { useState } from 'react';
import { Search, BookOpen, FileQuestion, MessageCircle, Video, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const CentralAjuda = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      icon: BookOpen,
      title: 'Primeiros Passos',
      description: 'Aprenda o básico da plataforma',
      articles: 5
    },
    {
      icon: FileQuestion,
      title: 'RDO e Checklists',
      description: 'Gestão de atividades diárias',
      articles: 8
    },
    {
      icon: MessageCircle,
      title: 'Integrações',
      description: 'Conecte com outras ferramentas',
      articles: 6
    },
    {
      icon: Video,
      title: 'Vídeos Tutoriais',
      description: 'Aprenda visualmente',
      articles: 12
    }
  ];

  const popularArticles = [
    'Como criar minha primeira obra?',
    'Registrando um RDO diário',
    'Convidando membros da equipe',
    'Configurando integrações',
    'Gerando relatórios personalizados',
    'Políticas de segurança e privacidade'
  ];

  return (
    <>
      <SEO 
        title="Central de Ajuda - Meta Construtor"
        description="Encontre respostas, tutoriais e documentação sobre o Meta Construtor"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Como podemos ajudar?
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Busque por artigos, tutoriais ou dúvidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-center mb-12">Categorias de Ajuda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{category.articles} artigos</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Popular Articles */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Artigos Populares</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <span className="text-foreground">{article}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <Card className="mt-16 bg-primary text-primary-foreground max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Não encontrou o que procurava?</h3>
              <p className="text-lg mb-6 opacity-90">
                Nossa equipe de suporte está pronta para ajudar
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  Abrir Ticket de Suporte
                </Button>
                <Button variant="secondary" size="lg">
                  Chat ao Vivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CentralAjuda;
