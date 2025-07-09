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
import { 
  ArrowLeft,
  FileText, 
  Calendar,
  Users,
  Building,
  Cloud,
  MapPin,
  ClipboardList,
  Loader2,
  Save,
  X,
  Wrench,
  Clock,
  AlertTriangle,
  Camera,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { rdoService } from '@/services/rdoService';
import { obraService } from '@/services/obraService';
import { equipeService } from '@/services/equipeService';

interface Equipamento {
  id: string;
  nome: string;
  quantidade: number;
  observacoes?: string;
}

interface Evidencia {
  id: string;
  arquivo: File;
  caption: string;
  preview: string;
}

export default function NovoRDO() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [obras, setObras] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    obra_id: '',
    equipe_id: '',
    turno: 'matutino' as 'matutino' | 'vespertino' | 'noturno',
    atividades_executadas: '',
    atividades_planejadas: '',
    materiais_utilizados: '',
    clima: 'ensolarado',
    responsavel: '',
    localizacao: '',
    observacoes: '',
    horas_trabalhadas: '8',
    numero_colaboradores: '1',
    // Novos campos do modelo antigo
    horas_ociosas: '0',
    motivo_ociosidade: '',
    acidentes: '',
    ocorrencias: ''
  });

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      const [obrasResponse, equipesResponse] = await Promise.all([
        obraService.listarObras(),
        equipeService.listarEquipes()
      ]);

      if (obrasResponse.data) setObras(obrasResponse.data);
      if (equipesResponse.data) setEquipes(equipesResponse.data);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as obras e equipes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.obra_id) {
      newErrors.obra_id = 'Selecione uma obra';
    }
    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Informe o responsável';
    }
    if (!formData.atividades_executadas.trim()) {
      newErrors.atividades_executadas = 'Descreva as atividades executadas';
    }
    if (!formData.atividades_planejadas.trim()) {
      newErrors.atividades_planejadas = 'Descreva as atividades planejadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const adicionarEquipamento = () => {
    const novoEquipamento: Equipamento = {
      id: Date.now().toString(),
      nome: '',
      quantidade: 1,
      observacoes: ''
    };
    setEquipamentos([...equipamentos, novoEquipamento]);
  };

  const removerEquipamento = (id: string) => {
    setEquipamentos(equipamentos.filter(eq => eq.id !== id));
  };

  const atualizarEquipamento = (id: string, campo: keyof Equipamento, valor: any) => {
    setEquipamentos(equipamentos.map(eq => 
      eq.id === id ? { ...eq, [campo]: valor } : eq
    ));
  };

  const adicionarEvidencia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "As imagens devem ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Apenas arquivos de imagem são aceitos.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const novaEvidencia: Evidencia = {
          id: Date.now().toString() + Math.random(),
          arquivo: file,
          caption: file.name,
          preview: e.target?.result as string
        };
        setEvidencias(prev => [...prev, novaEvidencia]);
      };
      reader.readAsDataURL(file);
    });

    // Limpar input
    event.target.value = '';
  };

  const removerEvidencia = (id: string) => {
    setEvidencias(evidencias.filter(ev => ev.id !== id));
  };

  const atualizarCaptionEvidencia = (id: string, caption: string) => {
    setEvidencias(evidencias.map(ev => 
      ev.id === id ? { ...ev, caption } : ev
    ));
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
      const rdoData = {
        ...formData,
        data: new Date().toISOString().split('T')[0],
        status: 'enviado' as const,
        equipamentos: equipamentos.filter(eq => eq.nome.trim()),
        evidencias: evidencias.map(ev => ev.arquivo)
      };

      const { data, error } = await rdoService.criarRDO(rdoData);
      
      if (error) throw error;

      if (data) {
        toast({
          title: "RDO criado com sucesso!",
          description: "O RDO foi registrado e está disponível na listagem."
        });
        
        // Redirecionar para a listagem de RDOs
        navigate('/rdo');
      }
    } catch (error) {
      console.error('Erro ao criar RDO:', error);
      toast({
        title: "Erro ao criar RDO",
        description: "Não foi possível criar o RDO. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/rdo');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF5722]" />
            <p className="text-gray-600 dark:text-gray-300">Carregando formulário...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Novo RDO</h1>
            <p className="text-muted-foreground mt-1">
              Registre o relatório diário de obra
            </p>
          </div>
        </div>

        <Separator />

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SEÇÃO: Informações Básicas */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Building className="h-5 w-5 text-[#FF5722]" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="obra" className="text-foreground">Obra *</Label>
                  <Select 
                    value={formData.obra_id} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, obra_id: value }))
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
                  <Label htmlFor="equipe" className="text-foreground">Equipe</Label>
                  <Select 
                    value={formData.equipe_id} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, equipe_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipes.map(equipe => (
                        <SelectItem key={equipe.id} value={equipe.id}>
                          {equipe.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="responsavel" className="text-foreground">Responsável *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                    placeholder="Nome do responsável"
                    className={errors.responsavel ? 'border-red-500' : ''}
                  />
                  {errors.responsavel && (
                    <p className="text-sm text-red-500 mt-1">{errors.responsavel}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="turno" className="text-foreground">Turno</Label>
                  <Select 
                    value={formData.turno} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, turno: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matutino">Matutino</SelectItem>
                      <SelectItem value="vespertino">Vespertino</SelectItem>
                      <SelectItem value="noturno">Noturno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clima" className="text-foreground">Clima</Label>
                  <Select 
                    value={formData.clima} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, clima: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ensolarado">☀️ Ensolarado</SelectItem>
                      <SelectItem value="nublado">☁️ Nublado</SelectItem>
                      <SelectItem value="chuvoso">🌧️ Chuvoso</SelectItem>
                      <SelectItem value="parcialmente-nublado">⛅ Parcialmente Nublado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="localizacao" className="text-foreground">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                    placeholder="Local de execução"
                  />
                </div>

                <div>
                  <Label htmlFor="horas_trabalhadas" className="text-foreground">Horas Trabalhadas</Label>
                  <Input
                    id="horas_trabalhadas"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.horas_trabalhadas}
                    onChange={(e) => setFormData(prev => ({ ...prev, horas_trabalhadas: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="numero_colaboradores" className="text-foreground">N° Colaboradores</Label>
                  <Input
                    id="numero_colaboradores"
                    type="number"
                    min="1"
                    value={formData.numero_colaboradores}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero_colaboradores: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Atividades */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <ClipboardList className="h-5 w-5 text-[#FF5722]" />
                Atividades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="atividades_executadas" className="text-foreground">Atividades Executadas *</Label>
                <Textarea
                  id="atividades_executadas"
                  value={formData.atividades_executadas}
                  onChange={(e) => setFormData(prev => ({ ...prev, atividades_executadas: e.target.value }))}
                  placeholder="Descreva detalhadamente as atividades executadas durante o período..."
                  rows={4}
                  className={errors.atividades_executadas ? 'border-red-500' : ''}
                />
                {errors.atividades_executadas && (
                  <p className="text-sm text-red-500 mt-1">{errors.atividades_executadas}</p>
                )}
              </div>

              <div>
                <Label htmlFor="atividades_planejadas" className="text-foreground">Atividades Planejadas *</Label>
                <Textarea
                  id="atividades_planejadas"
                  value={formData.atividades_planejadas}
                  onChange={(e) => setFormData(prev => ({ ...prev, atividades_planejadas: e.target.value }))}
                  placeholder="Descreva as atividades planejadas para o próximo período..."
                  rows={4}
                  className={errors.atividades_planejadas ? 'border-red-500' : ''}
                />
                {errors.atividades_planejadas && (
                  <p className="text-sm text-red-500 mt-1">{errors.atividades_planejadas}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Materiais Utilizados */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <FileText className="h-5 w-5 text-[#FF5722]" />
                Materiais Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="materiais_utilizados" className="text-foreground">Materiais e Insumos</Label>
                <Textarea
                  id="materiais_utilizados"
                  value={formData.materiais_utilizados}
                  onChange={(e) => setFormData(prev => ({ ...prev, materiais_utilizados: e.target.value }))}
                  placeholder="Liste os materiais utilizados durante as atividades..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Equipamentos Utilizados */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Wrench className="h-5 w-5 text-[#FF5722]" />
                Equipamentos Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipamentos.map((equipamento, index) => (
                <div key={equipamento.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                  <div>
                    <Label className="text-foreground">Nome do Equipamento</Label>
                    <Input
                      value={equipamento.nome}
                      onChange={(e) => atualizarEquipamento(equipamento.id, 'nome', e.target.value)}
                      placeholder="Ex: Betoneira, Furadeira..."
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={equipamento.quantidade}
                      onChange={(e) => atualizarEquipamento(equipamento.id, 'quantidade', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Observações</Label>
                    <Input
                      value={equipamento.observacoes || ''}
                      onChange={(e) => atualizarEquipamento(equipamento.id, 'observacoes', e.target.value)}
                      placeholder="Estado, problemas..."
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerEquipamento(equipamento.id)}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={adicionarEquipamento}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Equipamento
              </Button>
            </CardContent>
          </Card>

          {/* SEÇÃO: Horas Ociosas */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Clock className="h-5 w-5 text-[#FF5722]" />
                Horas Ociosas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horas_ociosas" className="text-foreground">Quantidade de Horas</Label>
                  <Input
                    id="horas_ociosas"
                    type="number"
                    min="0"
                    max="24"
                    value={formData.horas_ociosas}
                    onChange={(e) => setFormData(prev => ({ ...prev, horas_ociosas: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="motivo_ociosidade" className="text-foreground">Motivo da Ociosidade</Label>
                  <Input
                    id="motivo_ociosidade"
                    value={formData.motivo_ociosidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivo_ociosidade: e.target.value }))}
                    placeholder="Ex: Chuva, falta de material..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Ocorrências */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <AlertTriangle className="h-5 w-5 text-[#FF5722]" />
                Ocorrências e Acidentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ocorrencias" className="text-foreground">Ocorrências</Label>
                <Textarea
                  id="ocorrencias"
                  value={formData.ocorrencias}
                  onChange={(e) => setFormData(prev => ({ ...prev, ocorrencias: e.target.value }))}
                  placeholder="Relate qualquer ocorrência relevante durante o trabalho..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="acidentes" className="text-foreground">Acidentes</Label>
                <Textarea
                  id="acidentes"
                  value={formData.acidentes}
                  onChange={(e) => setFormData(prev => ({ ...prev, acidentes: e.target.value }))}
                  placeholder="Relate acidentes de trabalho, se houver..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Observações */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <FileText className="h-5 w-5 text-[#FF5722]" />
                Observações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="observacoes" className="text-foreground">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Adicione observações, comentários ou informações complementares..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO: Evidências Fotográficas */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Camera className="h-5 w-5 text-[#FF5722]" />
                Evidências Fotográficas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-foreground">Adicionar Fotos</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[#FF5722] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={adicionarEvidencia}
                    className="hidden"
                    id="evidencias-upload"
                  />
                  <label htmlFor="evidencias-upload" className="cursor-pointer">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Clique para selecionar fotos ou arraste-as aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: JPG, PNG, GIF (máx. 5MB cada)
                    </p>
                  </label>
                </div>
              </div>

              {evidencias.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {evidencias.map((evidencia) => (
                    <div key={evidencia.id} className="relative group">
                      <img
                        src={evidencia.preview}
                        alt="Evidência"
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removerEvidencia(evidencia.id)}
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Input
                        value={evidencia.caption}
                        onChange={(e) => atualizarCaptionEvidencia(evidencia.id, e.target.value)}
                        placeholder="Legenda da foto"
                        className="mt-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
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
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar RDO
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 