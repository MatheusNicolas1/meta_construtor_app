import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft,
  Building,
  Calendar as CalendarIcon,
  MapPin,
  User,
  DollarSign,
  Loader2,
  Save,
  AlertTriangle,
  FileText,
  Upload,
  X,
  Plus,
  Trash2,
  Calculator,
  Settings,
  FileUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { obraService } from '@/services/obraService';
import { equipamentoService } from '@/services/equipamentoService';
import { useAuth } from '@/contexts/AuthContext';

type ObraStatus = 'ativa' | 'pausada' | 'concluida';
type TipoObra = 'residencial' | 'comercial' | 'industrial' | 'infraestrutura' | 'reforma';
type TipoOrcamento = 'sintetico' | 'analitico';
type UnidadeMedida = 'm²' | 'm³' | 'm' | 'kg' | 't' | 'un' | 'cj' | 'h' | 'vb';

interface AtividadeOrcamento {
  id: string;
  atividade: string;
  quantidade: number | '';
  unidade: UnidadeMedida;
  valorUnitario: number | '';
  valorTotal: number;
}

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  status: string;
}

interface EquipamentoSelecionado {
  id: string;
  equipamento: Equipamento;
  quantidade: number;
  formaUso: 'proprio' | 'alugado';
}

interface ArquivoUpload {
  id: string;
  nome: string;
  arquivo: File;
  tipo: string;
  tamanho: number;
}

