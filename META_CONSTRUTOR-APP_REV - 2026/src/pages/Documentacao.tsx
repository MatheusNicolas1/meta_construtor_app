import React from 'react';
import { Code, BookOpen, Layers, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEO from '@/components/SEO';

const Documentacao = () => {
  return (
    <>
      <SEO 
        title="Documentação - Meta Construtor"
        description="Documentação técnica da API e guias de integração do Meta Construtor"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Documentação Técnica
            </h1>
            <p className="text-lg text-muted-foreground">
              Guias completos para desenvolvedores e integrações
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="api">API REST</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="sdk">SDKs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Guia de Início Rápido</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Comece a integrar em minutos com nosso guia passo a passo.
                    </CardDescription>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// Instalação
npm install @metaconstrutor/sdk

// Autenticação
const client = new MetaConstrutor({
  apiKey: 'sua-chave-api'
});`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Autenticação</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Use API Keys para autenticar suas requisições.
                    </CardDescription>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET \\
  https://api.metaconstrutor.com/obras \\
  -H 'Authorization: Bearer SUA_API_KEY'`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Rate Limits</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Limites de requisições por plano:
                    </CardDescription>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <li>• Free: 100 req/hora</li>
                      <li>• Profissional: 1.000 req/hora</li>
                      <li>• Empresarial: 10.000 req/hora</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Status da API</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Todos os sistemas operacionais</span>
                    </div>
                    <CardDescription>
                      Uptime: 99.9% | Latência: 45ms
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endpoints Principais</CardTitle>
                  <CardDescription>
                    Referência completa da API REST
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Obras</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded font-mono">GET</span>
                        <code>/api/v1/obras</code>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded font-mono">POST</span>
                        <code>/api/v1/obras</code>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded">
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded font-mono">PUT</span>
                        <code>/api/v1/obras/:id</code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">RDOs</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded font-mono">GET</span>
                        <code>/api/v1/rdos</code>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded font-mono">POST</span>
                        <code>/api/v1/rdos</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurando Webhooks</CardTitle>
                  <CardDescription>
                    Receba notificações em tempo real sobre eventos da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Eventos Disponíveis</h3>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                        <li>obra.created</li>
                        <li>obra.updated</li>
                        <li>rdo.created</li>
                        <li>rdo.approved</li>
                        <li>checklist.completed</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Exemplo de Payload</h3>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "event": "rdo.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "rdo_123",
    "obra_id": "obra_456",
    "data": "2024-01-15"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sdk" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript / Node.js</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`npm install @metaconstrutor/sdk

const MC = require('@metaconstrutor/sdk');
const client = new MC({ apiKey: 'xxx' });`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Python</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`pip install metaconstrutor

from metaconstrutor import Client
client = Client(api_key='xxx')`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>PHP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`composer require metaconstrutor/sdk

$client = new MetaConstrutor\\Client('xxx');`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Documentacao;
