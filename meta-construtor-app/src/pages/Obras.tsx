import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, MapPin, Users, DollarSign, Activity, Calculator, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { obraService } from '@/services/obraService';

type ObraStatus = 'Ativa' | 'Finalizada' | 'Pausada';

interface Obra {
  id: number;
  nome: string;
  endereco: string;
  orcamento: number;
  dataInicio: string;
  dataPrevisao: string;
  status: ObraStatus;
  responsavel: string;
  equipes: number;
  atividadesPrevistas: number;
  atividadesConcluidas: number;
  progresso: number;
  tipoOrcamento?: 'sintetico' | 'analitico';
}

export default function Obras() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [obras, setObras] = useState<Obra[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('Todas');

  // Verificar autenticação (incluindo modo demo)
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Carregar dados (incluindo modo demo)
  useEffect(() => {
    if (!authLoading && isAuthenticated()) {
    carregarObras();
    }
  }, [authLoading, isAuthenticated]);

  const carregarObras = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await obraService.listarObras();
      
      if (error) {
        console.error('Erro ao carregar obras:', error);
        
        // Se for erro de autenticação e não estiver autenticado, redirecionar para login
        if (error === 'Usuário não autenticado' && !isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        // Para outros erros, mostrar toast mas não bloquear a tela
        toast({
          title: "Aviso",
          description: "Não foi possível carregar algumas informações. Verifique sua conexão.",
          variant: "default",
        });
        
        // Definir lista vazia para mostrar estado de "nenhuma obra"
        setObras([]);
        return;
      }
      
      if (data && data.length > 0) {
        // Converter dados do Supabase para o formato da interface
        const obrasFormatadas = data.map(obra => ({
          id: parseInt(obra.id),
          nome: obra.nome,
          endereco: obra.endereco,
          orcamento: obra.orcamento,
          dataInicio: obra.data_inicio,
          dataPrevisao: obra.data_previsao,
          status: (obra.status.charAt(0).toUpperCase() + obra.status.slice(1)) as ObraStatus,
          responsavel: obra.responsavel,
          equipes: obra.total_equipes || 0,
          atividadesPrevistas: 0,
          atividadesConcluidas: 0,
          progresso: 0,
          tipoOrcamento: 'sintetico'
        }));
        setObras(obrasFormatadas);
      } else {
        // Se não há dados, definir lista vazia
        setObras([]);
      }
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
      setObras([]);
      
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta obra?')) return;
    
    try {
      const { error } = await obraService.deletarObra(id.toString());
      
      if (error) {
        throw new Error('Erro ao excluir obra');
      }

      // Recarregar lista de obras
      await carregarObras();
      
      toast({
        title: "Obra excluída!",
        description: "A obra foi removida do sistema com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir obra:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a obra. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Ativa': 'badge-success',
      'Finalizada': 'badge-info',
      'Pausada': 'badge-warning'
    };
    return variants[status as keyof typeof variants] || 'badge-info';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar obras baseado no status selecionado
  const getFilteredObras = () => {
    if (filterStatus === 'Todas') {
      return obras;
    }
    return obras.filter(obra => obra.status === filterStatus);
  };

  const filteredObras = getFilteredObras();

  const handleViewObra = (obraId: number) => {
    navigate(`/obras/${obraId}`);
  };

  const handleEditObra = (obraId: number) => {
    // Por enquanto redireciona para visualização, mas pode ser implementado modal de edição depois
    navigate(`/obras/${obraId}`);
  };

  // Mostrar loading se ainda carregando autenticação
  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Se não está autenticado, não mostrar nada (irá redirecionar)
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div>
            <h1 className="page-title">Obras</h1>
            <p className="page-description">Gerencie todas as obras e projetos em andamento</p>
          </div>
          
            {/* Filtros - Desktop (Tabs) */}
            <div className="hidden sm:block">
              <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                  <TabsTrigger 
                    value="Todas"
                    className="data-[state=active]:bg-[#FF5722] data-[state=active]:text-white text-foreground"
                  >
                    Todas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Ativa"
                    className="data-[state=active]:bg-[#FF5722] data-[state=active]:text-white text-foreground"
                  >
                    Ativas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Pausada"
                    className="data-[state=active]:bg-[#FF5722] data-[state=active]:text-white text-foreground"
                  >
                    Pausadas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="Finalizada"
                    className="data-[state=active]:bg-[#FF5722] data-[state=active]:text-white text-foreground"
                  >
                    Finalizadas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
                    </div>

            {/* Filtros - Mobile (Select) */}
            <div className="sm:hidden w-full max-w-xs">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="Todas">Todas as obras</SelectItem>
                  <SelectItem value="Ativa">Obras ativas</SelectItem>
                  <SelectItem value="Pausada">Obras pausadas</SelectItem>
                  <SelectItem value="Finalizada">Obras finalizadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

          <Button onClick={() => navigate('/obras/nova')} className="btn-standard w-full sm:w-auto">
                          <Plus className="h-4 w-4" />
            Nova Obra
                        </Button>
                      </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando obras...</p>
                      </div>
                    </div>
                  )}

        {/* Lista de Obras */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObras.map((obra) => (
            <Card 
              key={obra.id} 
              className="work-card interactive-hover cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              role="button"
              tabIndex={0}
              onClick={() => handleViewObra(obra.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewObra(obra.id);
                }
              }}
            >
              {/* Status Badge */}
              <div className="work-card-status">
                <Badge className={getStatusBadge(obra.status)}>
                  {obra.status}
                </Badge>
              </div>

              {/* Header Centralizado */}
              <div className="work-card-header">
                <h3 className="work-card-title">
                    {obra.nome}
                  </h3>
                <div className="work-card-subtitle">
                  <div className="card-info-item">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{obra.endereco}</span>
                    </div>
                  <div className="card-info-item">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{obra.responsavel}</span>
                  </div>
                </div>
              </div>

              {/* Conteúdo Organizado */}
              <div className="work-card-content">
                <div className="work-card-info">
                  {/* Métricas Principais */}
                  <div className="work-card-metrics">
                    <div className="work-card-metric">
                      <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
                      <span className="work-card-metric-value">{formatCurrency(obra.orcamento)}</span>
                      <span className="work-card-metric-label">Orçamento</span>
                    </div>
                    <div className="work-card-metric">
                      <Activity className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                      <span className="work-card-metric-value">{obra.progresso}%</span>
                      <span className="work-card-metric-label">Progresso</span>
                  </div>
                </div>

                  {/* Barra de Progresso */}
                  <div className="work-card-progress">
                    <div className="work-card-progress-info">
                      <span className="card-info-label">Atividades:</span>
                      <span className="card-info-value">{obra.atividadesConcluidas}/{obra.atividadesPrevistas}</span>
                  </div>
                    <div className="work-card-progress-bar">
                    <div 
                        className="card-progress-bar"
                      style={{ width: `${obra.progresso}%` }}
                    />
                  </div>
                </div>

                  {/* Datas */}
                  <div className="work-card-dates">
                    <div className="work-card-date-item">
                      <p className="card-info-label">Início</p>
                      <p className="card-info-value text-sm">{format(new Date(obra.dataInicio), 'dd/MM/yyyy')}</p>
                    </div>
                    <div className="work-card-date-item">
                      <p className="card-info-label">Previsão</p>
                      <p className="card-info-value text-sm">{format(new Date(obra.dataPrevisao), 'dd/MM/yyyy')}</p>
                  </div>
                </div>

                  {/* Tipo de Orçamento */}
                {obra.tipoOrcamento && (
                    <div className="card-info-item justify-center text-xs bg-muted/30 p-2 rounded-lg">
                    {obra.tipoOrcamento === 'analitico' ? <Calculator className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                      <span className="card-info-label">
                      Orçamento {obra.tipoOrcamento === 'analitico' ? 'Analítico' : 'Sintético'}
                    </span>
                  </div>
                )}
              </div>

                {/* Ações Centralizadas */}
              <div className="work-card-actions">
                <Button
                    variant="outline"
                  size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditObra(obra.id);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(obra.id);
                    }}
                  disabled={isLoading}
                    className="flex-1"
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}

        {/* Estado vazio - nenhuma obra filtrada */}
        {!isLoading && filteredObras.length === 0 && obras.length > 0 && (
          <div className="content-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full content-center mb-6">
              <Activity className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Nenhuma obra encontrada</h3>
              <p className="text-muted-foreground mb-6 text-balance">
                Não há obras com o status "{filterStatus}" no momento. Tente filtrar por outro status ou crie uma nova obra.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setFilterStatus('Todas')}
                  className="btn-standard"
                >
                  Ver todas
                </Button>
                <Button onClick={() => navigate('/obras/nova')} className="btn-standard">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Obra
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio - nenhuma obra cadastrada */}
        {!isLoading && obras.length === 0 && (
          <div className="content-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full content-center mb-6">
                <Activity className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Nenhuma obra cadastrada</h3>
              <p className="text-muted-foreground mb-6 text-balance">
                Comece criando sua primeira obra no sistema para acompanhar o progresso dos seus projetos
              </p>
              <Button onClick={() => navigate('/obras/nova')} className="btn-standard">
                <Plus className="h-4 w-4 mr-2" />
              Nova Obra
            </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
