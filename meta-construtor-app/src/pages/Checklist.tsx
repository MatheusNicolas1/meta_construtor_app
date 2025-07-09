import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  CheckSquare, 
  Plus, 
  Calendar,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Eye,
  Edit,
  FileDown,
  Printer,
  Share2,
  Hash,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checklistService } from '@/services/checklistService';
import { obraService } from '@/services/obraService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistItem {
  id: string;
  obra_id: string;
  titulo: string;
  descricao?: string;
  tipo: 'seguranca' | 'qualidade' | 'ambiental' | 'geral';
  status: 'pendente' | 'concluido' | 'nao_aplicavel';
  responsavel: string;
  data_vencimento: string;
  observacoes?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  created_at: string;
  obra?: {
    id: string;
    nome: string;
  };
}

export default function Checklist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [checklistSelecionado, setChecklistSelecionado] = useState<ChecklistItem | null>(null);
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [novoChecklist, setNovoChecklist] = useState({
    obra_id: '',
    titulo: '',
    descricao: '',
    tipo: 'seguranca' as const,
    responsavel: '',
    data_vencimento: '',
    observacoes: '',
    prioridade: 'media' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      const [checklistsResponse, obrasResponse] = await Promise.all([
        checklistService.listarChecklists(),
        obraService.listarObras()
      ]);

      if (checklistsResponse.data) {
        // Ordenar checklists por data de criação (mais recente primeiro)
        const checklistsOrdenados = checklistsResponse.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setChecklists(checklistsOrdenados);
      }

      if (obrasResponse.data) {
        setObras(obrasResponse.data);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os checklists.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const obterNumeroChecklist = (index: number) => {
    return String(checklists.length - index).padStart(3, '0');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!novoChecklist.obra_id) {
      newErrors.obra_id = 'Selecione uma obra';
    }
    if (!novoChecklist.titulo.trim()) {
      newErrors.titulo = 'Informe o título';
    }
    if (!novoChecklist.responsavel.trim()) {
      newErrors.responsavel = 'Informe o responsável';
    }
    if (!novoChecklist.data_vencimento) {
      newErrors.data_vencimento = 'Informe a data de vencimento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await checklistService.criarChecklist({
        ...novoChecklist,
        status: 'pendente'
      });
      
      if (error) throw error;

      if (data) {
        toast({
          title: "Checklist criado com sucesso!",
          description: "O checklist foi registrado e está disponível na listagem."
        });
        
        setModalAberto(false);
        setNovoChecklist({
          obra_id: '',
          titulo: '',
          descricao: '',
          tipo: 'seguranca',
          responsavel: '',
          data_vencimento: '',
          observacoes: '',
          prioridade: 'media'
        });
        setErrors({});
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao criar checklist:', error);
      toast({
        title: "Erro ao criar checklist",
        description: "Não foi possível criar o checklist. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const visualizarChecklist = (checklist: ChecklistItem) => {
    setChecklistSelecionado(checklist);
    setModalVisualizacao(true);
  };

  const editarChecklist = (checklist: ChecklistItem) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de checklist estará disponível em breve.",
    });
  };

  const exportarChecklistPDF = (checklist: ChecklistItem) => {
    const conteudo = `
METACONSTRUTOR - CHECKLIST DE OBRA

Obra: ${checklist.obra?.nome || 'N/A'}
Título: ${checklist.titulo}
Tipo: ${checklist.tipo}
Responsável: ${checklist.responsavel}
Data de Vencimento: ${format(new Date(checklist.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
Status: ${checklist.status}
Prioridade: ${checklist.prioridade}

DESCRIÇÃO:
${checklist.descricao || 'Não informada'}

OBSERVAÇÕES:
${checklist.observacoes || 'Nenhuma observação'}

Data de Criação: ${format(new Date(checklist.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

-----------------------------------------
Este documento foi gerado automaticamente pelo sistema MetaConstrutor
    `.trim();

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Checklist_${checklist.obra?.nome || 'Obra'}_${checklist.titulo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Checklist exportado!",
      description: "O arquivo foi baixado com sucesso."
    });
  };

  const baixarRelatorio = (checklist: ChecklistItem) => {
    const conteudo = `
RELATÓRIO COMPLETO - CHK ${obterNumeroChecklist(checklists.indexOf(checklist))}

==================================================
METACONSTRUTOR - CHECKLIST DE OBRA
==================================================

INFORMAÇÕES BÁSICAS:
- Obra: ${checklist.obra?.nome || 'N/A'}
- Título: ${checklist.titulo}
- Tipo: ${checklist.tipo}
- Responsável: ${checklist.responsavel}
- Data de Vencimento: ${format(new Date(checklist.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
- Status: ${checklist.status}
- Prioridade: ${checklist.prioridade}

DESCRIÇÃO:
${checklist.descricao || 'Não informada'}

OBSERVAÇÕES:
${checklist.observacoes || 'Nenhuma observação'}

==================================================
Relatório gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
Sistema MetaConstrutor
==================================================
    `.trim();

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_Checklist_${checklist.obra?.nome || 'Obra'}_${checklist.titulo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório baixado!",
      description: "O relatório completo foi gerado com sucesso."
    });
  };

  const compartilharChecklist = (checklist: ChecklistItem) => {
    if (navigator.share) {
      navigator.share({
        title: `Checklist - ${checklist.obra?.nome}`,
        text: `Checklist "${checklist.titulo}" da obra ${checklist.obra?.nome}`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do checklist foi copiado para a área de transferência."
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'nao_aplicavel':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'nao_aplicavel':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'seguranca':
        return 'bg-red-100 text-red-800';
      case 'qualidade':
        return 'bg-blue-100 text-blue-800';
      case 'ambiental':
        return 'bg-green-100 text-green-800';
      case 'geral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularProgressoChecklists = () => {
    if (checklists.length === 0) return 0;
    const concluidos = checklists.filter(c => c.status === 'concluido').length;
    return Math.round((concluidos / checklists.length) * 100);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF5722]" />
            <p className="text-foreground">Carregando checklists...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checklist de Obra</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie verificações e controle de qualidade
            </p>
          </div>
          
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button 
                className="w-full sm:w-auto bg-[#FF5722] hover:bg-[#E64A19] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Checklist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Novo Checklist</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="obra" className="text-foreground">Obra *</Label>
                    <Select 
                      value={novoChecklist.obra_id} 
                      onValueChange={(value) => 
                        setNovoChecklist(prev => ({ ...prev, obra_id: value }))
                      }
                    >
                      <SelectTrigger className={errors.obra_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione a obra" />
                      </SelectTrigger>
                      <SelectContent>
                        {obras.map(obra => (
                          <SelectItem key={obra.id} value={obra.id}>
                            {obra.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.obra_id && (
                      <p className="text-sm text-red-500 mt-1">{errors.obra_id}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tipo" className="text-foreground">Tipo</Label>
                    <Select 
                      value={novoChecklist.tipo} 
                      onValueChange={(value) => 
                        setNovoChecklist(prev => ({ ...prev, tipo: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seguranca">🔒 Segurança</SelectItem>
                        <SelectItem value="qualidade">⭐ Qualidade</SelectItem>
                        <SelectItem value="ambiental">🌱 Ambiental</SelectItem>
                        <SelectItem value="geral">📋 Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="titulo" className="text-foreground">Título *</Label>
                  <Input
                    id="titulo"
                    value={novoChecklist.titulo}
                    onChange={(e) => setNovoChecklist(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título do checklist"
                    className={errors.titulo ? 'border-red-500' : ''}
                  />
                  {errors.titulo && (
                    <p className="text-sm text-red-500 mt-1">{errors.titulo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-foreground">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novoChecklist.descricao}
                    onChange={(e) => setNovoChecklist(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição detalhada do checklist"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel" className="text-foreground">Responsável *</Label>
                    <Input
                      id="responsavel"
                      value={novoChecklist.responsavel}
                      onChange={(e) => setNovoChecklist(prev => ({ ...prev, responsavel: e.target.value }))}
                      placeholder="Nome do responsável"
                      className={errors.responsavel ? 'border-red-500' : ''}
                    />
                    {errors.responsavel && (
                      <p className="text-sm text-red-500 mt-1">{errors.responsavel}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="data_vencimento" className="text-foreground">Data de Vencimento *</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={novoChecklist.data_vencimento}
                      onChange={(e) => setNovoChecklist(prev => ({ ...prev, data_vencimento: e.target.value }))}
                      className={errors.data_vencimento ? 'border-red-500' : ''}
                    />
                    {errors.data_vencimento && (
                      <p className="text-sm text-red-500 mt-1">{errors.data_vencimento}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="prioridade" className="text-foreground">Prioridade</Label>
                  <Select 
                    value={novoChecklist.prioridade} 
                    onValueChange={(value) => 
                      setNovoChecklist(prev => ({ ...prev, prioridade: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">🔵 Baixa</SelectItem>
                      <SelectItem value="media">🟡 Média</SelectItem>
                      <SelectItem value="alta">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="observacoes" className="text-foreground">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={novoChecklist.observacoes}
                    onChange={(e) => setNovoChecklist(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalAberto(false)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#FF5722] hover:bg-[#E64A19] text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Criar Checklist'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        {checklists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-foreground">{checklists.length}</p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-[#FF5722]" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {checklists.filter(c => c.status === 'concluido').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {checklists.filter(c => c.status === 'pendente').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <p className="text-2xl font-bold text-foreground">{calcularProgressoChecklists()}%</p>
                  </div>
                  <div className="w-full max-w-[60px]">
                    <Progress value={calcularProgressoChecklists()} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Checklists */}
        {checklists.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum checklist encontrado</h3>
            <p className="text-muted-foreground mb-4">Comece criando seu primeiro checklist</p>
            <Button 
              onClick={() => setModalAberto(true)} 
              className="bg-[#FF5722] hover:bg-[#E64A19] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Checklist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {checklists.map((checklist, index) => (
              <Card key={checklist.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-[#FF5722] relative bg-background">
                {/* Número do Checklist */}
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-[#FF5722] text-white border-[#FF5722]">
                    <Hash className="h-3 w-3 mr-1" />
                    CHK {obterNumeroChecklist(index)}
                  </Badge>
                </div>

                <CardHeader className="pb-3 pr-20">
                  <div className="space-y-2">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {checklist.obra?.nome || 'Obra não definida'}
                    </CardTitle>
                    <h4 className="font-medium text-foreground line-clamp-2">
                      {checklist.titulo}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(checklist.status)}>
                      {getStatusIcon(checklist.status)}
                      <span className="ml-1">
                        {checklist.status === 'concluido' ? 'Concluído' : 
                         checklist.status === 'pendente' ? 'Pendente' : 'N/A'}
                      </span>
                    </Badge>
                    <Badge className={getTipoColor(checklist.tipo)}>
                      {checklist.tipo === 'seguranca' ? '🔒' : 
                       checklist.tipo === 'qualidade' ? '⭐' : 
                       checklist.tipo === 'ambiental' ? '🌱' : '📋'}
                      <span className="ml-1 capitalize">{checklist.tipo}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">Responsável:</span>
                      <span className="truncate text-muted-foreground">{checklist.responsavel}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">Vencimento:</span>
                      <span className="text-muted-foreground">
                        {format(new Date(checklist.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">Prioridade:</span>
                      <span className="capitalize text-muted-foreground">{checklist.prioridade}</span>
                    </div>
                  </div>

                  {checklist.descricao && (
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {checklist.descricao}
                      </p>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => visualizarChecklist(checklist)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => editarChecklist(checklist)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportarChecklistPDF(checklist)}
                      className="flex-1"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => baixarRelatorio(checklist)}
                      className="flex-1"
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>

                  {/* Botão de Compartilhar */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => compartilharChecklist(checklist)}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Visualização */}
        <Dialog open={modalVisualizacao} onOpenChange={setModalVisualizacao}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                CHK {checklistSelecionado ? obterNumeroChecklist(checklists.indexOf(checklistSelecionado)) : ''} - {checklistSelecionado?.titulo}
              </DialogTitle>
            </DialogHeader>
            
            {checklistSelecionado && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Informações Básicas</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-foreground">Obra:</span> <span className="text-muted-foreground">{checklistSelecionado.obra?.nome || 'N/A'}</span></p>
                      <p><span className="font-medium text-foreground">Tipo:</span> <span className="text-muted-foreground capitalize">{checklistSelecionado.tipo}</span></p>
                      <p><span className="font-medium text-foreground">Responsável:</span> <span className="text-muted-foreground">{checklistSelecionado.responsavel}</span></p>
                      <p><span className="font-medium text-foreground">Status:</span> <span className="text-muted-foreground">{checklistSelecionado.status}</span></p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Prazos e Prioridade</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-foreground">Data de Vencimento:</span> <span className="text-muted-foreground">{format(new Date(checklistSelecionado.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}</span></p>
                      <p><span className="font-medium text-foreground">Prioridade:</span> <span className="text-muted-foreground capitalize">{checklistSelecionado.prioridade}</span></p>
                      <p><span className="font-medium text-foreground">Criado em:</span> <span className="text-muted-foreground">{format(new Date(checklistSelecionado.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span></p>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                {checklistSelecionado.descricao && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {checklistSelecionado.descricao}
                    </p>
                  </div>
                )}

                {/* Observações */}
                {checklistSelecionado.observacoes && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Observações</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {checklistSelecionado.observacoes}
                    </p>
                  </div>
                )}

                {/* Botões de Ação do Modal */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    onClick={() => exportarChecklistPDF(checklistSelecionado)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => baixarRelatorio(checklistSelecionado)}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Baixar Relatório
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => compartilharChecklist(checklistSelecionado)}
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