
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Users, FileText, CheckSquare, Settings, Filter, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MiniChart } from '@/components/MiniChart';
import { CriticalAlerts } from '@/components/CriticalAlerts';
import { RecentRDOs } from '@/components/RecentRDOs';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dadosDialog, setDadosDialog] = useState({ titulo: '', conteudo: '' });

  const stats = [
    { 
      title: 'RDOs Hoje', 
      value: '12', 
      icon: FileText, 
      color: 'text-blue-600', 
      change: '+2',
      trend: [8, 10, 9, 12, 11, 14, 13, 12],
      detalhes: 'RDOs criados hoje: Shopping Center Norte (3), Residencial Jardins (5), Torre Empresarial (4)'
    },
    { 
      title: 'Equipes Ativas', 
      value: '8', 
      icon: Users, 
      color: 'text-green-600', 
      change: '+1',
      trend: [6, 7, 8, 7, 8, 8, 7, 8],
      detalhes: 'Equipes em atividade: Alvenaria (2), Elétrica (2), Hidráulica (1), Acabamento (2), Limpeza (1)'
    },
    { 
      title: 'Atividades Pendentes', 
      value: '24', 
      icon: CheckSquare, 
      color: 'text-orange-600', 
      change: '-3',
      trend: [30, 28, 26, 29, 27, 25, 27, 24],
      detalhes: 'Atividades por prioridade: Alta (8), Média (12), Baixa (4). Vencidas: 3'
    },
    { 
      title: 'Equipamentos OK', 
      value: '15/18', 
      icon: Settings, 
      color: 'text-purple-600', 
      change: '+1',
      trend: [14, 13, 15, 14, 16, 15, 14, 15],
      detalhes: 'Equipamentos funcionais: 15. Em manutenção: 2. Indisponíveis: 1'
    },
  ];

  const recentActivities = [
    { id: 1, activity: 'RDO enviado - Equipe Alpha', time: '10:30', status: 'completed', obra: 'Shopping Center Norte', tipo: 'RDO' },
    { id: 2, activity: 'Equipamento X1 - Manutenção', time: '09:15', status: 'pending', obra: 'Residencial Jardins', tipo: 'Manutenção' },
    { id: 3, activity: 'Nova tarefa criada - Fundação', time: '08:45', status: 'active', obra: 'Torre Empresarial', tipo: 'Tarefa' },
    { id: 4, activity: 'Registro de segurança - Zona B', time: '08:20', status: 'alert', obra: 'Shopping Center Norte', tipo: 'Segurança' },
  ];

  const projects = [
    { 
      id: '1',
      name: 'Shopping Center Norte', 
      progress: 75, 
      status: 'Em andamento', 
      deadline: '15/12/2024',
      orcamento: 'R$ 2.500.000,00',
      gasto: 'R$ 1.875.000,00',
      responsavel: 'João Silva',
      icon: Building
    },
    { 
      id: '2',
      name: 'Residencial Jardins', 
      progress: 45, 
      status: 'Em andamento', 
      deadline: '30/01/2025',
      orcamento: 'R$ 1.800.000,00',
      gasto: 'R$ 810.000,00',
      responsavel: 'Maria Santos',
      icon: Building
    },
    { 
      id: '3',
      name: 'Torre Empresarial', 
      progress: 90, 
      status: 'Finalizando', 
      deadline: '10/11/2024',
      orcamento: 'R$ 3.200.000,00',
      gasto: 'R$ 2.880.000,00',
      responsavel: 'Carlos Oliveira',
      icon: Building
    },
  ];

  const alertasCriticos = [
    { 
      id: '1',
      titulo: 'Prazo em Risco', 
      descricao: 'Torre Empresarial - 5 dias de atraso', 
      tipo: 'warning' as const,
      categoria: 'prazo' as const,
      detalhes: 'A obra Torre Empresarial está com 5 dias de atraso no cronograma. Necessária revisão do planejamento.'
    },
    { 
      id: '2',
      titulo: 'Orçamento Excedido', 
      descricao: 'Shopping Center Norte - 5% acima do previsto', 
      tipo: 'error' as const,
      categoria: 'custo' as const,
      detalhes: 'O orçamento do Shopping Center Norte ultrapassou em 5% o valor planejado devido a materiais extras.'
    },
    { 
      id: '3',
      titulo: 'Equipamento Indisponível', 
      descricao: 'Guindaste G1 - Manutenção urgente', 
      tipo: 'warning' as const,
      categoria: 'equipamento' as const,
      detalhes: 'O Guindaste G1 necessita de manutenção urgente e está temporariamente indisponível.'
    }
  ];

  const handleKPIClick = (stat: any) => {
    setDadosDialog({
      titulo: stat.title,
      conteudo: stat.detalhes
    });
    setDialogAberto(true);
  };

  return (
    <Layout>
      <div className="section-container animate-build-up">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-between md:items-start section-spacing">
          <div className="space-y-1">
            <h1 className="page-title">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Visão geral dos projetos e atividades
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button variant="outline" className="mobile-button interactive-hover">
              <Filter className="mobile-button-icon" />
              <span className="hidden sm:inline">Filtrar</span>
            </Button>
            <Button 
              className="gradient-primary mobile-button" 
              onClick={() => navigate('/rdo')}
            >
              <Calendar className="mobile-button-icon" />
              Novo RDO
            </Button>
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="section-spacing">
          <CriticalAlerts alertas={alertasCriticos} />
        </div>

        {/* Stats Grid - Com mini gráficos */}
        <div className="section-spacing">
          <div className="grid-responsive">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="responsive-card interactive-hover cursor-pointer"
                onClick={() => handleKPIClick(stat)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`mobile-button-icon ${stat.color}`} />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {stat.change}
                        </span> desde ontem
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <MiniChart data={stat.trend} color={stat.color.replace('text-', '').replace('-600', '')} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Últimos RDOs Cadastrados */}
        <div className="section-spacing">
          <RecentRDOs />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Projects Progress */}
          <Card className="lg:col-span-2 responsive-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#F7931E]" />
                Obras em Andamento
              </CardTitle>
              <CardDescription>
                Acompanhe o progresso das obras ativas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {projects.map((project, index) => (
                <div 
                  key={index} 
                  className="space-y-3 p-3 sm:p-4 border rounded-lg interactive-hover cursor-pointer transition-all duration-200" 
                  onClick={() => navigate(`/obras/${project.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#F7931E]/10 flex-shrink-0">
                      <project.icon className="h-5 w-5 text-[#F7931E]" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium hover:text-[#F7931E] transition-colors truncate">
                        {project.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Responsável: {project.responsavel}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant={project.progress > 80 ? "default" : "secondary"} className="mb-1">
                        {project.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {project.deadline}
                      </p>
                    </div>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Progresso: </span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="truncate">
                      <span className="text-muted-foreground">Orçamento: </span>
                      <span className="font-medium">{project.orcamento}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="responsive-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas atualizações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg interactive-hover transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-orange-500' :
                    activity.status === 'active' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.tipo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight">
                      {activity.activity}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.obra}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Dialog para KPIs */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="modal-content">
            <DialogHeader className="modal-header">
              <DialogTitle className="modal-title">{dadosDialog.titulo}</DialogTitle>
              <DialogDescription>
                Detalhamento dos dados
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm leading-relaxed">{dadosDialog.conteudo}</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
