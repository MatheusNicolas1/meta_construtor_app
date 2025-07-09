import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Shield, 
  Activity, 
  Search, 
  Calendar, 
  User, 
  Filter,
  Download,
  Trash2,
  BarChart3,
  AlertTriangle,
  Info,
  Clock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { logUsuarioService, LogUsuario, FiltrosLog, StatsLog } from '@/services/logUsuarioService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Auditoria: React.FC = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<LogUsuario[]>([]);
  const [stats, setStats] = useState<StatsLog | null>(null);
  const [activeTab, setActiveTab] = useState('logs');
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosLog>({
    limite: 50,
    offset: 0,
  });
  
  const [filtroTempo, setFiltroTempo] = useState({
    data_inicio: '',
    data_fim: '',
  });

  // Verificar permissão de acesso
  if (!profile || !['gerente', 'diretor'].includes(profile.nivel_acesso)) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        carregarLogs(),
        carregarEstatisticas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados de auditoria:', error);
      toast.error('Erro ao carregar dados de auditoria');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarLogs = async () => {
    try {
      const filtrosCompletos = {
        ...filtros,
        ...filtroTempo,
      };
      
      const logsData = await logUsuarioService.listarLogs(filtrosCompletos);
      setLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs de atividade');
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const statsData = await logUsuarioService.obterEstatisticas(30);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleFiltrar = async () => {
    setIsLoading(true);
    await carregarLogs();
    setIsLoading(false);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      limite: 50,
      offset: 0,
    });
    setFiltroTempo({
      data_inicio: '',
      data_fim: '',
    });
  };

  const handleLimparLogsAntigos = async () => {
    if (!confirm('Tem certeza que deseja limpar logs antigos (90+ dias)? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const removidos = await logUsuarioService.limparLogsAntigos();
      toast.success(`${removidos} logs antigos foram removidos`);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      toast.error('Erro ao limpar logs antigos');
    }
  };

  const exportarLogs = () => {
    try {
      const csvContent = [
        'Data,Usuário,Ação,Categoria,Descrição,Nível,Recurso',
        ...logs.map(log => [
          format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
          log.usuario_nome,
          logUsuarioService.formatarAcao(log.acao),
          log.categoria,
          log.descricao.replace(/,/g, ';'),
          log.nivel_sensibilidade,
          log.recurso_tipo ? `${log.recurso_tipo}:${log.recurso_id}` : ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `auditoria_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Relatório de auditoria exportado!');
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Auditoria e Logs
            </h1>
            <p className="text-gray-600 mt-1">
              Monitoramento de atividades e ações dos usuários
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportarLogs}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            {profile.nivel_acesso === 'diretor' && (
              <Button variant="outline" onClick={handleLimparLogsAntigos}>
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Antigos
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          {/* Logs de Atividade */}
          <TabsContent value="logs" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select 
                      value={filtros.categoria || ''} 
                      onValueChange={(value) => 
                        setFiltros(prev => ({ ...prev, categoria: value || undefined }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="obra">Obra</SelectItem>
                        <SelectItem value="rdo">RDO</SelectItem>
                        <SelectItem value="equipe">Equipe</SelectItem>
                        <SelectItem value="equipamento">Equipamento</SelectItem>
                        <SelectItem value="usuario">Usuário</SelectItem>
                        <SelectItem value="configuracao">Configuração</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Data Início</Label>
                    <Input
                      type="date"
                      value={filtroTempo.data_inicio}
                      onChange={(e) => setFiltroTempo(prev => ({ 
                        ...prev, 
                        data_inicio: e.target.value 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Data Fim</Label>
                    <Input
                      type="date"
                      value={filtroTempo.data_fim}
                      onChange={(e) => setFiltroTempo(prev => ({ 
                        ...prev, 
                        data_fim: e.target.value 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Limite</Label>
                    <Select 
                      value={filtros.limite?.toString() || '50'} 
                      onValueChange={(value) => 
                        setFiltros(prev => ({ ...prev, limite: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <Button onClick={handleFiltrar} disabled={isLoading}>
                      <Search className="w-4 h-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" onClick={handleLimparFiltros}>
                      Limpar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Logs de Atividade ({logs.length})
                  </span>
                  {isLoading && <LoadingSpinner />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Recurso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1 text-gray-400" />
                              {log.usuario_nome}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {logUsuarioService.formatarAcao(log.acao)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={logUsuarioService.getCategoriaColor(log.categoria)}>
                              {log.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={log.descricao}>
                              {log.descricao}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={logUsuarioService.getNivelSensibilidadeColor(log.nivel_sensibilidade)}>
                              {log.nivel_sensibilidade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.recurso_tipo && (
                              <span className="text-xs text-gray-500">
                                {log.recurso_tipo}:{log.recurso_id}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {logs.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Nenhum log encontrado</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Ajuste os filtros para ver os logs de atividade
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_logs}</div>
                    <p className="text-xs text-muted-foreground">
                      Últimos 30 dias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_usuarios_ativos}</div>
                    <p className="text-xs text-muted-foreground">
                      Com atividade registrada
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ações Críticas</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.logs_por_sensibilidade?.critico || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nível crítico
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categoria Principal</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Object.entries(stats.logs_por_categoria || {})
                        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mais frequente
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Gráficos e detalhes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logs por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats && Object.entries(stats.logs_por_categoria || {}).map(([categoria, total]) => (
                      <div key={categoria} className="flex justify-between items-center">
                        <span className="capitalize">{categoria}</span>
                        <Badge variant="outline">{total}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logs por Sensibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats && Object.entries(stats.logs_por_sensibilidade || {}).map(([nivel, total]) => (
                      <div key={nivel} className="flex justify-between items-center">
                        <Badge className={logUsuarioService.getNivelSensibilidadeColor(nivel)}>
                          {nivel}
                        </Badge>
                        <span className="font-medium">{total}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats && stats.top_acoes?.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{logUsuarioService.formatarAcao(item.acao)}</span>
                      <Badge variant="outline">{item.total}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Configurações de Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Coleta Automática</p>
                    <p className="text-sm text-muted-foreground">
                      Os logs são coletados automaticamente para obras, RDOs, equipes e ações críticas.
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium">Retenção de Dados</p>
                    <p className="text-sm text-muted-foreground">
                      Logs de baixa sensibilidade são removidos automaticamente após 90 dias.
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">Níveis de Acesso</p>
                    <p className="text-sm text-muted-foreground">
                      Apenas Gerentes e Diretores podem visualizar os logs de auditoria.
                    </p>
                  </div>
                </div>

                {profile.nivel_acesso === 'diretor' && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Ações Administrativas</h4>
                    <Button variant="outline" onClick={handleLimparLogsAntigos}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Logs Antigos (90+ dias)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Auditoria; 