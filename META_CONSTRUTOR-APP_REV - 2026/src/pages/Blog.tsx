import React from 'react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';

const Blog = () => {
  const posts = [
    {
      title: '10 Dicas para Otimizar a Gestão de Obras',
      excerpt: 'Descubra as melhores práticas para gerenciar suas obras com eficiência e reduzir custos.',
      author: 'João Silva',
      date: '2024-01-15',
      category: 'Gestão',
      readTime: '5 min'
    },
    {
      title: 'Como o RDO Digital Revolucionou Nossa Construtora',
      excerpt: 'Case de sucesso mostrando economia de 30% no tempo de gestão.',
      author: 'Maria Santos',
      date: '2024-01-12',
      category: 'Case de Sucesso',
      readTime: '7 min'
    },
    {
      title: 'Integrações: Conectando sua Obra ao Ecossistema Digital',
      excerpt: 'Entenda como integrar o Meta Construtor com suas ferramentas favoritas.',
      author: 'Pedro Costa',
      date: '2024-01-10',
      category: 'Tecnologia',
      readTime: '6 min'
    },
    {
      title: 'Segurança de Dados na Construção Civil',
      excerpt: 'Proteção de informações sensíveis em projetos de construção.',
      author: 'Ana Lima',
      date: '2024-01-08',
      category: 'Segurança',
      readTime: '8 min'
    },
    {
      title: 'Checklist Digital: Aumente a Qualidade das Entregas',
      excerpt: 'Como usar checklists digitais para garantir padrão de qualidade.',
      author: 'Carlos Mendes',
      date: '2024-01-05',
      category: 'Qualidade',
      readTime: '5 min'
    },
    {
      title: 'Mobilidade na Obra: Gestão na Palma da Mão',
      excerpt: 'A importância do acesso móvel para engenheiros e gestores.',
      author: 'Juliana Rocha',
      date: '2024-01-03',
      category: 'Tecnologia',
      readTime: '4 min'
    }
  ];

  const categories = ['Todos', 'Gestão', 'Tecnologia', 'Case de Sucesso', 'Qualidade', 'Segurança'];

  return (
    <>
      <SEO 
        title="Blog - Meta Construtor"
        description="Artigos, dicas e novidades sobre gestão de obras e construção civil"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Blog Meta Construtor
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Artigos, dicas e insights sobre gestão de obras e tecnologia na construção civil
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <Button key={category} variant="outline">
                {category}
              </Button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <Badge className="w-fit mb-3">{post.category}</Badge>
                  <CardTitle className="text-xl mb-2 line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {post.readTime} de leitura
                    </span>
                    <Button variant="ghost" size="sm">
                      Ler mais
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter */}
          <Card className="mt-16 bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Receba novos artigos por email
              </h3>
              <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                Assine nossa newsletter e fique por dentro das últimas novidades sobre gestão de obras
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="flex-1 px-4 py-2 rounded-lg text-foreground"
                />
                <Button variant="secondary" size="lg">
                  Assinar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Blog;
