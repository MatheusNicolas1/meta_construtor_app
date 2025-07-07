
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, FileText, AlertTriangle, CheckSquare, Building, DollarSign, Clock, Filter } from 'lucide-react';

export default function ObraDetail() {
  const { id } = useParams();
  const [selectedPeriodo, setSelectedPeriodo] = useState('30');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - seria vindo de uma API
  const obra = {
    id,
    nome: 'Shopping Center Norte',
    progresso: 75,
    status: 'Em andamento',
    deadline: '15/12/2024',
    orcamento: 'R$ 2.500.000,00',
    gasto: 'R$ 1.875.000,00',
    responsavel: 'João Silva',
    endereco: 'Av. Principal, 1000 - Centro',
    dataInicio: '15/01/2024'
  };

  const kpisObra = [
    { 
      title: 'Progresso Físico', 
      value: '75%', 
      icon: Building, 
      color: 'text-blue-600',
      change: '+5%',
      meta: '85% até fim do mês'
    },
    { 
      title: 'RDOs Este Mês', 
      value: '28', 
      icon: FileText, 
      color: 'text-green-600',
      change: '+12',
      meta: 'Média de 1.2 por dia'
    },
    { 
      title: 'Atividades Pendentes', 
      value: '8', 
      icon: CheckSquare, 
      color: 'text-orange-600',
      change: '-3',
      meta: '5 com prazo vencido'
    },
    { 
      title: 'Execução Orçamentária', 
      value: '75%', 
      icon: DollarSign, 
      color: 'text-purple-600',
      change: '+2%',
      meta: 'Dentro do planejado'
    },
  ];

  const atividadesObra = [
    { id: 1, titulo: 'Fundação Bloco A', status: 'em-andamento', prazo: '2024-01-20', responsavel: 'Equipe Alpha', prioridade: 'alta' },
    { id: 2, titulo: 'Instalação Elétrica', status: 'pendente', prazo: '2024-01-25', responsavel: 'Equipe Beta', prioridade: 'media' },
    { id: 3, titulo: 'Acabamento Sala 101', status: 'concluida', prazo: '2024-01-15', responsavel: 'Equipe Gamma', prioridade: 'baixa' },
  ];

  const documentosObra = [
    { id: 1, nome: 'Projeto Arquitetônico.pdf', tipo: 'projeto', tamanho: '2.3 MB', data: '2024-01-10' },
    { id: 2, nome: 'Memorial Descritivo.docx', tipo: 'memorial', tamanho: '1.8 MB', data: '2024-01-08' },
    { id: 3, nome: 'Licença Ambiental.pdf', tipo: 'licenca', tamanho: '856 KB', data: '2024-01-05' },
  ];

  const alertasObra = [
    { tipo: 'warning', titulo: 'Prazo em Risco', descricao: 'Fundação com 2 dias de atraso' },
    { tipo: 'info', titulo: 'Entrega Programada', descricao: 'Material de acabamento chega amanhã' },
    { tipo: 'error', titulo: 'Equipamento Indisponível', descricao: 'Guindaste G1 em manutenção' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em-andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-orange-100 text-orange-800';
      case 'baixa':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header da Obra */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{obra.nome}</h1>
            <p className="text-muted-foreground mt-1">{obra.endereco}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span>Responsável: <strong>{obra.responsavel}</strong></span>
              <span>Início: <strong>{obra.dataInicio}</strong></span>
              <span>Prazo: <strong>{obra.deadline}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{obra.status}</Badge>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Progresso Geral */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progresso Físico</span>
                <span>{obra.progresso}%</span>
              </div>
              <Progress value={obra.progresso} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Orçamento: </span>
                  <span className="font-medium">{obra.orcamento}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Executado: </span>
                  <span className="font-medium">{obra.gasto}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs da Obra */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpisObra.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{kpi.change}</span> {kpi.meta}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Visualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 3 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em-andamento">Em andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="atividades" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
          </TabsList>

          <TabsContent value="atividades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades da Obra</CardTitle>
                <CardDescription>
                  Atividades específicas desta obra
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {atividadesObra.map((atividade) => (
                  <div key={atividade.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <h4 className="font-medium">{atividade.titulo}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Responsável: {atividade.responsavel}</span>
                        <span>Prazo: {new Date(atividade.prazo).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(atividade.status)}>
                        {atividade.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={getPrioridadeColor(atividade.prioridade)}>
                        {atividade.prioridade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos da Obra</CardTitle>
                <CardDescription>
                  Documentos específicos desta obra
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentosObra.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{doc.nome}</h4>
                        <p className="text-sm text-muted-foreground">{doc.tamanho} • {new Date(doc.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertas e Notificações</CardTitle>
                <CardDescription>
                  Alertas específicos desta obra
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {alertasObra.map((alerta, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alerta.tipo === 'error' ? 'text-red-500' :
                      alerta.tipo === 'warning' ? 'text-orange-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium">{alerta.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                    </div>
                    <Badge variant={
                      alerta.tipo === 'error' ? 'destructive' :
                      alerta.tipo === 'warning' ? 'secondary' :
                      'default'
                    }>
                      {alerta.tipo === 'error' ? 'Crítico' :
                       alerta.tipo === 'warning' ? 'Atenção' :
                       'Info'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipe" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipe da Obra</CardTitle>
                <CardDescription>
                  Colaboradores alocados nesta obra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Informações da equipe serão exibidas aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
