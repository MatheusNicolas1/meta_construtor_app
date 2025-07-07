import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, MapPin, Users, DollarSign, Activity, Calculator, Package, Eye, Upload, FileText, X, AlertCircle, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth, useCanViewFinancial, useEmpresa } from '@/contexts/AuthContext';
import { obraService, type CriarObraCompleta } from '@/services/obraService';
import { equipeService } from '@/services/equipeService';
import { equipamentoService } from '@/services/equipamentoService';
import { supabaseUtils } from '@/lib/supabase';
import type { ObraResumo, NovoOrcamentoAnalitico } from '@/lib/supabase';

type ObraStatus = 'Ativa' | 'Finalizada' | 'Pausada';

interface AtividadeOrcamento {
  id: number;
  nome: string;
  unidade: string;
  quantitativo: number;
  valorUnitario: number;
  valorTotal: number;
}

interface Material {
  id: number;
  nome: string;
  quantidade: number;
  unidade: string;
  finalidade: 'compra' | 'aluguel';
  atividadeId: number;
}

interface EquipamentoObra {
  id: number;
  nome: string;
  quantidade: number;
  tipo: 'proprio' | 'alugado';
}

interface AnexoObra {
  id: number;
  nome: string;
  tipo: string;
  tamanho: number;
  arquivo: File;
}

interface EquipeObra {
  id: number;
  equipeId?: string;
  nomeEquipe: string;
}

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
  atividades?: AtividadeOrcamento[];
  materiais?: Material[];
  equipamentos?: EquipamentoObra[];
  anexos?: AnexoObra[];
  equipesDetalhadas?: EquipeObra[];
}

// As listas de equipes e equipamentos são carregadas dinamicamente do Supabase

