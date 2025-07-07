
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
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const obras = [
    { 
      id: '1', 
      nome: 'Shopping Center Norte', 
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
      atividades: ['Fundação', 'Estrutura', 'Alvenaria', 'Acabamento']
    },
    { 
      id: '2', 
      nome: 'Residencial Jardins', 
      endereco: 'Rua das Flores, 500 - São Paulo, SP',
      atividades: ['Escavação', 'Fundação', 'Alvenaria', 'Cobertura']
    },
    { 
      id: '3', 
      nome: 'Torre Empresarial', 
      endereco: 'Av. Faria Lima, 2000 - São Paulo, SP',
      atividades: ['Estrutura', 'Vedação', 'Instalações', 'Acabamento']
    }
  ];

  const equipes = ['Equipe Alpha', 'Equipe Beta', 'Equipe Charlie', 'Equipe Delta'];
  const equipamentosDisponiveis = [
    'Betoneira', 'Guindaste', 'Escavadeira', 'Compressor', 'Gerador', 
    'Vibrador de Concreto', 'Serra Circular', 'Furadeira', 'Martelo Pneumático'
  ];

  const [rdos] = useState([
    {
      id: 1,
      project: 'Shopping Center Norte',
      projectId: '1',
      date: '2024-01-20',
      team: 'Equipe Alpha',
      responsible: 'João Silva',
      status: 'enviado',
      activities: 'Concretagem da laje do 2º pavimento'
    },
    {
      id: 2,
      project: 'Residencial Jardins',
      projectId: '2',
      date: '2024-01-19',
      team: 'Equipe Beta',
      responsible: 'Maria Santos',
      status: 'rascunho',
      activities: 'Execução de alvenaria - blocos 1 a 3'
    }
  ]);

  // Carregar atividades da obra selecionada
  useEffect(() => {
    if (formData.project) {
      const obraSelecionada = obras.find(obra => obra.nome === formData.project);
      if (obraSelecionada) {
        // Atualizar localização automaticamente
        setFormData(prev => ({
          ...prev,
          location: obraSelecionada.endereco,
          atividadesProgresso: obraSelecionada.atividades.map(atividade => ({
            nome: atividade,
            progresso: 0,
            observacoes: ''
          }))
        }));
      }
    }
  }, [formData.project]);

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
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Armazenar imagens vinculadas à obra
      const obraSelecionada = obras.find(obra => obra.nome === formData.project);
      if (obraSelecionada && formData.photos.length > 0) {
        const obraId = obraSelecionada.id;
        if (!imagensPorObra[obraId]) {
          imagensPorObra[obraId] = [];
        }
        imagensPorObra[obraId].push(...formData.photos);
        
        console.log(`Imagens armazenadas para obra ${obraId}:`, imagensPorObra[obraId]);
      }

      toast({
        title: status === 'enviado' ? "RDO enviado!" : "RDO salvo!",
        description: status === 'enviado' 
          ? "O RDO foi enviado e registrado com sucesso." 
          : "O RDO foi salvo como rascunho."
      });

      handleFecharModal();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o RDO. Tente novamente.",
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

  const exportarRDO = (rdo: any) => {
    // Gerar documento PDF do RDO com cabeçalho padrão
    const conteudoPDF = `
METACONSTRUTOR - SISTEMA DE GESTÃO DE OBRAS
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
Responsável Técnico: João Silva (CREA: 123456)

========== RELATÓRIO DIÁRIO DE OBRA ==========

Obra: ${rdo.project}
Data: ${new Date(rdo.date).toLocaleDateString('pt-BR')}
Equipe: ${rdo.team}
Responsável: ${rdo.responsible}

Atividades Executadas:
${rdo.activities}

Status: ${rdo.status === 'enviado' ? 'Enviado' : 'Rascunho'}

-----------------------------------------
Este documento foi gerado automaticamente pelo sistema MetaConstrutor
    `.trim();

    const blob = new Blob([conteudoPDF], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RDO_${rdo.project}_${rdo.date}.txt`;
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
                            <SelectItem key={equipe} value={equipe}>{equipe}</SelectItem>
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
                            <SelectItem key={equip} value={equip}>{equip}</SelectItem>
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

        {/* Lista de RDOs */}
        <div className="grid-responsive">
          {rdos.map((rdo) => (
            <Card key={rdo.id} className="card-standard">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{rdo.project}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(rdo.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <Badge variant={rdo.status === 'enviado' ? 'default' : 'secondary'}>
                    {rdo.status === 'enviado' ? 'Enviado' : 'Rascunho'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Equipe:</span>
                    <span className="truncate">{rdo.team}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Responsável:</span>
                    <span className="truncate">{rdo.responsible}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {rdo.activities}
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
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

        {rdos.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum RDO encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro RDO
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