export default function NovaObra() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar para login se não autenticado
  React.useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataPrevisao, setDataPrevisao] = useState<Date>();
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<Equipamento[]>([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(true);

  const [formData, setFormData] = useState({
    nome: '',
    responsavel: '',
    status: 'ativa' as ObraStatus,
    endereco: '',
    tipo: 'residencial' as TipoObra,
    cliente: '',
    observacoes: '',
    tipoOrcamento: 'sintetico' as TipoOrcamento
  });

  // Estados para orçamento analítico
  const [atividadesOrcamento, setAtividadesOrcamento] = useState<AtividadeOrcamento[]>([]);
  const [orcamentoSintetico, setOrcamentoSintetico] = useState<string>('');

  // Estados para equipamentos
  const [equipamentosSelecionados, setEquipamentosSelecionados] = useState<EquipamentoSelecionado[]>([]);

  // Estados para upload de arquivos
  const [arquivosUpload, setArquivosUpload] = useState<ArquivoUpload[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar equipamentos disponíveis
  useEffect(() => {
    const carregarEquipamentos = async () => {
      try {
        const { data, error } = await equipamentoService.listarEquipamentosDisponiveis();
        
        if (error) {
          console.error('Erro ao carregar equipamentos:', error);
          
          // Em caso de erro, verificar se há dados disponíveis
          if (data && data.length > 0) {
            setEquipamentosDisponiveis(data);
          } else {
            // Se não há dados, mostrar equipamentos demo se estiver em modo demo
            const demoMode = localStorage.getItem('demo-mode');
            if (demoMode === 'true') {
              setEquipamentosDisponiveis([
                { id: 'eq1', nome: 'Escavadeira CAT 320', tipo: 'Pesado', status: 'disponivel' },
                { id: 'eq2', nome: 'Betoneira 400L', tipo: 'Concreto', status: 'disponivel' },
                { id: 'eq3', nome: 'Guindaste 15t', tipo: 'Içamento', status: 'disponivel' },
                { id: 'eq4', nome: 'Retroescavadeira JCB', tipo: 'Pesado', status: 'disponivel' },
                { id: 'eq5', nome: 'Compactador de Solo', tipo: 'Compactação', status: 'disponivel' }
              ]);
            } else {
              setEquipamentosDisponiveis([]);
            }
          }
        } else {
          setEquipamentosDisponiveis(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
        
        // Em caso de erro de conexão, tentar modo demo
        const demoMode = localStorage.getItem('demo-mode');
        if (demoMode === 'true') {
          setEquipamentosDisponiveis([
            { id: 'eq1', nome: 'Escavadeira CAT 320', tipo: 'Pesado', status: 'disponivel' },
            { id: 'eq2', nome: 'Betoneira 400L', tipo: 'Concreto', status: 'disponivel' },
            { id: 'eq3', nome: 'Guindaste 15t', tipo: 'Içamento', status: 'disponivel' },
            { id: 'eq4', nome: 'Retroescavadeira JCB', tipo: 'Pesado', status: 'disponivel' },
            { id: 'eq5', nome: 'Compactador de Solo', tipo: 'Compactação', status: 'disponivel' }
          ]);
        } else {
          setEquipamentosDisponiveis([]);
          toast({
            title: "Erro ao carregar equipamentos",
            description: "Não foi possível carregar a lista de equipamentos.",
            variant: "destructive"
          });
        }
      } finally {
        setLoadingEquipamentos(false);
      }
    };

    carregarEquipamentos();
  }, []);

  // Funções para orçamento analítico
  const adicionarAtividade = () => {
    const novaAtividade: AtividadeOrcamento = {
      id: `atividade_${Date.now()}`,
      atividade: '',
      quantidade: '',
      unidade: 'm²',
      valorUnitario: '',
      valorTotal: 0
    };
    setAtividadesOrcamento([...atividadesOrcamento, novaAtividade]);
  };

  const removerAtividade = (id: string) => {
    setAtividadesOrcamento(atividadesOrcamento.filter(ativ => ativ.id !== id));
  };

  const atualizarAtividade = (id: string, campo: keyof AtividadeOrcamento, valor: any) => {
    setAtividadesOrcamento(prev => 
      prev.map(atividade => {
        if (atividade.id === id) {
          const atividadeAtualizada = { ...atividade, [campo]: valor };
          
          // Recalcular valor total se quantidade ou valor unitário mudaram
          if (campo === 'quantidade' || campo === 'valorUnitario') {
            const quantidade = Number(atividadeAtualizada.quantidade) || 0;
            const valorUnitario = Number(atividadeAtualizada.valorUnitario) || 0;
            atividadeAtualizada.valorTotal = quantidade * valorUnitario;
          }
          
          return atividadeAtualizada;
        }
        return atividade;
      })
    );
  };

  const calcularTotalOrcamento = () => {
    return atividadesOrcamento.reduce((total, atividade) => total + atividade.valorTotal, 0);
  };

  // Funções para gerenciar equipamentos selecionados
  const adicionarEquipamento = (equipamento: Equipamento) => {
    const novoEquipamento: EquipamentoSelecionado = {
      id: `eq_sel_${Date.now()}`,
      equipamento,
      quantidade: 1,
      formaUso: 'proprio'
    };
    setEquipamentosSelecionados([...equipamentosSelecionados, novoEquipamento]);
  };

  const removerEquipamento = (id: string) => {
    setEquipamentosSelecionados(equipamentosSelecionados.filter(eq => eq.id !== id));
  };

  const atualizarEquipamento = (id: string, updates: Partial<EquipamentoSelecionado>) => {
    setEquipamentosSelecionados(prev => 
      prev.map(eq => eq.id === id ? { ...eq, ...updates } : eq)
    );
  };

  const isEquipamentoSelecionado = (equipamentoId: string) => {
    return equipamentosSelecionados.some(eq => eq.equipamento.id === equipamentoId);
  };

  // Funções para upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['.pdf', '.xlsx', '.csv', '.docx', '.png', '.jpg', '.jpeg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    files.forEach(file => {
      // Validar extensão
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Arquivo não permitido",
          description: `O arquivo ${file.name} não é de um tipo permitido.`,
          variant: "destructive"
        });
        return;
      }

      // Validar tamanho
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo ${file.name} é muito grande (máx. 5MB).`,
          variant: "destructive"
        });
        return;
      }

      const novoArquivo: ArquivoUpload = {
        id: `arquivo_${Date.now()}_${Math.random()}`,
        nome: file.name,
        arquivo: file,
        tipo: fileExtension,
        tamanho: file.size
      };

      setArquivosUpload(prev => [...prev, novoArquivo]);
    });

    // Limpar input
    event.target.value = '';
  };

  const removerArquivo = (id: string) => {
    setArquivosUpload(prev => prev.filter(arquivo => arquivo.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case '.pdf': return '📄';
      case '.xlsx': case '.csv': return '📊';
      case '.docx': return '📝';
      case '.png': case '.jpg': case '.jpeg': return '🖼️';
      default: return '📄';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Campos obrigatórios
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da obra é obrigatório';
    }
    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável técnico é obrigatório';
    }
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Localização da obra é obrigatória';
    }
    if (!formData.cliente.trim()) {
      newErrors.cliente = 'Cliente é obrigatório';
    }
    if (!dataInicio) {
      newErrors.dataInicio = 'Data de início é obrigatória';
    }
    if (!dataPrevisao) {
      newErrors.dataPrevisao = 'Data de previsão de conclusão é obrigatória';
    }

    // Validação de datas
    if (dataInicio && dataPrevisao && dataInicio >= dataPrevisao) {
      newErrors.dataPrevisao = 'Data de previsão deve ser posterior à data de início';
    }

    // Validação de orçamento
    if (formData.tipoOrcamento === 'sintetico') {
      if (!orcamentoSintetico || parseFloat(orcamentoSintetico) <= 0) {
        newErrors.orcamentoSintetico = 'Orçamento sintético é obrigatório';
      }
    } else {
      if (atividadesOrcamento.length === 0) {
        newErrors.orcamentoAnalitico = 'Adicione pelo menos uma atividade no orçamento analítico';
      } else {
        const atividadesIncompletas = atividadesOrcamento.some(
          ativ => !ativ.atividade || !ativ.quantidade || !ativ.valorUnitario
        );
        if (atividadesIncompletas) {
          newErrors.orcamentoAnalitico = 'Preencha todos os campos das atividades do orçamento';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios corretamente.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orcamentoFinal = formData.tipoOrcamento === 'sintetico' 
        ? parseFloat(orcamentoSintetico)
        : calcularTotalOrcamento();

      const obraData = {
        nome: formData.nome,
        endereco: formData.endereco,
        orcamento: orcamentoFinal,
        data_inicio: format(dataInicio!, 'yyyy-MM-dd'),
        data_previsao: format(dataPrevisao!, 'yyyy-MM-dd'),
        status: formData.status,
        responsavel: formData.responsavel,
        tipo: formData.tipo,
        cliente: formData.cliente,
        observacoes: formData.observacoes || null,
        tipo_orcamento: formData.tipoOrcamento,
        atividades_orcamento: formData.tipoOrcamento === 'analitico' ? atividadesOrcamento : null,
        equipamentos_selecionados: equipamentosSelecionados.map(eq => ({
          equipamento_id: eq.equipamento.id,
          quantidade: eq.quantidade,
          forma_uso: eq.formaUso
        })),
        arquivos: arquivosUpload
      };

      const { data, error } = await obraService.criarObra(obraData);
      
      if (error) throw error;

      if (data) {
        toast({
          title: "Obra cadastrada com sucesso!",
          description: "A obra foi criada e está disponível na listagem."
        });
        
        // Redirecionar para a listagem de obras
        navigate('/obras');
      }
    } catch (error) {
      console.error('Erro ao criar obra:', error);
      toast({
        title: "Erro ao cadastrar obra",
        description: "Não foi possível cadastrar a obra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/obras');
  };

  const handleOrcamentoSinteticoChange = (value: string) => {
    const cleanedValue = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    setOrcamentoSintetico(cleanedValue);
  };

  // Mostrar loading se ainda verificando autenticação
  if (loading) {
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCancel}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Nova Obra</h1>
            <p className="text-muted-foreground mt-1">
              Cadastre uma nova obra com informações técnicas e financeiras completas
            </p>
          </div>
        </div>

        <Separator />

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SEÇÃO: Informações Básicas */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Building className="h-5 w-5 text-[#FF5722]" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="nome" className="text-foreground">Nome da Obra *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Torre Empresarial MetaConstrutor"
                    className={cn("w-full text-foreground", errors.nome && 'border-red-500')}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-500 mt-1">{errors.nome}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="responsavel" className="text-foreground">Responsável Técnico *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                    placeholder="Nome do engenheiro responsável"
                    className={cn("w-full text-foreground", errors.responsavel && 'border-red-500')}
                  />
                  {errors.responsavel && (
                    <p className="text-sm text-red-500 mt-1">{errors.responsavel}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="endereco" className="text-foreground">Localização da Obra *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Endereço completo da obra"
                  className={cn("w-full text-foreground", errors.endereco && 'border-red-500')}
                />
                {errors.endereco && (
                  <p className="text-sm text-red-500 mt-1">{errors.endereco}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="cliente" className="text-foreground">Cliente *</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                    placeholder="Nome do cliente ou empresa"
                    className={cn("w-full text-foreground", errors.cliente && 'border-red-500')}
                  />
                  {errors.cliente && (
                    <p className="text-sm text-red-500 mt-1">{errors.cliente}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo" className="text-foreground">Tipo de Obra *</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value: TipoObra) => 
                      setFormData(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger className="w-full text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="residencial">Residencial</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="reforma">Reforma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="text-foreground">Status da Obra *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: ObraStatus) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="w-full text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="ativa">Execução</SelectItem>
                    <SelectItem value="pausada">Paralisada</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Cronograma */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <CalendarIcon className="h-5 w-5 text-[#FF5722]" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-foreground">Data de Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal text-foreground bg-background",
                          !dataInicio && "text-muted-foreground",
                          errors.dataInicio && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-border">
                      <Calendar 
                        mode="single" 
                        selected={dataInicio} 
                        onSelect={setDataInicio} 
                        initialFocus
                        className="bg-background text-foreground"
                        classNames={{
                          months: "text-foreground",
                          month: "text-foreground",
                          caption: "text-foreground",
                          caption_label: "text-foreground",
                          nav: "text-foreground",
                          nav_button: "text-foreground hover:bg-muted",
                          nav_button_previous: "text-foreground hover:bg-muted",
                          nav_button_next: "text-foreground hover:bg-muted",
                          table: "text-foreground",
                          head_row: "text-foreground",
                          head_cell: "text-muted-foreground",
                          row: "text-foreground",
                          cell: "text-foreground hover:bg-muted",
                          day: "text-foreground hover:bg-muted",
                          day_selected: "bg-[#FF5722] text-white hover:bg-[#E64A19]",
                          day_today: "bg-muted text-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle: "bg-muted",
                          day_hidden: "invisible"
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.dataInicio && (
                    <p className="text-sm text-red-500 mt-1">{errors.dataInicio}</p>
                  )}
                </div>

                <div>
                  <Label className="text-foreground">Data Prevista de Conclusão *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal text-foreground bg-background",
                          !dataPrevisao && "text-muted-foreground",
                          errors.dataPrevisao && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataPrevisao ? format(dataPrevisao, "PPP", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-border">
                      <Calendar 
                        mode="single" 
                        selected={dataPrevisao} 
                        onSelect={setDataPrevisao} 
                        initialFocus 
                        disabled={(date) => dataInicio ? date <= dataInicio : false}
                        className="bg-background text-foreground"
                        classNames={{
                          months: "text-foreground",
                          month: "text-foreground", 
                          caption: "text-foreground",
                          caption_label: "text-foreground",
                          nav: "text-foreground",
                          nav_button: "text-foreground hover:bg-muted",
                          nav_button_previous: "text-foreground hover:bg-muted",
                          nav_button_next: "text-foreground hover:bg-muted",
                          table: "text-foreground",
                          head_row: "text-foreground",
                          head_cell: "text-muted-foreground",
                          row: "text-foreground",
                          cell: "text-foreground hover:bg-muted",
                          day: "text-foreground hover:bg-muted",
                          day_selected: "bg-[#FF5722] text-white hover:bg-[#E64A19]",
                          day_today: "bg-muted text-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle: "bg-muted",
                          day_hidden: "invisible"
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.dataPrevisao && (
                    <p className="text-sm text-red-500 mt-1">{errors.dataPrevisao}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Orçamento */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Calculator className="h-5 w-5 text-[#FF5722]" />
                Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção do tipo de orçamento */}
              <div>
                <Label className="text-foreground mb-4 block">Tipo de Orçamento *</Label>
                <RadioGroup 
                  value={formData.tipoOrcamento} 
                  onValueChange={(value: TipoOrcamento) => setFormData(prev => ({ ...prev, tipoOrcamento: value }))}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sintetico" id="sintetico" />
                    <Label htmlFor="sintetico" className="text-foreground">Orçamento Sintético</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="analitico" id="analitico" />
                    <Label htmlFor="analitico" className="text-foreground">Orçamento Analítico</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Orçamento Sintético */}
              {formData.tipoOrcamento === 'sintetico' && (
                <div>
                  <Label htmlFor="orcamentoSintetico" className="text-foreground">Valor Total da Obra (R$) *</Label>
                  <Input
                    id="orcamentoSintetico"
                    value={orcamentoSintetico}
                    onChange={(e) => handleOrcamentoSinteticoChange(e.target.value)}
                    placeholder="0,00"
                    className={cn("w-full text-foreground", errors.orcamentoSintetico && 'border-red-500')}
                  />
                  {errors.orcamentoSintetico && (
                    <p className="text-sm text-red-500 mt-1">{errors.orcamentoSintetico}</p>
                  )}
                </div>
              )}

              {/* Orçamento Analítico */}
              {formData.tipoOrcamento === 'analitico' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-foreground">Atividades da Obra</h4>
                    <Button 
                      type="button" 
                      onClick={adicionarAtividade}
                      variant="outline"
                      size="sm"
                      className="text-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Atividade
                    </Button>
                  </div>
                  
                  {atividadesOrcamento.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="min-w-full bg-background border border-border">
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead className="text-foreground">Atividade</TableHead>
                            <TableHead className="text-foreground">Qtd</TableHead>
                            <TableHead className="text-foreground">Unidade</TableHead>
                            <TableHead className="text-foreground">Valor Unit. (R$)</TableHead>
                            <TableHead className="text-foreground">Total (R$)</TableHead>
                            <TableHead className="text-foreground w-20">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {atividadesOrcamento.map((atividade) => (
                            <TableRow key={atividade.id} className="border-border">
                              <TableCell>
                                <Input
                                  value={atividade.atividade}
                                  onChange={(e) => atualizarAtividade(atividade.id, 'atividade', e.target.value)}
                                  placeholder="Descrição da atividade"
                                  className="text-foreground"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={atividade.quantidade}
                                  onChange={(e) => atualizarAtividade(atividade.id, 'quantidade', e.target.value)}
                                  placeholder="0"
                                  className="text-foreground w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={atividade.unidade} 
                                  onValueChange={(value: UnidadeMedida) => atualizarAtividade(atividade.id, 'unidade', value)}
                                >
                                  <SelectTrigger className="text-foreground w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border-border">
                                    <SelectItem value="m²">m²</SelectItem>
                                    <SelectItem value="m³">m³</SelectItem>
                                    <SelectItem value="m">m</SelectItem>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="t">t</SelectItem>
                                    <SelectItem value="un">un</SelectItem>
                                    <SelectItem value="cj">cj</SelectItem>
                                    <SelectItem value="h">h</SelectItem>
                                    <SelectItem value="vb">vb</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={atividade.valorUnitario}
                                  onChange={(e) => atualizarAtividade(atividade.id, 'valorUnitario', e.target.value)}
                                  placeholder="0,00"
                                  className="text-foreground w-24"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-foreground">
                                R$ {atividade.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerAtividade(atividade.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Nenhuma atividade adicionada</p>
                      <Button 
                        type="button" 
                        onClick={adicionarAtividade}
                        variant="outline"
                        className="text-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeira Atividade
                      </Button>
                    </div>
                  )}
                  
                  {atividadesOrcamento.length > 0 && (
                    <div className="flex justify-end">
                      <Card className="w-64 bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">Total Geral:</span>
                            <span className="text-xl font-bold text-[#FF5722]">
                              R$ {calcularTotalOrcamento().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {errors.orcamentoAnalitico && (
                    <p className="text-sm text-red-500">{errors.orcamentoAnalitico}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEÇÃO: Equipamentos */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Settings className="h-5 w-5 text-[#FF5722]" />
                Equipamentos Necessários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção de Equipamentos */}
              <div>
                <Label className="text-foreground mb-3 block">Selecionar Equipamentos</Label>
                {loadingEquipamentos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" />
                    <span className="ml-2 text-muted-foreground">Carregando equipamentos...</span>
                  </div>
                ) : equipamentosDisponiveis.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum equipamento disponível</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipamentosDisponiveis.map((equipamento) => (
                      <div key={equipamento.id} className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                        <Checkbox
                          id={`equipamento_${equipamento.id}`}
                          checked={isEquipamentoSelecionado(equipamento.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              adicionarEquipamento(equipamento);
                            } else {
                              const equipamentoSel = equipamentosSelecionados.find(eq => eq.equipamento.id === equipamento.id);
                              if (equipamentoSel) {
                                removerEquipamento(equipamentoSel.id);
                              }
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`equipamento_${equipamento.id}`} 
                          className="text-foreground cursor-pointer flex-1"
                        >
                          <div>
                            <div className="font-medium">{equipamento.nome}</div>
                            <div className="text-sm text-muted-foreground">{equipamento.tipo}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipamentos Selecionados */}
              {equipamentosSelecionados.length > 0 && (
                <div>
                  <Label className="text-foreground mb-3 block">Equipamentos Selecionados</Label>
                  <div className="space-y-4">
                    {equipamentosSelecionados.map((equipamentoSel) => (
                      <div key={equipamentoSel.id} className="p-4 border border-border rounded-lg bg-muted/20">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{equipamentoSel.equipamento.nome}</h4>
                            <p className="text-sm text-muted-foreground">{equipamentoSel.equipamento.tipo}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Quantidade */}
                            <div className="w-20">
                              <Label className="text-xs text-muted-foreground">Qtd</Label>
                              <Input
                                type="number"
                                min="1"
                                value={equipamentoSel.quantidade}
                                onChange={(e) => atualizarEquipamento(equipamentoSel.id, { 
                                  quantidade: parseInt(e.target.value) || 1 
                                })}
                                className="text-center"
                              />
                            </div>
                            
                            {/* Forma de Uso */}
                            <div className="w-32">
                              <Label className="text-xs text-muted-foreground">Forma de Uso</Label>
                              <Select 
                                value={equipamentoSel.formaUso}
                                onValueChange={(value: 'proprio' | 'alugado') => 
                                  atualizarEquipamento(equipamentoSel.id, { formaUso: value })
                                }
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border">
                                  <SelectItem value="proprio">Próprio</SelectItem>
                                  <SelectItem value="alugado">Alugado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Remover */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerEquipamento(equipamentoSel.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEÇÃO: Upload de Arquivos */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <FileUp className="h-5 w-5 text-[#FF5722]" />
                Documentos da Obra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-foreground">Arquivos Importantes</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste ou clique para enviar arquivos importantes da obra (projetos, planilhas, contratos...)
                </p>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.xlsx,.csv,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileUpload"
                  />
                  <Label 
                    htmlFor="fileUpload" 
                    className="cursor-pointer text-foreground flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span>Clique para selecionar arquivos</span>
                    <span className="text-sm text-muted-foreground">ou arraste e solte aqui</span>
                  </Label>
                </div>
              </div>

              {/* Preview dos arquivos */}
              {arquivosUpload.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Arquivos Selecionados:</h4>
                  <div className="space-y-2">
                    {arquivosUpload.map((arquivo) => (
                      <div key={arquivo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{getFileIcon(arquivo.tipo)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{arquivo.nome}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(arquivo.tamanho)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerArquivo(arquivo.id)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEÇÃO: Observações */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <FileText className="h-5 w-5 text-[#FF5722]" />
                Observações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="observacoes" className="text-foreground">Informações Complementares</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Descreva informações adicionais sobre a obra, requisitos especiais, restrições, etc..."
                  rows={4}
                  className="w-full text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2 bg-[#FF5722] hover:bg-[#E64A19] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Obra
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 