
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Plus, 
  MapPin, 
  Camera, 
  Upload, 
  Calendar,
  Users,
  Wrench,
  AlertTriangle,
  Clock,
  Package,
  Save,
  X,
  Building,
  Download,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { rdoService, type CriarRDOCompleto, type RDO } from '@/services/rdoService';
import { obraService } from '@/services/obraService';
import { equipeService } from '@/services/equipeService';
import { equipamentoService } from '@/services/equipamentoService';

interface ImagemRDO {
  id: string;
  file: File;
  url: string;
  caption?: string;
  obraId: string;
}

interface AtividadeRDO {
  nome: string;
  progresso: number;
  observacoes: string;
}

interface EquipamentoRDO {
  nome: string;
  status: 'funcionando' | 'quebrado' | 'manutencao';
  observacoes?: string;
}

interface RDOFormData {
  project: string;
  team: string;
  activities: string;
  plannedActivities: string;
  materials: string;
  weather: string;
  responsible: string;
  location: string;
  photos: ImagemRDO[];
  horasOciosas: number;
  motivoOciosidade: string;
  equipamentos: EquipamentoRDO[];
  atividadesProgresso: AtividadeRDO[];
  acidentes: string;
  materiaisUtilizados: string;
}

// Simulando armazenamento de imagens por obra
const imagensPorObra: { [obraId: string]: ImagemRDO[] } = {};

