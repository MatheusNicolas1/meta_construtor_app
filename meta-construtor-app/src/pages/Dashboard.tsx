
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Users, FileText, CheckSquare, Settings, Filter, Building, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MiniChart } from '@/components/MiniChart';
import { CriticalAlerts } from '@/components/CriticalAlerts';
import { RecentRDOs } from '@/components/RecentRDOs';
import { useToast } from '@/hooks/use-toast';
import { rdoService } from '@/services/rdoService';
import { obraService } from '@/services/obraService';
import { equipeService } from '@/services/equipeService';
import { equipamentoService } from '@/services/equipamentoService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dadosDialog, setDadosDialog] = useState({ titulo: '', conteudo: '' });
  const [carregando, setCarregando] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [alertasCriticos, setAlertasCriticos] = useState<any[]>([]);

  // Carregar dados reais do Supabase
  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        setCarregando(true);

        // Carregar estatísticas de RDOs
        const { data: rdoStats, error: rdoError } = await rdoService.obterEstatisticas();
        
        // Carregar estatísticas de obras
        const { data: obraStats, error: obraError } = await obraService.obterEstatisticasObras();
        
        // Carregar estatísticas de equipamentos
        const { data: equipStats, error: equipError } = await equipamentoService.obterEstatisticasEquipamentos();
        
        // Carregar lista de obras
        const { data: obrasData, error: obrasListError } = await obraService.listarObras();
        
        // Carregar RDOs recentes
        const { data: rdosRecentes, error: rdosError } = await rdoService.listarRDOs();

        if (rdoError || obraError || equipError || obrasListError || rdosError) {
          throw new Error('Erro ao carregar dados do dashboard');
        }

        // Calcular estatísticas para os cards
        const hoje = new Date().toISOString().split('T')[0];
        const rdosHoje = rdosRecentes?.filter(rdo => rdo.data === hoje).length || 0;
        
        const statsData = [
          { 
            title: 'RDOs Hoje', 
            value: rdosHoje.toString(), 
            icon: FileText, 
            color: 'text-blue-600', 
            change: '+' + Math.floor(rdosHoje * 0.2),
            trend: [Math.max(0, rdosHoje-4), Math.max(0, rdosHoje-3), Math.max(0, rdosHoje-2), Math.max(0, rdosHoje-1), rdosHoje, rdosHoje+1, rdosHoje+2, rdosHoje],
            detalhes: `RDOs criados hoje: ${rdosHoje}. Total no mês: ${rdoStats?.este_mes || 0}`
          },
          { 
            title: 'Obras Ativas', 
            value: (obraStats?.ativas || 0).toString(), 
            icon: Building, 
            color: 'text-green-600', 
            change: '+' + Math.floor((obraStats?.ativas || 0) * 0.1),
            trend: Array.from({length: 8}, (_, i) => Math.max(0, (obraStats?.ativas || 0) - 4 + i)),
            detalhes: `Obras ativas: ${obraStats?.ativas || 0}. Total de obras: ${obraStats?.total || 0}. Pausadas: ${obraStats?.pausadas || 0}`
          },
          { 
            title: 'RDOs Pendentes', 
            value: (rdoStats?.enviados || 0).toString(), 
            icon: CheckSquare, 
            color: 'text-orange-600', 
            change: '-' + Math.floor((rdoStats?.enviados || 0) * 0.1),
            trend: Array.from({length: 8}, (_, i) => Math.max(0, (rdoStats?.enviados || 0) + 2 - i)),
            detalhes: `RDOs aguardando aprovação: ${rdoStats?.enviados || 0}. Aprovados: ${rdoStats?.aprovados || 0}. Rejeitados: ${rdoStats?.rejeitados || 0}`
          },
          { 
            title: 'Equipamentos OK', 
            value: `${equipStats?.disponiveis || 0}/${equipStats?.total_equipamentos || 0}`, 
            icon: Settings, 
            color: 'text-purple-600', 
            change: '+' + Math.floor((equipStats?.disponiveis || 0) * 0.05),
            trend: Array.from({length: 8}, (_, i) => Math.max(0, (equipStats?.disponiveis || 0) - 2 + i)),
            detalhes: `Equipamentos funcionais: ${equipStats?.disponiveis || 0}. Em manutenção: ${equipStats?.manutencao || 0}. Quebrados: ${equipStats?.quebrados || 0}`
          },
        ];

        setStats(statsData);

        // Processar dados das obras para o gráfico
        const obrasProcessadas = obrasData?.slice(0, 3).map(obra => ({
          id: obra.id,
          name: obra.nome,
          progress: Math.floor(Math.random() * 100), // TODO: Calcular progresso real
          status: obra.status === 'ativa' ? 'Em andamento' : 
                  obra.status === 'concluida' ? 'Finalizada' : 
                  obra.status === 'pausada' ? 'Pausada' : 'Em andamento',
          deadline: new Date(obra.data_previsao || Date.now()).toLocaleDateString('pt-BR'),
          orcamento: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obra.orcamento || 0),
          gasto: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((obra.orcamento || 0) * 0.6),
          responsavel: obra.responsavel,
          icon: Building
        })) || [];

        setProjects(obrasProcessadas);

        // Processar atividades recentes
        const atividadesRecentes = rdosRecentes?.slice(0, 4).map((rdo, index) => ({
          id: rdo.id,
          activity: `RDO ${rdo.status === 'enviado' ? 'enviado' : rdo.status === 'aprovado' ? 'aprovado' : 'criado'} - ${rdo.responsavel}`,
          time: new Date(rdo.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: rdo.status === 'aprovado' ? 'completed' : 
                  rdo.status === 'enviado' ? 'pending' : 
                  rdo.status === 'rejeitado' ? 'alert' : 'active',
          obra: rdo.obra?.nome || 'Obra não identificada',
          tipo: 'RDO'
        })) || [];

        setRecentActivities(atividadesRecentes);

        // Gerar alertas críticos baseados nos dados reais
        const alertas = [];
        
        if ((rdoStats?.enviados || 0) > 5) {
          alertas.push({
            id: '1',
            titulo: 'RDOs Pendentes',
            descricao: `${rdoStats?.enviados} RDOs aguardando aprovação`,
            tipo: 'warning' as const,
            categoria: 'rdo' as const,
            detalhes: `Existem ${rdoStats?.enviados} RDOs enviados aguardando aprovação. Revise-os para manter o fluxo de trabalho.`
          });
        }

        if ((equipStats?.quebrados || 0) > 0) {
          alertas.push({
            id: '2',
            titulo: 'Equipamentos com Problema',
            descricao: `${equipStats?.quebrados} equipamento(s) quebrado(s)`,
            tipo: 'error' as const,
            categoria: 'equipamento' as const,
            detalhes: `${equipStats?.quebrados} equipamento(s) estão marcados como quebrados e precisam de reparo urgente.`
          });
        }

        if ((obraStats?.pausadas || 0) > 0) {
          alertas.push({
            id: '3',
            titulo: 'Obras Pausadas',
            descricao: `${obraStats?.pausadas} obra(s) pausada(s)`,
            tipo: 'warning' as const,
            categoria: 'obra' as const,
            detalhes: `${obraStats?.pausadas} obra(s) estão com status pausado. Verifique se podem ser reativadas.`
          });
        }

        setAlertasCriticos(alertas);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast({
          title: "Erro ao carregar dashboard",
          description: "Não foi possível carregar os dados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosDashboard();
  }, []);



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
          {carregando ? (
            <div className="grid-responsive">
              {[1, 2, 3, 4].map((index) => (
                <Card key={index} className="responsive-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-end justify-between">
                      <div className="space-y-2">
                        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="hidden sm:block h-12 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid-responsive">
              {stats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="centered-card interactive-hover cursor-pointer"
                  onClick={() => handleKPIClick(stat)}
                >
                  <div className="centered-card-header border-0 pb-2">
                    <stat.icon className={`h-8 w-8 ${stat.color} mb-3`} />
                    <CardTitle className="card-subtitle-centered">
                      {stat.title}
                    </CardTitle>
                  </div>
                  <div className="centered-card-content">
                    <div className="text-center">
                      <div className="card-metric-value text-2xl sm:text-3xl mb-2">{stat.value}</div>
                      <div className="card-info-item justify-center">
                        <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                        <span className="card-metric-label">desde ontem</span>
                      </div>
                      <div className="mt-4 hidden sm:block">
                        <MiniChart data={stat.trend} color={stat.color.replace('text-', '').replace('-600', '')} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
              {carregando ? (
                // Loading state para obras
                [1, 2, 3].map((index) => (
                  <div key={index} className="space-y-3 p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted animate-pulse flex-shrink-0">
                        <div className="h-5 w-5 bg-muted rounded" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted animate-pulse rounded" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : projects.length === 0 ? (
                <div className="content-center py-12">
                  <div className="text-center max-w-md mx-auto">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full content-center mb-4">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma obra ativa</h3>
                    <p className="text-muted-foreground text-balance">Cadastre uma nova obra para começar a acompanhar o progresso</p>
                  </div>
                </div>
              ) : (
                projects.map((project, index) => (
                  <div 
                    key={project.id} 
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
                ))
              )}
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
              {carregando ? (
                // Loading state para atividades
                [1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-muted animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : recentActivities.length === 0 ? (
                <div className="content-center py-12">
                  <div className="text-center max-w-md mx-auto">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full content-center mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma atividade recente</h3>
                    <p className="text-muted-foreground text-balance">As atividades aparecerão aqui conforme forem executadas</p>
                  </div>
                </div>
              ) : (
                recentActivities.map((activity) => (
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
                ))
              )}
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
