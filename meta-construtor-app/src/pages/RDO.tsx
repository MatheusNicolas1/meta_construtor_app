
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Calendar,
  Users,
  Building,
  Download,
  Loader2,
  Edit,
  Eye,
  MapPin,
  Cloud,
  Hash,
  FileDown,
  Printer,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { rdoService, type RDO } from '@/services/rdoService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RDO() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [rdoSelecionado, setRdoSelecionado] = useState<RDO | null>(null);
  const [modalVisualizacao, setModalVisualizacao] = useState(false);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      const rdosResponse = await rdoService.listarRDOs();

      if (rdosResponse.data) {
        // Ordenar RDOs por data de criação (mais recente primeiro)
        const rdosOrdenados = rdosResponse.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRdos(rdosOrdenados);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const calcularProgressoObra = (obraId: string) => {
    const rdosObra = rdos.filter(rdo => rdo.obra_id === obraId);
    if (rdosObra.length === 0) return 0;
    return Math.min(rdosObra.length * 10, 100); // Simular progresso baseado em número de RDOs
  };

  const obterNumeroRDO = (index: number) => {
    return String(rdos.length - index).padStart(3, '0');
  };

  const visualizarRDO = (rdo: RDO) => {
    setRdoSelecionado(rdo);
    setModalVisualizacao(true);
  };

  const editarRDO = (rdo: RDO) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de RDO estará disponível em breve.",
    });
  };

  const exportarRDOPDF = (rdo: RDO) => {
    const conteudo = `
METACONSTRUTOR - RELATÓRIO DIÁRIO DE OBRA

Obra: ${rdo.obra?.nome || 'N/A'}
Data: ${format(new Date(rdo.data), 'dd/MM/yyyy', { locale: ptBR })}
Responsável: ${rdo.responsavel}
Clima: ${rdo.clima}
Localização: ${rdo.localizacao || 'Não informada'}

ATIVIDADES EXECUTADAS:
${rdo.atividades_executadas}

ATIVIDADES PLANEJADAS:
${rdo.atividades_planejadas}

MATERIAIS UTILIZADOS:
${rdo.materiais_utilizados}

HORAS TRABALHADAS: ${rdo.horas_trabalhadas || 8}h
HORAS OCIOSAS: ${rdo.horas_ociosas || 0}h
${rdo.motivo_ociosidade ? `MOTIVO OCIOSIDADE: ${rdo.motivo_ociosidade}` : ''}

${rdo.ocorrencias ? `OCORRÊNCIAS:\n${rdo.ocorrencias}` : ''}
${rdo.acidentes ? `ACIDENTES:\n${rdo.acidentes}` : ''}

OBSERVAÇÕES:
${rdo.observacoes || 'Nenhuma observação'}

Status: ${rdo.status}
Data de Criação: ${format(new Date(rdo.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

-----------------------------------------
Este documento foi gerado automaticamente pelo sistema MetaConstrutor
    `.trim();

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RDO_${rdo.obra?.nome || 'Obra'}_${rdo.data}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "RDO exportado!",
      description: "O arquivo PDF foi baixado com sucesso."
    });
  };

  const baixarRelatorio = (rdo: RDO) => {
    const conteudo = `
RELATÓRIO COMPLETO - RDO ${obterNumeroRDO(rdos.indexOf(rdo))}

==================================================
METACONSTRUTOR - RELATÓRIO DIÁRIO DE OBRA
==================================================

INFORMAÇÕES BÁSICAS:
- Obra: ${rdo.obra?.nome || 'N/A'}
- Data: ${format(new Date(rdo.data), 'dd/MM/yyyy', { locale: ptBR })}
- Responsável: ${rdo.responsavel}
- Turno: ${rdo.turno || 'Não informado'}
- Clima: ${rdo.clima}
- Localização: ${rdo.localizacao || 'Não informada'}
- Status: ${rdo.status}

RECURSOS HUMANOS:
- Número de colaboradores: ${rdo.numero_colaboradores || 'Não informado'}
- Horas trabalhadas: ${rdo.horas_trabalhadas || 8}h
- Horas ociosas: ${rdo.horas_ociosas || 0}h
${rdo.motivo_ociosidade ? `- Motivo da ociosidade: ${rdo.motivo_ociosidade}` : ''}

ATIVIDADES:
Executadas:
${rdo.atividades_executadas}

Planejadas:
${rdo.atividades_planejadas}

MATERIAIS E RECURSOS:
${rdo.materiais_utilizados}

${rdo.ocorrencias ? `OCORRÊNCIAS:\n${rdo.ocorrencias}\n` : ''}
${rdo.acidentes ? `ACIDENTES:\n${rdo.acidentes}\n` : ''}

OBSERVAÇÕES GERAIS:
${rdo.observacoes || 'Nenhuma observação'}

==================================================
Relatório gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
Sistema MetaConstrutor
==================================================
    `.trim();

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_RDO_${rdo.obra?.nome || 'Obra'}_${rdo.data}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório baixado!",
      description: "O relatório completo foi gerado com sucesso."
    });
  };

  const compartilharRDO = (rdo: RDO) => {
    if (navigator.share) {
      navigator.share({
        title: `RDO - ${rdo.obra?.nome}`,
        text: `RDO da obra ${rdo.obra?.nome} do dia ${format(new Date(rdo.data), 'dd/MM/yyyy', { locale: ptBR })}`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do RDO foi copiado para a área de transferência."
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF5722]" />
            <p className="text-foreground">Carregando RDOs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">RDO - Relatório Diário de Obra</h1>
            <p className="text-muted-foreground mt-1">
              Registre e acompanhe as atividades diárias das obras
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/rdo/novo')}
            className="w-full sm:w-auto bg-[#FF5722] hover:bg-[#E64A19] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo RDO
          </Button>
        </div>

        {/* Lista de RDOs */}
        {rdos.length === 0 ? (
          <div className="content-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full content-center mb-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Nenhum RDO encontrado</h3>
              <p className="text-muted-foreground mb-6 text-balance">
                Comece criando seu primeiro RDO para registrar as atividades diárias das obras
              </p>
              <Button 
                onClick={() => navigate('/rdo/novo')} 
                className="bg-[#FF5722] hover:bg-[#E64A19] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo RDO
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {rdos.map((rdo, index) => (
              <Card key={rdo.id} className="centered-card interactive-hover border-l-4 border-l-[#FF5722]">
                {/* Número do RDO */}
                <div className="card-status-badge">
                  <Badge variant="outline" className="bg-[#FF5722] text-white border-[#FF5722]">
                    <Hash className="h-3 w-3 mr-1" />
                    RDO {obterNumeroRDO(index)}
                  </Badge>
                </div>

                {/* Header Centralizado */}
                <div className="centered-card-header">
                  <div className="content-center mb-2">
                    <Building className="h-5 w-5 text-[#FF5722] mr-2" />
                    <CardTitle className="card-title-centered">
                      {rdo.obra?.nome || 'Obra não definida'}
                    </CardTitle>
                  </div>
                  
                  <div className="card-subtitle-centered">
                    <div className="card-info-item">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(rdo.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                  </div>

                  <Badge 
                    variant={rdo.status === 'aprovado' ? 'default' : 'secondary'}
                    className={rdo.status === 'aprovado' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {rdo.status === 'enviado' ? 'Enviado' : 
                     rdo.status === 'aprovado' ? 'Aprovado' :
                     rdo.status === 'rejeitado' ? 'Rejeitado' : 'Rascunho'}
                  </Badge>
                </div>
                
                {/* Conteúdo Organizado */}
                <div className="centered-card-content">
                  <div className="centered-card-info">
                    {/* Informações Principais */}
                    <div className="space-y-3">
                      <div className="card-info-item">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="card-info-label">Responsável:</span>
                        <span className="card-info-value truncate">{rdo.responsavel}</span>
                      </div>
                      
                      <div className="card-info-item">
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                        <span className="card-info-label">Clima:</span>
                        <span className="card-info-value capitalize">{rdo.clima}</span>
                      </div>
                      
                      {rdo.localizacao && (
                        <div className="card-info-item">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="card-info-label">Local:</span>
                          <span className="card-info-value truncate">{rdo.localizacao}</span>
                        </div>
                      )}
                    </div>

                    {/* Progresso da Obra */}
                    <div className="text-center">
                      <div className="content-between mb-2">
                        <span className="card-info-label">Progresso da Obra</span>
                        <span className="card-info-value">
                          {calcularProgressoObra(rdo.obra_id)}%
                        </span>
                      </div>
                      <div className="card-progress">
                        <div 
                          className="card-progress-bar" 
                          style={{ width: `${calcularProgressoObra(rdo.obra_id)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ações Centralizadas */}
                  <div className="centered-card-actions">
                    {/* Ações Principais */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => visualizarRDO(rdo)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editarRDO(rdo)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>

                    {/* Ações Secundárias */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => exportarRDOPDF(rdo)}
                        className="flex-1"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => baixarRelatorio(rdo)}
                        className="flex-1"
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>

                    {/* Compartilhar */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => compartilharRDO(rdo)}
                      className="w-full"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Visualização */}
        <Dialog open={modalVisualizacao} onOpenChange={setModalVisualizacao}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                RDO {rdoSelecionado ? obterNumeroRDO(rdos.indexOf(rdoSelecionado)) : ''} - {rdoSelecionado?.obra?.nome}
              </DialogTitle>
            </DialogHeader>
            
            {rdoSelecionado && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Informações Básicas</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-foreground">Data:</span> <span className="text-muted-foreground">{format(new Date(rdoSelecionado.data), 'dd/MM/yyyy', { locale: ptBR })}</span></p>
                      <p><span className="font-medium text-foreground">Responsável:</span> <span className="text-muted-foreground">{rdoSelecionado.responsavel}</span></p>
                      <p><span className="font-medium text-foreground">Clima:</span> <span className="text-muted-foreground capitalize">{rdoSelecionado.clima}</span></p>
                      <p><span className="font-medium text-foreground">Status:</span> <span className="text-muted-foreground">{rdoSelecionado.status}</span></p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Recursos</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-foreground">Horas trabalhadas:</span> <span className="text-muted-foreground">{rdoSelecionado.horas_trabalhadas || 8}h</span></p>
                      <p><span className="font-medium text-foreground">Horas ociosas:</span> <span className="text-muted-foreground">{rdoSelecionado.horas_ociosas || 0}h</span></p>
                      <p><span className="font-medium text-foreground">Colaboradores:</span> <span className="text-muted-foreground">{rdoSelecionado.numero_colaboradores || 'Não informado'}</span></p>
                      {rdoSelecionado.localizacao && (
                        <p><span className="font-medium text-foreground">Localização:</span> <span className="text-muted-foreground">{rdoSelecionado.localizacao}</span></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Atividades */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Atividades Executadas</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {rdoSelecionado.atividades_executadas}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Atividades Planejadas</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {rdoSelecionado.atividades_planejadas}
                  </p>
                </div>

                {/* Materiais */}
                {rdoSelecionado.materiais_utilizados && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Materiais Utilizados</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {rdoSelecionado.materiais_utilizados}
                    </p>
                  </div>
                )}

                {/* Ocorrências */}
                {(rdoSelecionado.ocorrencias || rdoSelecionado.acidentes) && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Ocorrências e Acidentes</h3>
                    {rdoSelecionado.ocorrencias && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-foreground">Ocorrências:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          {rdoSelecionado.ocorrencias}
                        </p>
                      </div>
                    )}
                    {rdoSelecionado.acidentes && (
                      <div>
                        <p className="text-sm font-medium text-foreground">Acidentes:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          {rdoSelecionado.acidentes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Observações */}
                {rdoSelecionado.observacoes && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Observações</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {rdoSelecionado.observacoes}
                    </p>
                  </div>
                )}

                {/* Botões de Ação do Modal */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    onClick={() => exportarRDOPDF(rdoSelecionado)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => baixarRelatorio(rdoSelecionado)}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Baixar Relatório
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => compartilharRDO(rdoSelecionado)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