export default function Obras() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataPrevisao, setDataPrevisao] = useState<Date>();
  const [tipoOrcamento, setTipoOrcamento] = useState<'sintetico' | 'analitico'>('sintetico');
  const [incluirMateriais, setIncluirMateriais] = useState(false);
  const [atividades, setAtividades] = useState<AtividadeOrcamento[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoObra[]>([]);
  const [anexos, setAnexos] = useState<AnexoObra[]>([]);
  const [numeroEquipes, setNumeroEquipes] = useState(1);
  const [equipesObra, setEquipesObra] = useState<EquipeObra[]>([{ id: 1, nomeEquipe: '' }]);

  const [obras, setObras] = useState<Obra[]>([]);
  const [equipesDisponiveis, setEquipesDisponiveis] = useState<any[]>([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<any[]>([]);

  // Carregar dados reais do Supabase
  useEffect(() => {
    carregarObras();
    carregarEquipesDisponiveis();
    carregarEquipamentosDisponiveis();
  }, []);

  const carregarObras = async () => {
    try {
      const { data, error } = await obraService.listarObras();
      if (error) {
        console.error('Erro ao carregar obras:', error);
        toast({
          title: "Erro ao carregar obras",
          description: "Não foi possível carregar a lista de obras.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        // Converter dados do Supabase para o formato da interface
        const obrasFormatadas = data.map(obra => ({
          id: parseInt(obra.id),
          nome: obra.nome,
          endereco: obra.endereco,
          orcamento: obra.orcamento,
          dataInicio: obra.data_inicio,
          dataPrevisao: obra.data_previsao,
          status: obra.status as ObraStatus,
          responsavel: obra.responsavel,
          equipes: obra.total_equipes || 0,
          atividadesPrevistas: 0,
          atividadesConcluidas: 0,
          progresso: 0
        }));
        setObras(obrasFormatadas);
      }
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    }
  };

  const carregarEquipesDisponiveis = async () => {
    try {
      const { data, error } = await equipeService.listarEquipes({ status: 'disponivel' });
      if (!error && data) {
        setEquipesDisponiveis(data.map(equipe => ({
          id: equipe.id,
          nome: equipe.nome
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    }
  };

  const carregarEquipamentosDisponiveis = async () => {
    try {
      const { data, error } = await equipamentoService.listarEquipamentos({ status: 'disponivel' });
      if (!error && data) {
        setEquipamentosDisponiveis(data.map(eq => eq.nome));
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    }
  };

  const [novaObra, setNovaObra] = useState({
    nome: '',
    endereco: '',
    orcamento: '',
    responsavel: '',
    equipes: '1',
    atividadesPrevistas: '1',
    status: 'Ativa' as ObraStatus
  });

  const resetForm = () => {
    setNovaObra({
      nome: '',
      endereco: '',
      orcamento: '',
      responsavel: '',
      equipes: '1',
      atividadesPrevistas: '1',
      status: 'Ativa'
    });
    setDataInicio(undefined);
    setDataPrevisao(undefined);
    setEditingObra(null);
    setTipoOrcamento('sintetico');
    setIncluirMateriais(false);
    setAtividades([]);
    setMateriais([]);
    setEquipamentos([]);
    setAnexos([]);
    setNumeroEquipes(1);
    setEquipesObra([{ id: 1, nomeEquipe: '' }]);
  };

  // Funções para gerenciar equipes dinâmicas
  const handleNumeroEquipesChange = (value: string) => {
    const num = parseInt(value);
    setNumeroEquipes(num);
    setNovaObra({...novaObra, equipes: value});
    
    const novasEquipes: EquipeObra[] = [];
    for (let i = 1; i <= num; i++) {
      const equipeExistente = equipesObra.find(e => e.id === i);
      novasEquipes.push(equipeExistente || { id: i, nomeEquipe: '' });
    }
    setEquipesObra(novasEquipes);
  };

  const handleEquipeChange = (equipeId: number, nomeEquipe: string, equipeIdSupabase?: string) => {
    setEquipesObra(equipesObra.map(e => 
      e.id === equipeId ? { ...e, nomeEquipe, equipeId: equipeIdSupabase } : e
    ));
  };

  // Funções para equipamentos
  const adicionarEquipamento = () => {
    const novoEquipamento: EquipamentoObra = {
      id: Date.now(),
      nome: '',
      quantidade: 1,
      tipo: 'proprio'
    };
    setEquipamentos([...equipamentos, novoEquipamento]);
  };

  const atualizarEquipamento = (id: number, campo: keyof EquipamentoObra, valor: any) => {
    setEquipamentos(equipamentos.map(equipamento => 
      equipamento.id === id ? { ...equipamento, [campo]: valor } : equipamento
    ));
  };

  const removerEquipamento = (id: number) => {
    setEquipamentos(equipamentos.filter(equipamento => equipamento.id !== id));
  };

  // Funções para anexos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const novosAnexos: AnexoObra[] = files.map(file => ({
      id: Date.now() + Math.random(),
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      arquivo: file
    }));
    setAnexos([...anexos, ...novosAnexos]);
  };

  const removerAnexo = (id: number) => {
    setAnexos(anexos.filter(anexo => anexo.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Funções para atividades e materiais
  const adicionarAtividade = () => {
    const novaAtividade: AtividadeOrcamento = {
      id: Date.now(),
      nome: '',
      unidade: 'm²',
      quantitativo: 0,
      valorUnitario: 0,
      valorTotal: 0
    };
    setAtividades([...atividades, novaAtividade]);
  };

  const atualizarAtividade = (id: number, campo: keyof AtividadeOrcamento, valor: any) => {
    setAtividades(atividades.map(atividade => {
      if (atividade.id === id) {
        const atividadeAtualizada = { ...atividade, [campo]: valor };
        if (campo === 'quantitativo' || campo === 'valorUnitario') {
          atividadeAtualizada.valorTotal = atividadeAtualizada.quantitativo * atividadeAtualizada.valorUnitario;
        }
        return atividadeAtualizada;
      }
      return atividade;
    }));
  };

  const removerAtividade = (id: number) => {
    setAtividades(atividades.filter(atividade => atividade.id !== id));
    setMateriais(materiais.filter(material => material.atividadeId !== id));
  };

  const adicionarMaterial = (atividadeId: number) => {
    const novoMaterial: Material = {
      id: Date.now(),
      nome: '',
      quantidade: 0,
      unidade: 'un',
      finalidade: 'compra',
      atividadeId
    };
    setMateriais([...materiais, novoMaterial]);
  };

  const atualizarMaterial = (id: number, campo: keyof Material, valor: any) => {
    setMateriais(materiais.map(material => 
      material.id === id ? { ...material, [campo]: valor } : material
    ));
  };

  const removerMaterial = (id: number) => {
    setMateriais(materiais.filter(material => material.id !== id));
  };

  const calcularOrcamentoTotal = () => {
    return atividades.reduce((total, atividade) => total + atividade.valorTotal, 0);
  };

  // Funções para submit, editar e deletar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!dataInicio || !dataPrevisao) {
        toast({
          title: "Erro de validação",
          description: "Por favor, selecione as datas de início e previsão.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const orcamentoFinal = tipoOrcamento === 'analitico' ? calcularOrcamentoTotal() : parseFloat(novaObra.orcamento);

      // Preparar dados para o Supabase
      const dadosObra: CriarObraCompleta = {
        obra: {
          nome: novaObra.nome,
          endereco: novaObra.endereco,
          orcamento: orcamentoFinal,
          data_inicio: format(dataInicio, 'yyyy-MM-dd'),
          data_previsao: format(dataPrevisao, 'yyyy-MM-dd'),
          status: novaObra.status === 'Ativa' ? 'ativa' : 'pausada',
          responsavel: novaObra.responsavel,
        },
        orcamentoAnalitico: tipoOrcamento === 'analitico' ? atividades.map(atividade => ({
          nome_atividade: atividade.nome,
          categoria: 'geral',
          unidade: atividade.unidade,
          quantitativo: atividade.quantitativo,
          valor_unitario: atividade.valorUnitario,
          status: 'planejada'
        })) : undefined,
        equipes: equipesObra.filter(e => e.nomeEquipe).map(e => e.equipeId?.toString()).filter(Boolean) as string[],
        equipamentos: equipamentos.map(eq => ({
          equipamento_id: eq.id.toString(),
          quantidade: eq.quantidade,
          observacoes: `Tipo: ${eq.tipo}`
        })),
        documentos: anexos.map(anexo => anexo.arquivo)
      };

      if (editingObra) {
        // Atualizar obra existente
        const { data, error } = await obraService.atualizarObra(editingObra.id.toString(), {
          nome: dadosObra.obra.nome,
          endereco: dadosObra.obra.endereco,
          orcamento: dadosObra.obra.orcamento,
          data_inicio: dadosObra.obra.data_inicio,
          data_previsao: dadosObra.obra.data_previsao,
          status: dadosObra.obra.status,
          responsavel: dadosObra.obra.responsavel,
        });

        if (error) {
          throw new Error('Erro ao atualizar obra');
        }

        toast({
          title: "Obra atualizada!",
          description: "Os dados da obra foram atualizados com sucesso.",
        });
      } else {
        // Criar nova obra
        const { data, error } = await obraService.criarObraCompleta(dadosObra);

        if (error) {
          throw new Error('Erro ao criar obra');
        }

        toast({
          title: "Nova obra criada!",
          description: "A obra foi cadastrada com sucesso no sistema.",
        });
      }

      // Recarregar lista de obras
      await carregarObras();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a obra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setNovaObra({
      nome: obra.nome,
      endereco: obra.endereco,
      orcamento: obra.orcamento.toString(),
      responsavel: obra.responsavel,
      equipes: obra.equipes.toString(),
      atividadesPrevistas: obra.atividadesPrevistas.toString(),
      status: obra.status
    });
    setDataInicio(new Date(obra.dataInicio));
    setDataPrevisao(new Date(obra.dataPrevisao));
    setTipoOrcamento(obra.tipoOrcamento || 'sintetico');
    setAtividades(obra.atividades || []);
    setMateriais(obra.materiais || []);
    setEquipamentos(obra.equipamentos || []);
    setAnexos(obra.anexos || []);
    setIncluirMateriais(!!obra.materiais?.length);
    setNumeroEquipes(obra.equipes);
    setEquipesObra(obra.equipesDetalhadas || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta obra?')) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const handleViewObra = (obraId: number) => {
    navigate(`/obras/${obraId}`);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="page-title">Obras</h1>
            <p className="page-description">Gerencie todas as obras e projetos em andamento</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="btn-standard">
                <Plus className="h-4 w-4" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-content max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingObra ? 'Editar Obra' : 'Nova Obra'}
                </DialogTitle>
                <DialogDescription>
                  {editingObra ? 'Atualize as informações da obra' : 'Cadastre uma nova obra no sistema'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dados Gerais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Dados Gerais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-field">
                      <Label htmlFor="nome" className="form-label">Nome da Obra</Label>
                      <Input
                        id="nome"
                        value={novaObra.nome}
                        onChange={(e) => setNovaObra({...novaObra, nome: e.target.value})}
                        className="form-input"
                        placeholder="Ex: Torre Empresarial"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <Label htmlFor="responsavel" className="form-label">Responsável</Label>
                      <Input
                        id="responsavel"
                        value={novaObra.responsavel}
                        onChange={(e) => setNovaObra({...novaObra, responsavel: e.target.value})}
                        className="form-input"
                        placeholder="Nome do engenheiro responsável"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <Label htmlFor="endereco" className="form-label">Endereço</Label>
                    <Input
                      id="endereco"
                      value={novaObra.endereco}
                      onChange={(e) => setNovaObra({...novaObra, endereco: e.target.value})}
                      className="form-input"
                      placeholder="Endereço completo da obra"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <Label htmlFor="status" className="form-label">Status</Label>
                    <Select value={novaObra.status} onValueChange={(value: ObraStatus) => setNovaObra({...novaObra, status: value})}>
                      <SelectTrigger className="form-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativa">Ativa</SelectItem>
                        <SelectItem value="Pausada">Pausada</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cronograma */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Cronograma
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-field">
                      <Label className="form-label">Data de Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal form-input", !dataInicio && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="form-field">
                      <Label className="form-label">Data de Previsão</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal form-input", !dataPrevisao && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataPrevisao ? format(dataPrevisao, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dataPrevisao} onSelect={setDataPrevisao} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Orçamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Orçamento
                  </h3>
                  
                  <div className="form-field">
                    <Label className="form-label">Tipo de Orçamento</Label>
                    <RadioGroup value={tipoOrcamento} onValueChange={(value: 'sintetico' | 'analitico') => setTipoOrcamento(value)} className="flex flex-col sm:flex-row gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sintetico" id="sintetico" />
                        <Label htmlFor="sintetico" className="flex items-center gap-2 form-label">
                          <DollarSign className="h-4 w-4" />
                          Orçamento Sintético
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="analitico" id="analitico" />
                        <Label htmlFor="analitico" className="flex items-center gap-2 form-label">
                          <Calculator className="h-4 w-4" />
                          Orçamento Analítico
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Orçamento Sintético */}
                  {tipoOrcamento === 'sintetico' && (
                    <div className="form-field">
                      <Label htmlFor="orcamento" className="form-label">Orçamento Total (R$)</Label>
                      <Input
                        id="orcamento"
                        type="number"
                        step="0.01"
                        value={novaObra.orcamento}
                        onChange={(e) => setNovaObra({...novaObra, orcamento: e.target.value})}
                        className="form-input"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  )}

                  {/* Orçamento Analítico */}
                  {tipoOrcamento === 'analitico' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Atividades e Custos</Label>
                        <Button type="button" onClick={adicionarAtividade} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                          Adicionar Atividade
                        </Button>
                      </div>

                      {atividades.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="budget-table min-w-full">
                              <thead>
                                <tr>
                                  <th className="px-2 py-2 text-left">Atividade</th>
                                  <th className="px-2 py-2 text-left">Unidade</th>
                                  <th className="px-2 py-2 text-left">Quantitativo</th>
                                  <th className="px-2 py-2 text-left">Valor Unitário</th>
                                  <th className="px-2 py-2 text-left">Valor Total</th>
                                  <th className="px-2 py-2 text-left">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {atividades.map((atividade) => (
                                  <tr key={atividade.id}>
                                    <td className="px-2 py-2">
                                      <Input
                                        value={atividade.nome}
                                        onChange={(e) => atualizarAtividade(atividade.id, 'nome', e.target.value)}
                                        placeholder="Nome da atividade"
                                        className="form-input min-w-[150px]"
                                      />
                                    </td>
                                    <td className="px-2 py-2">
                                      <Select 
                                        value={atividade.unidade} 
                                        onValueChange={(value) => atualizarAtividade(atividade.id, 'unidade', value)}
                                      >
                                        <SelectTrigger className="form-input min-w-[80px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="m²">m²</SelectItem>
                                          <SelectItem value="m³">m³</SelectItem>
                                          <SelectItem value="m">m</SelectItem>
                                          <SelectItem value="un">un</SelectItem>
                                          <SelectItem value="kg">kg</SelectItem>
                                          <SelectItem value="t">t</SelectItem>
                                          <SelectItem value="L">L</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="px-2 py-2">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={atividade.quantitativo}
                                        onChange={(e) => atualizarAtividade(atividade.id, 'quantitativo', parseFloat(e.target.value) || 0)}
                                        className="form-input min-w-[100px]"
                                      />
                                    </td>
                                    <td className="px-2 py-2">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={atividade.valorUnitario}
                                        onChange={(e) => atualizarAtividade(atividade.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                                        className="form-input min-w-[120px]"
                                      />
                                    </td>
                                    <td className="px-2 py-2 font-medium min-w-[120px]">
                                      {formatCurrency(atividade.valorTotal)}
                                    </td>
                                    <td className="px-2 py-2">
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removerAtividade(atividade.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={4} className="px-2 py-2 text-right font-bold">Total Geral:</td>
                                  <td className="px-2 py-2 font-bold text-[#ff5722]">{formatCurrency(calcularOrcamentoTotal())}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Materiais */}
                  <div className="form-field">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="incluir-materiais" 
                        checked={incluirMateriais}
                        onCheckedChange={(checked) => setIncluirMateriais(checked === true)}
                      />
                      <Label htmlFor="incluir-materiais" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Incluir levantamento de materiais
                      </Label>
                    </div>
                  </div>

                  {incluirMateriais && tipoOrcamento === 'analitico' && (
                    <div className="space-y-4">
                      {atividades.map((atividade) => (
                        <div key={atividade.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Materiais para: {atividade.nome || 'Atividade sem nome'}</h4>
                            <Button
                              type="button"
                              onClick={() => adicionarMaterial(atividade.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar Material
                            </Button>
                          </div>

                          {materiais.filter(material => material.atividadeId === atividade.id).map((material) => (
                            <div key={material.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                              <div>
                                <Label>Material</Label>
                                <Input
                                  value={material.nome}
                                  onChange={(e) => atualizarMaterial(material.id, 'nome', e.target.value)}
                                  placeholder="Nome do material"
                                  className="form-input"
                                />
                              </div>
                              <div>
                                <Label>Quantidade</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={material.quantidade}
                                  onChange={(e) => atualizarMaterial(material.id, 'quantidade', parseFloat(e.target.value) || 0)}
                                  className="form-input"
                                />
                              </div>
                              <div>
                                <Label>Unidade</Label>
                                <Select 
                                  value={material.unidade} 
                                  onValueChange={(value) => atualizarMaterial(material.id, 'unidade', value)}
                                >
                                  <SelectTrigger className="form-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="un">un</SelectItem>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="m">m</SelectItem>
                                    <SelectItem value="m²">m²</SelectItem>
                                    <SelectItem value="L">L</SelectItem>
                                    <SelectItem value="saco">saco</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Finalidade</Label>
                                <Select 
                                  value={material.finalidade} 
                                  onValueChange={(value: 'compra' | 'aluguel') => atualizarMaterial(material.id, 'finalidade', value)}
                                >
                                  <SelectTrigger className="form-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="compra">Compra</SelectItem>
                                    <SelectItem value="aluguel">Aluguel</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removerMaterial(material.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equipes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Equipes
                  </h3>
                  
                  <div className="form-field">
                    <Label htmlFor="numero-equipes" className="form-label">Número de Equipes</Label>
                    <Select value={numeroEquipes.toString()} onValueChange={handleNumeroEquipesChange}>
                      <SelectTrigger className="form-input max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {equipesObra.map((equipe, index) => (
                    <div key={equipe.id} className="form-field">
                      <Label className="form-label">Equipe {index + 1}</Label>
                      <Select 
                        value={equipe.nomeEquipe} 
                        onValueChange={(value) => {
                          const equipeSelecionada = equipesDisponiveis.find(eq => eq.nome === value);
                          handleEquipeChange(equipe.id, value, equipeSelecionada?.id);
                        }}
                      >
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Selecione uma equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipesDisponiveis.map(eq => (
                            <SelectItem key={eq.id} value={eq.nome}>{eq.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* Equipamentos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Equipamentos
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Equipamentos Necessários</Label>
                    <Button type="button" onClick={adicionarEquipamento} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      Adicionar Equipamento
                    </Button>
                  </div>

                  {equipamentos.length > 0 && (
                    <div className="space-y-3">
                      {equipamentos.map((equipamento) => (
                        <div key={equipamento.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end p-3 border rounded-lg">
                          <div>
                            <Label>Equipamento</Label>
                            <Select 
                              value={equipamento.nome} 
                              onValueChange={(value) => atualizarEquipamento(equipamento.id, 'nome', value)}
                            >
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Selecione o equipamento" />
                              </SelectTrigger>
                              <SelectContent>
                                {equipamentosDisponiveis.map(eq => (
                                  <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              min="1"
                              value={equipamento.quantidade}
                              onChange={(e) => atualizarEquipamento(equipamento.id, 'quantidade', parseInt(e.target.value) || 1)}
                              className="form-input"
                            />
                          </div>
                          <div>
                            <Label>Tipo de Recurso</Label>
                            <Select 
                              value={equipamento.tipo} 
                              onValueChange={(value: 'proprio' | 'alugado') => atualizarEquipamento(equipamento.id, 'tipo', value)}
                            >
                              <SelectTrigger className="form-input">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="proprio">Próprio</SelectItem>
                                <SelectItem value="alugado">Alugado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removerEquipamento(equipamento.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Anexos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Anexos e Documentos
                  </h3>
                  
                  <div className="form-field">
                    <Label className="form-label">Arquivos da Obra</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Clique para selecionar arquivos ou arraste-os aqui
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
                        </p>
                      </label>
                    </div>
                  </div>

                  {anexos.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Arquivos Selecionados</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {anexos.map((anexo) => (
                          <div key={anexo.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{anexo.nome}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(anexo.tamanho)}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerAnexo(anexo.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Atividades Previstas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Recursos e Planejamento
                  </h3>
                  
                  <div className="form-field">
                    <Label htmlFor="atividades" className="form-label">Atividades Previstas</Label>
                    <Input
                      id="atividades"
                      type="number"
                      min="1"
                      value={tipoOrcamento === 'analitico' ? atividades.length.toString() : novaObra.atividadesPrevistas}
                      onChange={(e) => setNovaObra({...novaObra, atividadesPrevistas: e.target.value})}
                      className="form-input max-w-xs"
                      disabled={tipoOrcamento === 'analitico'}
                      required
                    />
                    {tipoOrcamento === 'analitico' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Valor calculado automaticamente baseado nas atividades do orçamento
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="btn-secondary-standard">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="btn-standard">
                    {isLoading ? 'Salvando...' : (editingObra ? 'Atualizar Obra' : 'Criar Obra')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Obras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <Card key={obra.id} className="work-card relative hover-lift">
              {/* Status Badge */}
              <div className="work-card-status">
                <Badge className={getStatusBadge(obra.status)}>
                  {obra.status}
                </Badge>
              </div>

              <div className="work-card-header">
                <div className="flex-1 min-w-0 pr-16">
                  <h3 className="text-lg font-semibold text-foreground truncate mb-2">
                    {obra.nome}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{obra.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{obra.responsavel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="work-card-content">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-muted-foreground">Orçamento</p>
                      <p className="font-medium">{formatCurrency(obra.orcamento)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-muted-foreground">Progresso</p>
                      <p className="font-medium">{obra.progresso}%</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atividades:</span>
                    <span className="font-medium">{obra.atividadesConcluidas}/{obra.atividadesPrevistas}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-[#ff5722] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${obra.progresso}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Início</p>
                    <p className="font-medium">{format(new Date(obra.dataInicio), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Previsão</p>
                    <p className="font-medium">{format(new Date(obra.dataPrevisao), 'dd/MM/yyyy')}</p>
                  </div>
                </div>

                {obra.tipoOrcamento && (
                  <div className="flex items-center gap-2 text-sm">
                    {obra.tipoOrcamento === 'analitico' ? <Calculator className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                    <span className="text-muted-foreground">
                      Orçamento {obra.tipoOrcamento === 'analitico' ? 'Analítico' : 'Sintético'}
                    </span>
                  </div>
                )}
              </div>

              <div className="work-card-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewObra(obra.id)}
                  className="btn-secondary-standard"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(obra)}
                  className="btn-secondary-standard"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(obra.id)}
                  disabled={isLoading}
                  className="btn-danger-standard"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {obras.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Activity className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma obra cadastrada</h3>
            <p className="text-muted-foreground mb-4">Comece criando sua primeira obra no sistema</p>
            <Button onClick={() => setIsModalOpen(true)} className="btn-standard">
              <Plus className="h-4 w-4" />
              Nova Obra
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
