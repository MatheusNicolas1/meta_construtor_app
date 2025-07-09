import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MultiRdoExport } from '@/components/MultiRdoExport';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Calculator, 
  FileText, 
  Camera, 
  HardHat,
  Wrench,
  Clock,
  User,
  Eye,
  EyeOff,
  Download,
  ZoomIn
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ObraDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFinancialSummary, setShowFinancialSummary] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
  
  // Mock user role - in real app would come from auth context
  const userRole = 'diretor'; // 'diretor', 'gerente', 'engenheiro', 'mestre'
  const canViewFinancial = ['diretor', 'gerente'].includes(userRole);

  // Mock data - would come from API
  const obra = {
    id: parseInt(id || '1'),
    nome: 'Shopping Center Norte',
    endereco: 'Av. Principal, 1000 - Centro, São Paulo/SP',
    orcamento: 2500000,
    dataInicio: '2024-01-15',
    dataPrevisao: '2024-12-15',
    status: 'Ativa',
    responsavel: 'João Silva',
    equipes: 3,
    atividadesPrevistas: 12,
    atividadesConcluidas: 8,
    progresso: 67,
    tipoOrcamento: 'analitico',
    atividades: [
      { id: 1, nome: 'Fundação', unidade: 'm³', quantitativo: 150, valorUnitario: 250, valorTotal: 37500 },
      { id: 2, nome: 'Estrutura', unidade: 'm³', quantitativo: 300, valorUnitario: 400, valorTotal: 120000 },
      { id: 3, nome: 'Alvenaria', unidade: 'm²', quantitativo: 800, valorUnitario: 85, valorTotal: 68000 },
      { id: 4, nome: 'Cobertura', unidade: 'm²', quantitativo: 500, valorUnitario: 120, valorTotal: 60000 },
    ],
    equipeAlocada: [
      { id: 1, nome: 'Carlos Santos', funcao: 'Pedreiro', diasTrabalhados: 45, horasOciosas: 8 },
      { id: 2, nome: 'Maria Silva', funcao: 'Servente', diasTrabalhados: 40, horasOciosas: 12 },
      { id: 3, nome: 'José Lima', funcao: 'Eletricista', diasTrabalhados: 30, horasOciosas: 5 },
    ],
    equipamentos: [
      { id: 1, nome: 'Betoneira 400L', tipo: 'Próprio', diasUso: 25, valorDiario: 80 },
      { id: 2, nome: 'Andaime Tubular', tipo: 'Alugado', diasUso: 60, valorDiario: 25 },
      { id: 3, nome: 'Guindaste 20t', tipo: 'Alugado', diasUso: 8, valorDiario: 350 },
    ],
    rdos: [
      { id: 1, data: '2024-01-20', atividades: 'Escavação e preparo da fundação', clima: 'Ensolarado', equipe: 8, imagens: 2 },
      { id: 2, data: '2024-01-25', atividades: 'Concretagem da fundação - Bloco A', clima: 'Nublado', equipe: 10, imagens: 5 },
      { id: 3, data: '2024-02-01', atividades: 'Início da estrutura - Pilares P1 a P8', clima: 'Chuvoso', equipe: 6, imagens: 3 },
    ],
    imagens: [
      {
        id: '1',
        url: '/api/placeholder/800/600',
        caption: 'Início da escavação - 20/01/2024',
        data: '2024-01-20',
        rdoId: 1
      },
      {
        id: '2',
        url: '/api/placeholder/800/600',
        caption: 'Progresso da fundação - 25/01/2024',
        data: '2024-01-25',
        rdoId: 2
      },
      {
        id: '3',
        url: '/api/placeholder/800/600',
        caption: 'Estrutura em andamento - 01/02/2024',
        data: '2024-02-01',
        rdoId: 3
      },
      {
        id: '4',
        url: '/api/placeholder/800/600',
        caption: 'Vista geral da obra - 01/02/2024',
        data: '2024-02-01',
        rdoId: 3
      }
    ]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'Finalizada': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'Pausada': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const exportarRelatorio = () => {
    const conteudoRelatorio = `
METACONSTRUTOR - SISTEMA DE GESTÃO DE OBRAS
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
Responsável Técnico: João Silva (CREA: 123456)

========== RELATÓRIO DA OBRA ==========

Obra: ${obra.nome}
Endereço: ${obra.endereco}
Responsável: ${obra.responsavel}
Status: ${obra.status}
Progresso: ${obra.progresso}%

Período: ${format(new Date(obra.dataInicio), 'dd/MM/yyyy')} - ${format(new Date(obra.dataPrevisao), 'dd/MM/yyyy')}

ORÇAMENTO ANALÍTICO:
${obra.atividades?.map(atividade => 
  `- ${atividade.nome}: ${atividade.quantitativo} ${atividade.unidade} x ${formatCurrency(atividade.valorUnitario)} = ${formatCurrency(atividade.valorTotal)}`
).join('\n')}

TOTAL ORÇADO: ${formatCurrency(obra.atividades?.reduce((total, atividade) => total + atividade.valorTotal, 0) || obra.orcamento)}

-----------------------------------------
Este documento foi gerado automaticamente pelo sistema MetaConstrutor
    `.trim();

    const blob = new Blob([conteudoRelatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${obra.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalOrcamento = obra.atividades?.reduce((total, atividade) => total + atividade.valorTotal, 0) || obra.orcamento;
  const custoEquipamentos = obra.equipamentos.reduce((total, eq) => total + (eq.diasUso * eq.valorDiario), 0);
  const custoMaoObra = obra.equipeAlocada.reduce((total, pessoa) => total + (pessoa.diasTrabalhados * 150), 0); // R$ 150/dia média

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header com navegação */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/obras')}
            className="btn-secondary-standard"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="page-title">{obra.nome}</h1>
            <p className="page-description">Detalhes completos da obra</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarRelatorio}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
            <Badge className={getStatusColor(obra.status)}>
              {obra.status}
            </Badge>
          </div>
        </div>

        {/* Informações gerais */}
        <Card className="card-standard">
          <CardHeader className="card-header">
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#ff5722]" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{obra.endereco}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#ff5722]" />
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium">
                    {format(new Date(obra.dataInicio), 'dd/MM/yyyy')} - {format(new Date(obra.dataPrevisao), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#ff5722]" />
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="font-medium">{obra.responsavel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[#ff5722]" />
                <div>
                  <p className="text-sm text-muted-foreground">Orçamento</p>
                  <p className="font-medium">{formatCurrency(totalOrcamento)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progresso Físico</span>
                <span className="text-sm font-medium">{obra.progresso}%</span>
              </div>
              <Progress value={obra.progresso} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{obra.atividadesConcluidas} de {obra.atividadesPrevistas} atividades</span>
                <span>{100 - obra.progresso}% restante</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs com conteúdo detalhado */}
        <Tabs defaultValue="orcamento" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
            <TabsTrigger value="rdos">RDOs</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
            <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
            {canViewFinancial && <TabsTrigger value="financeiro">Financeiro</TabsTrigger>}
            <TabsTrigger value="imagens">Imagens</TabsTrigger>
          </TabsList>

          <TabsContent value="orcamento">
            <Card className="card-standard">
              <CardHeader className="card-header">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Orçamento Analítico
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Atividade</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="text-right">Quantitativo</TableHead>
                        <TableHead className="text-right">Valor Unitário</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {obra.atividades?.map((atividade) => (
                        <TableRow key={atividade.id}>
                          <TableCell className="font-medium">{atividade.nome}</TableCell>
                          <TableCell>{atividade.unidade}</TableCell>
                          <TableCell className="text-right">{atividade.quantitativo.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(atividade.valorUnitario)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(atividade.valorTotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Geral:</span>
                    <span className="text-lg font-bold text-[#ff5722]">{formatCurrency(totalOrcamento)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rdos">
            <Card className="card-standard">
              <CardHeader className="card-header">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatórios Diários de Obra (RDOs)
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <MultiRdoExport rdos={obra.rdos} obra={obra} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipe">
            <Card className="card-standard">
              <CardHeader className="card-header">
                <CardTitle className="flex items-center gap-2">
                  <HardHat className="h-5 w-5" />
                  Equipe Alocada
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-right">Dias Trabalhados</TableHead>
                        <TableHead className="text-right">Horas Ociosas</TableHead>
                        <TableHead className="text-right">Produtividade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {obra.equipeAlocada.map((pessoa) => {
                        const produtividade = Math.max(0, 100 - (pessoa.horasOciosas / (pessoa.diasTrabalhados * 8) * 100));
                        return (
                          <TableRow key={pessoa.id}>
                            <TableCell className="font-medium">{pessoa.nome}</TableCell>
                            <TableCell>{pessoa.funcao}</TableCell>
                            <TableCell className="text-right">{pessoa.diasTrabalhados}</TableCell>
                            <TableCell className="text-right">{pessoa.horasOciosas}h</TableCell>
                            <TableCell className="text-right">
                              <span className={`font-medium ${produtividade >= 80 ? 'text-green-600' : produtividade >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {produtividade.toFixed(1)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipamentos">
            <Card className="card-standard">
              <CardHeader className="card-header">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Equipamentos Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Dias de Uso</TableHead>
                        <TableHead className="text-right">Valor/Dia</TableHead>
                        <TableHead className="text-right">Custo Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {obra.equipamentos.map((equipamento) => (
                        <TableRow key={equipamento.id}>
                          <TableCell className="font-medium">{equipamento.nome}</TableCell>
                          <TableCell>
                            <Badge variant={equipamento.tipo === 'Próprio' ? 'default' : 'secondary'}>
                              {equipamento.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{equipamento.diasUso}</TableCell>
                          <TableCell className="text-right">{formatCurrency(equipamento.valorDiario)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(equipamento.diasUso * equipamento.valorDiario)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Custo Total com Equipamentos:</span>
                    <span className="font-bold text-[#ff5722]">{formatCurrency(custoEquipamentos)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {canViewFinancial && (
            <TabsContent value="financeiro">
              <Card className="card-standard">
                <CardHeader className="card-header">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumo Financeiro
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFinancialSummary(!showFinancialSummary)}
                    >
                      {showFinancialSummary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-content">
                  {showFinancialSummary ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-green-600">Receita Total</h4>
                          <p className="text-2xl font-bold">{formatCurrency(totalOrcamento)}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-red-600">Custos Diretos</h4>
                          <p className="text-2xl font-bold">{formatCurrency(custoMaoObra + custoEquipamentos)}</p>
                          <div className="text-sm text-muted-foreground mt-2">
                            <p>Mão de obra: {formatCurrency(custoMaoObra)}</p>
                            <p>Equipamentos: {formatCurrency(custoEquipamentos)}</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-blue-600">Margem Bruta</h4>
                          <p className="text-2xl font-bold">
                            {formatCurrency(totalOrcamento - (custoMaoObra + custoEquipamentos))}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {(((totalOrcamento - (custoMaoObra + custoEquipamentos)) / totalOrcamento) * 100).toFixed(1)}% do total
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Execução Orçamentária</h4>
                        <Progress value={obra.progresso} className="h-3 mb-2" />
                        <div className="flex justify-between text-sm">
                          <span>Executado: {obra.progresso}%</span>
                          <span>Restante: {100 - obra.progresso}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Clique no ícone do olho para visualizar o resumo financeiro</p>
                      <p className="text-xs text-muted-foreground mt-2">Acesso restrito a Diretores e Gerentes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="imagens">
            <Card className="card-standard">
              <CardHeader className="card-header">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Galeria de Imagens ({obra.imagens.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                {obra.imagens.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {obra.imagens.map((imagem) => (
                      <div key={imagem.id} className="group relative">
                        <div 
                          className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setImagemSelecionada(imagem.url)}
                        >
                          <img
                            src={imagem.url}
                            alt={imagem.caption}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium line-clamp-2">{imagem.caption}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(imagem.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            <FileText className="h-3 w-3" />
                            <span>RDO #{imagem.rdoId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma imagem encontrada</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      As imagens dos RDOs aparecerão aqui automaticamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de visualização de imagem */}
        <Dialog open={!!imagemSelecionada} onOpenChange={() => setImagemSelecionada(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Visualização da Imagem</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              {imagemSelecionada && (
                <img
                  src={imagemSelecionada}
                  alt="Visualização ampliada"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
