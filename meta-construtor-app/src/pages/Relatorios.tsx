
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Filter,
  BarChart3,
  Building,
  Users,
  FileSpreadsheet,
  Plus,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Relatorio {
  id: number;
  titulo: string;
  tipo: 'mensal' | 'semanal' | 'personalizado';
  periodo: string;
  obra: string;
  status: 'ativo' | 'finalizado';
  equipe?: string;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export default function Relatorios() {
  const { toast } = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  
  const [filtros, setFiltros] = useState({
    titulo: '',
    tipo: 'mensal' as 'mensal' | 'semanal' | 'personalizado',
    dataInicio: '',
    dataFim: '',
    obra: '',
    status: 'ativo' as 'ativo' | 'finalizado',
    equipe: '',
    incluirRDOs: true,
    incluirAtividades: true,
    incluirEquipamentos: false,
    incluirCustos: true,
    incluirFotos: false
  });

  const [relatorios] = useState<Relatorio[]>([
    {
      id: 1,
      titulo: 'Relatório Mensal - Janeiro 2024',
      tipo: 'mensal',
      periodo: '01/01/2024 - 31/01/2024',
      obra: 'Shopping Center Norte',
      status: 'finalizado',
      equipe: 'Equipe Alpha',
      dataCriacao: '2024-02-01',
      dataUltimaAtualizacao: '2024-02-01'
    },
    {
      id: 2,
      titulo: 'Relatório Semanal - Semana 06',
      tipo: 'semanal',
      periodo: '05/02/2024 - 11/02/2024',
      obra: 'Residencial Jardins',
      status: 'ativo',
      equipe: 'Equipe Beta',
      dataCriacao: '2024-02-05',
      dataUltimaAtualizacao: '2024-02-11'
    }
  ]);

  const obras = ['Shopping Center Norte', 'Residencial Jardins', 'Torre Empresarial'];
  const equipes = ['Equipe Alpha', 'Equipe Beta', 'Equipe Charlie'];

  const handleGerarRelatorio = async (formato: 'pdf' | 'excel') => {
    if (!filtros.titulo || !filtros.obra) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e selecione uma obra para continuar.",
        variant: "destructive"
      });
      return;
    }

    if (filtros.tipo === 'personalizado' && (!filtros.dataInicio || !filtros.dataFim)) {
      toast({
        title: "Período obrigatório",
        description: "Para relatórios personalizados, defina o período inicial e final.",
        variant: "destructive"
      });
      return;
    }

    setGerandoRelatorio(true);

    try {
      // Simular geração do relatório
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: `Relatório ${formato.toUpperCase()} gerado!`,
        description: `O arquivo "${filtros.titulo}.${formato}" foi gerado e está sendo baixado.`
      });

      // Simular download
      const link = document.createElement('a');
      link.href = `#`;
      link.download = `${filtros.titulo}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      handleFecharModal();
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGerandoRelatorio(false);
    }
  };

  const handleVisualizarRelatorio = async (relatorio: Relatorio) => {
    setCarregando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Abrindo relatório",
        description: `Visualizando "${relatorio.titulo}" em nova aba.`
      });
      // Simular abertura em nova aba
      window.open('about:blank', '_blank');
    } catch (error) {
      toast({
        title: "Erro ao visualizar",
        description: "Não foi possível abrir o relatório.",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleBaixarRelatorio = async (relatorio: Relatorio, formato: 'pdf' | 'excel') => {
    setCarregando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: `Download iniciado`,
        description: `Baixando "${relatorio.titulo}.${formato}"`
      });
      
      // Simular download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${relatorio.titulo}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o relatório.",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setFiltros({
      titulo: '',
      tipo: 'mensal',
      dataInicio: '',
      dataFim: '',
      obra: '',
      status: 'ativo',
      equipe: '',
      incluirRDOs: true,
      incluirAtividades: true,
      incluirEquipamentos: false,
      incluirCustos: true,
      incluirFotos: false
    });
  };

  return (
    <Layout>
      <div className="section-container animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start section-spacing">
          <div className="space-y-2">
            <h1 className="page-title">Relatórios</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gere e gerencie relatórios de obras e atividades
            </p>
          </div>
          
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button className="gradient-primary mobile-button">
                <Plus className="mobile-button-icon" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gerar Novo Relatório
                </DialogTitle>
                <DialogDescription>
                  Configure os filtros e opções para gerar seu relatório personalizado
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Relatório *</Label>
                    <Input
                      id="titulo"
                      value={filtros.titulo}
                      onChange={(e) => setFiltros({...filtros, titulo: e.target.value})}
                      placeholder="Ex: Relatório Mensal - Fevereiro 2024"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Relatório</Label>
                      <Select value={filtros.tipo} onValueChange={(value: any) => setFiltros({...filtros, tipo: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="personalizado">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="obra">Obra *</Label>
                      <Select value={filtros.obra} onValueChange={(value) => setFiltros({...filtros, obra: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma obra" />
                        </SelectTrigger>
                        <SelectContent>
                          {obras.map(obra => (
                            <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {filtros.tipo === 'personalizado' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dataInicio">Data Inicial *</Label>
                        <Input
                          id="dataInicio"
                          type="date"
                          value={filtros.dataInicio}
                          onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataFim">Data Final *</Label>
                        <Input
                          id="dataFim"
                          type="date"
                          value={filtros.dataFim}
                          onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={filtros.status} onValueChange={(value: any) => setFiltros({...filtros, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipe">Equipe (Opcional)</Label>
                      <Select value={filtros.equipe} onValueChange={(value) => setFiltros({...filtros, equipe: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as equipes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas as equipes</SelectItem>
                          {equipes.map(equipe => (
                            <SelectItem key={equipe} value={equipe}>{equipe}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Opções de Conteúdo */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Incluir no Relatório:</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="incluirRDOs"
                        checked={filtros.incluirRDOs}
                        onCheckedChange={(checked) => setFiltros({...filtros, incluirRDOs: checked as boolean})}
                      />
                      <Label htmlFor="incluirRDOs" className="text-sm font-normal cursor-pointer">
                        RDOs (Relatórios Diários)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="incluirAtividades"
                        checked={filtros.incluirAtividades}
                        onCheckedChange={(checked) => setFiltros({...filtros, incluirAtividades: checked as boolean})}
                      />
                      <Label htmlFor="incluirAtividades" className="text-sm font-normal cursor-pointer">
                        Atividades Executadas
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="incluirEquipamentos"
                        checked={filtros.incluirEquipamentos}
                        onCheckedChange={(checked) => setFiltros({...filtros, incluirEquipamentos: checked as boolean})}
                      />
                      <Label htmlFor="incluirEquipamentos" className="text-sm font-normal cursor-pointer">
                        Equipamentos Utilizados
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="incluirCustos"
                        checked={filtros.incluirCustos}
                        onCheckedChange={(checked) => setFiltros({...filtros, incluirCustos: checked as boolean})}
                      />
                      <Label htmlFor="incluirCustos" className="text-sm font-normal cursor-pointer">
                        Custos e Orçamento
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 md:col-span-2">
                      <Checkbox
                        id="incluirFotos"
                        checked={filtros.incluirFotos}
                        onCheckedChange={(checked) => setFiltros({...filtros, incluirFotos: checked as boolean})}
                      />
                      <Label htmlFor="incluirFotos" className="text-sm font-normal cursor-pointer">
                        Fotos e Evidências
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFecharModal}
                  className="flex-1"
                  disabled={gerandoRelatorio}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleGerarRelatorio('pdf')}
                  disabled={gerandoRelatorio}
                  className="flex-1"
                  loading={gerandoRelatorio}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar PDF
                </Button>
                <Button
                  onClick={() => handleGerarRelatorio('excel')}
                  disabled={gerandoRelatorio}
                  className="flex-1 gradient-primary"
                  loading={gerandoRelatorio}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Gerar Excel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Relatórios */}
        <div className="grid-responsive">
          {relatorios.map((relatorio) => (
            <Card key={relatorio.id} className="responsive-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{relatorio.titulo}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{relatorio.periodo}</span>
                    </div>
                  </div>
                  <Badge variant={relatorio.status === 'ativo' ? 'default' : 'secondary'}>
                    {relatorio.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Obra:</span>
                    <span className="truncate">{relatorio.obra}</span>
                  </div>
                  {relatorio.equipe && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Equipe:</span>
                      <span className="truncate">{relatorio.equipe}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Tipo:</span>
                    <span className="capitalize">{relatorio.tipo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Criado em:</span>
                    <span>{new Date(relatorio.dataCriacao).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVisualizarRelatorio(relatorio)}
                    disabled={carregando}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBaixarRelatorio(relatorio, 'pdf')}
                    disabled={carregando}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBaixarRelatorio(relatorio, 'excel')}
                    disabled={carregando}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {relatorios.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum relatório encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece gerando seu primeiro relatório
            </p>
            <Button onClick={() => setModalAberto(true)} className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