export default function RDO() {
  const { toast } = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [localizacaoCarregando, setLocalizacaoCarregando] = useState(false);

  const [formData, setFormData] = useState<RDOFormData>({
    project: '',
    team: '',
    activities: '',
    plannedActivities: '',
    materials: '',
    weather: 'ensolarado',
    responsible: '',
    location: '',
    photos: [],
    horasOciosas: 0,
    motivoOciosidade: '',
    equipamentos: [],
    atividadesProgresso: [],
    acidentes: '',
    materiaisUtilizados: ''
  });

  // Estados para dados do Supabase
  const [obras, setObras] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<any[]>([]);
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroObra, setFiltroObra] = useState<string>('');
  const [busca, setBusca] = useState('');

  // Filtrar RDOs baseado nos filtros selecionados
  const rdosFiltrados = rdos.filter(rdo => {
    const matchBusca = !busca || 
      rdo.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      rdo.atividades_executadas.toLowerCase().includes(busca.toLowerCase()) ||
      rdo.obra?.nome.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = !filtroStatus || rdo.status === filtroStatus;
    const matchObra = !filtroObra || rdo.obra_id === filtroObra;
    
    return matchBusca && matchStatus && matchObra;
  });

  // Carregar dados do Supabase
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregandoDados(true);
        
        // Carregar obras
        const { data: obrasData, error: obrasError } = await obraService.listarObras();
        if (!obrasError && obrasData) {
          setObras(obrasData);
        }

        // Carregar equipes
        const { data: equipesData, error: equipesError } = await equipeService.listarEquipes();
        if (!equipesError && equipesData) {
          setEquipes(equipesData);
        }

        // Carregar equipamentos
        const { data: equipamentosData, error: equipamentosError } = await equipamentoService.listarEquipamentos();
        if (!equipamentosError && equipamentosData) {
          setEquipamentosDisponiveis(equipamentosData);
        }

        // Carregar RDOs
        const { data: rdosData, error: rdosError } = await rdoService.listarRDOs();
        if (!rdosError && rdosData) {
          setRdos(rdosData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setCarregandoDados(false);
      }
    };

    carregarDados();
  }, []);

  // Carregar atividades da obra selecionada
  useEffect(() => {
    if (formData.project) {
      const obraSelecionada = obras.find(obra => obra.nome === formData.project);
      if (obraSelecionada) {
        // Atualizar localização automaticamente
        setFormData(prev => ({
          ...prev,
          location: obraSelecionada.endereco,
          atividadesProgresso: obraSelecionada.orcamento_analitico?.map((item: any) => ({
            nome: item.descricao,
            progresso: 0,
            observacoes: ''
          })) || []
        }));
      }
    }
  }, [formData.project, obras]);

  const obterLocalizacao = async () => {
    setLocalizacaoCarregando(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Simular geocoding reverso
            await new Promise(resolve => setTimeout(resolve, 1000));
            const endereco = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            setFormData(prev => ({ ...prev, location: endereco }));
            toast({
              title: "Localização obtida!",
              description: "Coordenadas atualizadas com sucesso."
            });
          },
          (error) => {
            toast({
              title: "Erro de localização",
              description: "Não foi possível obter sua localização.",
              variant: "destructive"
            });
          }
        );
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao obter localização.",
        variant: "destructive"
      });
    } finally {
      setLocalizacaoCarregando(false);
    }
  };

  const adicionarEquipamento = () => {
    setFormData(prev => ({
      ...prev,
      equipamentos: [...prev.equipamentos, { nome: '', status: 'funcionando', observacoes: '' }]
    }));
  };

  const removerEquipamento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.filter((_, i) => i !== index)
    }));
  };

  const atualizarEquipamento = (index: number, campo: keyof EquipamentoRDO, valor: any) => {
    const equipamentos = [...formData.equipamentos];
    equipamentos[index] = { ...equipamentos[index], [campo]: valor };
    setFormData(prev => ({ ...prev, equipamentos }));
  };

  const atualizarAtividade = (index: number, campo: keyof AtividadeRDO, valor: any) => {
    const atividades = [...formData.atividadesProgresso];
    atividades[index] = { ...atividades[index], [campo]: valor };
    setFormData(prev => ({ ...prev, atividadesProgresso: atividades }));
  };

  const handleSalvarRDO = async (status: 'rascunho' | 'enviado') => {
    if (!formData.project || !formData.team || !formData.responsible) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Obra, Equipe e Responsável para continuar.",
        variant: "destructive"
      });
      return;
    }

    setCarregando(true);

    try {
      // Encontrar IDs reais da obra e equipe
      const obraSelecionada = obras.find(obra => obra.nome === formData.project);
      const equipeSelecionada = equipes.find(equipe => equipe.nome === formData.team);

      if (!obraSelecionada) {
        throw new Error('Obra não encontrada');
      }

      if (!equipeSelecionada) {
        throw new Error('Equipe não encontrada');
      }

      // Preparar dados do RDO para o Supabase
      const rdoData: CriarRDOCompleto = {
        obra_id: obraSelecionada.id,
        equipe_id: equipeSelecionada.id,
        data: new Date().toISOString().split('T')[0],
        atividades_executadas: formData.activities,
        atividades_planejadas: formData.plannedActivities,
        materiais_utilizados: formData.materiaisUtilizados,
        clima: formData.weather,
        responsavel: formData.responsible,
        localizacao: formData.location,
        horas_ociosas: formData.horasOciosas,
        motivo_ociosidade: formData.motivoOciosidade,
        acidentes: formData.acidentes,
        status: status,
        observacoes: `Equipamentos: ${JSON.stringify(formData.equipamentos)}`,
        progresso_atividades: formData.atividadesProgresso,
        equipamentos_utilizados: formData.equipamentos,
        imagens: formData.photos.map(photo => photo.file)
      };

      // Salvar RDO no Supabase usando rdoService
      const { data, error } = await rdoService.criarRDO(rdoData);
      
      if (error) {
        throw error;
      }

      // Atualizar lista de RDOs
      if (data) {
        setRdos(prev => [data, ...prev]);
      }

      toast({
        title: status === 'enviado' ? "RDO enviado!" : "RDO salvo!",
        description: status === 'enviado' 
          ? "O RDO foi enviado e registrado com sucesso." 
          : "O RDO foi salvo como rascunho."
      });

      handleFecharModal();
    } catch (error: any) {
      console.error('Erro ao salvar RDO:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o RDO. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setFormData({
      project: '',
      team: '',
      activities: '',
      plannedActivities: '',
      materials: '',
      weather: 'ensolarado',
      responsible: '',
      location: '',
      photos: [],
      horasOciosas: 0,
      motivoOciosidade: '',
      equipamentos: [],
      atividadesProgresso: [],
      acidentes: '',
      materiaisUtilizados: ''
    });
  };

  const recarregarRDOs = async () => {
    try {
      setCarregandoDados(true);
      const { data: rdosData, error } = await rdoService.listarRDOs();
      if (!error && rdosData) {
        setRdos(rdosData);
        toast({
          title: "Dados atualizados",
          description: "Lista de RDOs recarregada com sucesso."
        });
      } else {
        toast({
          title: "Erro ao recarregar",
          description: "Não foi possível recarregar os dados.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao recarregar RDOs:', error);
      toast({
        title: "Erro ao recarregar",
        description: "Não foi possível recarregar os dados.",
        variant: "destructive"
      });
    } finally {
      setCarregandoDados(false);
    }
  };

  const visualizarRDO = (rdo: RDO) => {
    // TODO: Implementar modal de visualização do RDO
    console.log('Visualizar RDO:', rdo);
    toast({
      title: "Visualização de RDO",
      description: "Funcionalidade em desenvolvimento."
    });
  };

  const editarRDO = (rdo: RDO) => {
    // TODO: Implementar edição do RDO
    console.log('Editar RDO:', rdo);
    toast({
      title: "Edição de RDO",
      description: "Funcionalidade em desenvolvimento."
    });
  };

  const handleUploadFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const obraSelecionada = obras.find(obra => obra.nome === formData.project);
      const obraId = obraSelecionada?.id || '';

      const novasImagens: ImagemRDO[] = files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        url: URL.createObjectURL(file),
        obraId
      }));

      setFormData(prev => ({ 
        ...prev, 
        photos: [...prev.photos, ...novasImagens] 
      }));

      toast({
        title: "Fotos adicionadas",
        description: `${files.length} foto(s) foram adicionadas ao RDO.`
      });
    }
  };

  const removerFoto = (fotoId: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== fotoId)
    }));
  };

  const exportarRDO = (rdo: RDO) => {
    // Gerar documento PDF do RDO com cabeçalho padrão
    const conteudoPDF = `
METACONSTRUTOR - SISTEMA DE GESTÃO DE OBRAS
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
Responsável Técnico: João Silva (CREA: 123456)

========== RELATÓRIO DIÁRIO DE OBRA ==========

Obra: ${rdo.obra?.nome || 'Não definido'}
Data: ${new Date(rdo.data).toLocaleDateString('pt-BR')}
Equipe: ${rdo.equipe?.nome || 'Não definido'}
Responsável: ${rdo.responsavel}

Atividades Executadas:
${rdo.atividades_executadas}

Atividades Planejadas:
${rdo.atividades_planejadas}

Materiais Utilizados:
${rdo.materiais_utilizados}

Clima: ${rdo.clima}
Localização: ${rdo.localizacao}

Horas Ociosas: ${rdo.horas_ociosas}h
${rdo.motivo_ociosidade ? `Motivo: ${rdo.motivo_ociosidade}` : ''}

${rdo.acidentes ? `Acidentes/Ocorrências: ${rdo.acidentes}` : ''}

Status: ${rdo.status === 'enviado' ? 'Enviado' : 
         rdo.status === 'aprovado' ? 'Aprovado' :
         rdo.status === 'rejeitado' ? 'Rejeitado' : 'Rascunho'}

${rdo.observacoes ? `Observações: ${rdo.observacoes}` : ''}

-----------------------------------------
Este documento foi gerado automaticamente pelo sistema MetaConstrutor
    `.trim();

    const blob = new Blob([conteudoPDF], { type: 'text/plain' });
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
      description: "O arquivo foi baixado com sucesso."
    });
  };

  return (
    <Layout>
      <div className="section-container animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start section-spacing">
          <div className="space-y-2">
            <h1 className="page-title">RDO - Relatório Diário de Obra</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Registre e acompanhe as atividades diárias das obras
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={recarregarRDOs} disabled={carregandoDados}>
              <Loader2 className={`h-4 w-4 ${carregandoDados ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button className="btn-standard">
                  <Plus className="h-4 w-4" />
                  Novo RDO
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Novo RDO
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do relatório diário de obra
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Básicas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project">Obra *</Label>
                      <Select value={formData.project} onValueChange={(value) => setFormData({...formData, project: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a obra" />
                        </SelectTrigger>
                        <SelectContent>
                          {obras.map(obra => (
                            <SelectItem key={obra.id} value={obra.nome}>{obra.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team">Equipe *</Label>
                      <Select value={formData.team} onValueChange={(value) => setFormData({...formData, team: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipes.map(equipe => (
                            <SelectItem key={equipe.id} value={equipe.nome}>{equipe.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="responsible">Responsável *</Label>
                      <Input
                        id="responsible"
                        value={formData.responsible}
                        onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                        placeholder="Nome do responsável"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weather">Clima</Label>
                      <Select value={formData.weather} onValueChange={(value) => setFormData({...formData, weather: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ensolarado">Ensolarado</SelectItem>
                          <SelectItem value="nublado">Nublado</SelectItem>
                          <SelectItem value="chuvoso">Chuvoso</SelectItem>
                          <SelectItem value="parcialmente-nublado">Parcialmente Nublado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Endereço ou coordenadas"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={obterLocalizacao}
                        disabled={localizacaoCarregando}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Atividades com Progresso */}
                {formData.atividadesProgresso.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Progresso das Atividades</h3>
                    
                    {formData.atividadesProgresso.map((atividade, index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{atividade.nome}</h4>
                          <Badge variant="outline">{atividade.progresso}%</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Progresso (%)</Label>
                          <div className="flex items-center gap-3">
                            <Progress value={atividade.progresso} className="flex-1" />
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={atividade.progresso}
                              onChange={(e) => atualizarAtividade(index, 'progresso', Number(e.target.value))}
                              className="w-20"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Observações</Label>
                          <Textarea
                            value={atividade.observacoes}
                            onChange={(e) => atualizarAtividade(index, 'observacoes', e.target.value)}
                            placeholder="Observações sobre a atividade"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Equipamentos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Equipamentos Utilizados</h3>
                    <Button type="button" variant="outline" size="sm" onClick={adicionarEquipamento}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  {formData.equipamentos.map((equipamento, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                      <Select value={equipamento.nome} onValueChange={(value) => atualizarEquipamento(index, 'nome', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipamentosDisponiveis.map(equip => (
                            <SelectItem key={equip.id} value={equip.nome}>{equip.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={equipamento.status} onValueChange={(value) => atualizarEquipamento(index, 'status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="funcionando">Funcionando</SelectItem>
                          <SelectItem value="quebrado">Quebrado</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        placeholder="Observações"
                        value={equipamento.observacoes || ''}
                        onChange={(e) => atualizarEquipamento(index, 'observacoes', e.target.value)}
                      />
                      
                      <Button type="button" variant="outline" size="sm" onClick={() => removerEquipamento(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Horas Ociosas e Materiais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Horas Ociosas</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="horasOciosas">Quantidade de Horas</Label>
                      <Input
                        id="horasOciosas"
                        type="number"
                        min="0"
                        max="24"
                        value={formData.horasOciosas}
                        onChange={(e) => setFormData({...formData, horasOciosas: Number(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="motivoOciosidade">Motivo da Ociosidade</Label>
                      <Textarea
                        id="motivoOciosidade"
                        value={formData.motivoOciosidade}
                        onChange={(e) => setFormData({...formData, motivoOciosidade: e.target.value})}
                        placeholder="Descreva o motivo da ociosidade"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Materiais Utilizados</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="materiaisUtilizados">Lista de Materiais</Label>
                      <Textarea
                        id="materiaisUtilizados"
                        value={formData.materiaisUtilizados}
                        onChange={(e) => setFormData({...formData, materiaisUtilizados: e.target.value})}
                        placeholder="Ex: Concreto - 5m³, Aço CA-50 - 200kg"
                        rows={5}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ocorrências/Acidentes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Ocorrências e Acidentes</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="acidentes">Relato de Ocorrências</Label>
                    <Textarea
                      id="acidentes"
                      value={formData.acidentes}
                      onChange={(e) => setFormData({...formData, acidentes: e.target.value})}
                      placeholder="Descreva qualquer acidente, incidente ou ocorrência relevante"
                      rows={4}
                    />
                  </div>
                </div>

                <Separator />

                {/* Atividades Gerais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Atividades Executadas</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activities">Descrição das Atividades</Label>
                    <Textarea
                      id="activities"
                      value={formData.activities}
                      onChange={(e) => setFormData({...formData, activities: e.target.value})}
                      placeholder="Descreva as atividades executadas no dia"
                      rows={4}
                    />
                  </div>
                </div>

                <Separator />

                {/* Fotos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Evidências Fotográficas</h3>
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione fotos das atividades executadas
                    </p>
                    <Button type="button" variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Fotos
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadFoto}
                      className="hidden"
                    />
                  </div>
                  
                  {formData.photos.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        {formData.photos.length} foto(s) adicionada(s)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {formData.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.url}
                              alt="Foto do RDO"
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removerFoto(photo.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFecharModal}
                  className="flex-1"
                  disabled={carregando}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleSalvarRDO('rascunho')}
                  disabled={carregando}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Rascunho
                </Button>
                <Button
                  onClick={() => handleSalvarRDO('enviado')}
                  disabled={carregando}
                  className="flex-1 btn-standard"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Enviar RDO
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busca">Buscar</Label>
                <Input
                  id="busca"
                  placeholder="Buscar por responsável ou atividade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtroObra">Obra</Label>
                <Select value={filtroObra} onValueChange={setFiltroObra}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as obras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as obras</SelectItem>
                    {obras.map(obra => (
                      <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtroStatus">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de RDOs */}
        {!carregandoDados && rdos.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {rdosFiltrados.length} de {rdos.length} RDOs
            </p>
          </div>
        )}
        
        {carregandoDados ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando RDOs...</span>
          </div>
        ) : (
          <div className="grid-responsive">
            {rdosFiltrados.map((rdo) => (
              <Card key={rdo.id} className="card-standard">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{rdo.obra?.nome}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(rdo.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <Badge variant={
                      rdo.status === 'enviado' ? 'default' : 
                      rdo.status === 'aprovado' ? 'success' :
                      rdo.status === 'rejeitado' ? 'destructive' : 'secondary'
                    }>
                      {rdo.status === 'enviado' ? 'Enviado' : 
                       rdo.status === 'aprovado' ? 'Aprovado' :
                       rdo.status === 'rejeitado' ? 'Rejeitado' : 'Rascunho'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Equipe:</span>
                      <span className="truncate">{rdo.equipe?.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Responsável:</span>
                      <span className="truncate">{rdo.responsavel}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {rdo.atividades_executadas}
                  </p>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => visualizarRDO(rdo)}>
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => editarRDO(rdo)}>
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportarRDO(rdo)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {rdosFiltrados.length === 0 && !carregandoDados && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {rdos.length === 0 ? 'Nenhum RDO encontrado' : 'Nenhum RDO corresponde aos filtros'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {rdos.length === 0 ? 'Comece criando seu primeiro RDO' : 'Tente ajustar os filtros ou limpar a busca'}
            </p>
            <Button onClick={() => setModalAberto(true)} className="btn-standard">
              <Plus className="mr-2 h-4 w-4" />
              Novo RDO
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
