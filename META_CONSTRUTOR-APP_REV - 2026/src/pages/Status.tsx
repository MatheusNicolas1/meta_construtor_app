import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';

const Status = () => {
  const services = [
    { name: 'API', status: 'operational', uptime: '99.99%' },
    { name: 'Web Application', status: 'operational', uptime: '99.98%' },
    { name: 'Database', status: 'operational', uptime: '100%' },
    { name: 'Storage', status: 'operational', uptime: '99.99%' },
    { name: 'Authentication', status: 'operational', uptime: '99.97%' }
  ];

  const incidents = [
    {
      date: '2024-01-10',
      title: 'Lentidão no carregamento de imagens',
      status: 'resolved',
      duration: '15 minutos',
      description: 'Problema resolvido com otimização de CDN'
    },
    {
      date: '2024-01-05',
      title: 'Manutenção programada do banco de dados',
      status: 'completed',
      duration: '2 horas',
      description: 'Atualização bem-sucedida sem impacto aos usuários'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'down':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500">Operacional</Badge>;
      case 'resolved':
        return <Badge className="bg-blue-500">Resolvido</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <SEO 
        title="Status - Meta Construtor"
        description="Status em tempo real dos serviços do Meta Construtor"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-500">Todos os sistemas operacionais</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Status da Plataforma
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhe o status em tempo real dos nossos serviços
            </p>
          </div>

          {/* Overall Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">99.98%</div>
                  <div className="text-sm text-muted-foreground">Uptime (últimos 30 dias)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">42ms</div>
                  <div className="text-sm text-muted-foreground">Latência média</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">0</div>
                  <div className="text-sm text-muted-foreground">Incidentes ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Status dos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <span className="font-medium text-foreground">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Uptime: {service.uptime}
                      </span>
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Incidentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incidents.map((incident, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{incident.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(incident.date).toLocaleDateString('pt-BR')}</span>
                          <span>Duração: {incident.duration}</span>
                        </div>
                      </div>
                      {getStatusBadge(incident.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscribe to Updates */}
          <Card className="mt-8 bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-4">
                Receba notificações de status
              </h3>
              <p className="mb-6 opacity-90">
                Seja notificado sobre incidentes e manutenções programadas
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="flex-1 px-4 py-2 rounded-lg text-foreground"
                />
                <button className="px-6 py-2 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors">
                  Inscrever
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Status;
