import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/DatePicker";
import { Copy, FileText, Users, Calendar, Package, Upload, Save, X, Wrench, Search, Image, Paperclip, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActivities, Activity } from "@/hooks/useActivities";
import { useEquipamentos, Equipamento } from "@/hooks/useEquipamentos";
import { Attachment, UploadProgress, isValidFileType, formatFileSize } from "@/types/attachment";
import { toast } from "sonner";

interface NovaAtividadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentObra?: string;
}

export const NovaAtividadeModal = ({ isOpen, onClose, currentObra }: NovaAtividadeModalProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [equipamentoSearch, setEquipamentoSearch] = useState("");
  const [formData, setFormData] = useState({
    // Informações Básicas
    obra: currentObra || "",
    nome: "",
    categoria: "",
    unidadeMedida: "",
    quantidadePrevista: "",
    // Detalhamento
    responsavel: "",
    dataInicio: undefined as Date | undefined,
    dataTermino: undefined as Date | undefined,
    descricao: "",
    materiais: [] as { nome: string; quantidade: string }[],
    equipamentos: [] as { id: string; nome: string; tipo: "Próprio" | "Aluguel" }[],
    observacoes: "",
    // Anexos
    imageAttachments: [] as Attachment[],
    documentAttachments: [] as Attachment[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { toast: hookToast } = useToast();
  const { saveActivity, activities } = useActivities();
  const { searchEquipamentos, getEquipamentoById } = useEquipamentos();

  // Dados mockados - em um app real viriam de uma API
  const obras = [
    { id: "1", nome: "Residencial Vista Alegre" },
    { id: "2", nome: "Comercial Centro Plaza" },
    { id: "3", nome: "Industrial Norte" }
  ];

  const categorias = [
    "Terraplanagem", "Estrutura", "Alvenaria", "Instalações", "Acabamento", "Cobertura"
  ];

  const unidadesMedida = [
    { value: "m2", label: "m²", popular: true },
    { value: "m3", label: "m³", popular: true },
    { value: "m", label: "m", popular: true },
    { value: "un", label: "Un", popular: true },
    { value: "kg", label: "Kg", popular: false },
    { value: "t", label: "t", popular: false }
  ];

  const popularUnits = unidadesMedida.filter(u => u.popular);
  const otherUnits = unidadesMedida.filter(u => !u.popular);

  const responsaveis = [
    { id: "resp-1", nome: "João Silva", tipo: "Engenheiro Civil" },
    { id: "resp-2", nome: "Maria Santos", tipo: "Técnica de Qualidade" },
    { id: "resp-3", nome: "Carlos Lima", tipo: "Mestre de Obras" },
    { id: "resp-4", nome: "Ana Costa", tipo: "Arquiteta" }
  ];

  const materiaisDisponiveis = [
    "Cimento",
    "Areia", 
    "Brita",
    "Ferro",
    "Madeira",
    "Tijolo",
    "Telha",
    "Tinta"
  ];

  // Get last activity data for duplication
  const getLastActivity = () => {
    const allActivities = Object.values(activities).flat();
    if (allActivities.length === 0) return null;
    
    // Sort by date string (most recent first)
    const sortedActivities = allActivities.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    return sortedActivities[0];
  };

  useEffect(() => {
    if (currentObra) {
      setFormData(prev => ({ ...prev, obra: currentObra }));
    }
  }, [currentObra]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materiais: [...prev.materiais, { nome: "", quantidade: "" }]
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materiais: prev.materiais.filter((_, i) => i !== index)
    }));
  };

  const updateMaterial = (index: number, field: 'nome' | 'quantidade', value: string) => {
    setFormData(prev => ({
      ...prev,
      materiais: prev.materiais.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const addEquipamento = (equipamentoId: string, tipo: "Próprio" | "Aluguel") => {
    const equipamento = getEquipamentoById(equipamentoId);
    if (equipamento && !formData.equipamentos.find(e => e.id === equipamentoId)) {
      setFormData(prev => ({
        ...prev,
        equipamentos: [...prev.equipamentos, {
          id: equipamento.id,
          nome: equipamento.nome,
          tipo
        }]
      }));
    }
  };

  const removeEquipamento = (equipamentoId: string) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.filter(e => e.id !== equipamentoId)
    }));
  };

  // Funções para gerenciar anexos
  const handleFileUpload = async (files: FileList, targetType?: 'image' | 'document') => {
    const validFiles = Array.from(files).filter(file => {
      if (!isValidFileType(file)) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        return false;
      }
      if (file.size > 25 * 1024 * 1024) { // 25MB
        toast.error(`Arquivo muito grande: ${file.name} (máx. 25MB)`);
        return false;
      }
      
      // Filtrar por tipo se especificado
      if (targetType) {
        const isImage = file.type.startsWith('image/');
        if (targetType === 'image' && !isImage) {
          toast.error(`Apenas imagens são aceitas nesta seção: ${file.name}`);
          return false;
        }
        if (targetType === 'document' && isImage) {
          toast.error(`Apenas documentos são aceitos nesta seção: ${file.name}`);
          return false;
        }
      }
      
      return true;
    });

    // Simular upload
    for (const file of validFiles) {
      const progressId = `upload-${Date.now()}-${Math.random()}`;
      
      // Adicionar à lista de progresso
      setUploadProgress(prev => [...prev, {
        id: progressId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      // Simular progresso de upload
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Finalizar upload
            setUploadProgress(prev => 
              prev.map(p => p.id === progressId 
                ? { ...p, progress: 100, status: 'completed' as const }
                : p
              )
            );

            // Adicionar aos anexos
            const mockAttachment: Attachment = {
              id: `attachment-${Date.now()}`,
              name: file.name,
              type: file.type.startsWith('image/') ? 'image' : 'document',
              mimeType: file.type,
              size: file.size,
              url: URL.createObjectURL(file), // Mock URL
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'mock-user-id'
            };

            // Adicionar à lista correta no formData
            if (mockAttachment.type === 'image') {
              setFormData(prev => ({
                ...prev,
                imageAttachments: [...prev.imageAttachments, mockAttachment]
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                documentAttachments: [...prev.documentAttachments, mockAttachment]
              }));
            }

            // Remover da lista de progresso após 2s
            setTimeout(() => {
              setUploadProgress(prev => prev.filter(p => p.id !== progressId));
            }, 2000);

            toast.success(`Arquivo enviado: ${file.name}`);
          } else {
            setUploadProgress(prev => 
              prev.map(p => p.id === progressId ? { ...p, progress } : p)
            );
          }
        }, 200);
      };

      simulateUpload();
    }
  };

  const removeAttachment = (attachmentId: string, type: 'image' | 'document') => {
    if (type === 'image') {
      setFormData(prev => ({
        ...prev,
        imageAttachments: prev.imageAttachments.filter(a => a.id !== attachmentId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        documentAttachments: prev.documentAttachments.filter(a => a.id !== attachmentId)
      }));
    }
    toast.success("Anexo removido");
  };

  const duplicateLastActivity = () => {
    const lastActivity = getLastActivity();
    if (lastActivity) {
      // Convert Activity to form data format
      const obraData = obras.find(o => o.nome === lastActivity.obra);
      setFormData(prev => ({
        ...prev,
        obra: obraData?.id || "",
        nome: lastActivity.title,
        descricao: lastActivity.description,
        // Keep current responsavel, dates, materiais, equipamentos, observacoes
      }));
      hookToast({
        title: "Atividade duplicada",
        description: "Dados da última atividade foram aplicados. Você pode editá-los antes de salvar.",
      });
    } else {
      hookToast({
        title: "Nenhuma atividade encontrada",
        description: "Não há atividades anteriores para duplicar.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.obra || !formData.nome || !formData.categoria || !formData.unidadeMedida || !formData.quantidadePrevista) {
      hookToast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create activity using real data hook
      const obraData = obras.find(o => o.id === formData.obra);
      const newActivity: Activity = {
        id: Date.now().toString(),
        title: formData.nome,
        description: formData.descricao || `Atividade: ${formData.nome}`,
        obra: obraData?.nome || "",
        date: formData.dataInicio ? formData.dataInicio.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: "08:00",
        status: "agendada",
        priority: "media"
      };

      saveActivity(newActivity);

      // Reset form
      setFormData({
        obra: currentObra || "",
        nome: "",
        categoria: "",
        unidadeMedida: "",
        quantidadePrevista: "",
        responsavel: "",
        dataInicio: undefined,
        dataTermino: undefined,
        descricao: "",
        materiais: [],
        equipamentos: [],
        observacoes: "",
        imageAttachments: [],
        documentAttachments: []
      });
      
      setActiveTab("basic");
      onClose();
      
    } catch (error) {
      hookToast({
        title: "Erro",
        description: "Não foi possível criar a atividade",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.obra && formData.nome && formData.categoria && 
           formData.unidadeMedida && formData.quantidadePrevista;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden bg-card border-border">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-card-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nova Atividade
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure uma nova atividade para a obra
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={duplicateLastActivity}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicar última
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Detalhamento
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[50vh] pr-2">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Dados Essenciais</CardTitle>
                    <CardDescription>
                      Informações mínimas necessárias para cadastrar a atividade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="obra" className="text-sm font-medium">
                        Obra <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.obra} onValueChange={(value) => handleInputChange("obra", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a obra" />
                        </SelectTrigger>
                        <SelectContent>
                          {obras.map((obra) => (
                            <SelectItem key={obra.id} value={obra.id}>
                              {obra.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-medium">
                        Nome da Atividade <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Concretagem de laje do 1º pavimento"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoria" className="text-sm font-medium">
                          Categoria <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((categoria) => (
                              <SelectItem key={categoria} value={categoria}>
                                {categoria}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unidade" className="text-sm font-medium">
                          Unidade <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.unidadeMedida} onValueChange={(value) => handleInputChange("unidadeMedida", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Unidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Mais usadas</div>
                            {popularUnits.map((unidade) => (
                              <SelectItem key={unidade.value} value={unidade.value}>
                                {unidade.label}
                              </SelectItem>
                            ))}
                            <div className="border-t mx-2 my-1"></div>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Outras</div>
                            {otherUnits.map((unidade) => (
                              <SelectItem key={unidade.value} value={unidade.value}>
                                {unidade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantidade" className="text-sm font-medium">
                        Quantidade Prevista <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantidade"
                        type="number"
                        placeholder="Ex: 150"
                        value={formData.quantidadePrevista}
                        onChange={(e) => handleInputChange("quantidadePrevista", e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Detalhamento Completo</CardTitle>
                    <CardDescription>
                      Informações adicionais para enriquecer a atividade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="responsavel">Responsável</Label>
                      <Select value={formData.responsavel} onValueChange={(value) => handleInputChange("responsavel", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {responsaveis.map((resp) => (
                            <SelectItem key={resp.id} value={resp.id}>
                              <div className="flex flex-col">
                                <span>{resp.nome}</span>
                                <span className="text-xs text-muted-foreground">{resp.tipo}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <DatePicker
                          date={formData.dataInicio}
                          onDateChange={(date) => handleInputChange("dataInicio", date)}
                          placeholder="Selecione a data"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Término</Label>
                        <DatePicker
                          date={formData.dataTermino}
                          onDateChange={(date) => handleInputChange("dataTermino", date)}
                          placeholder="Selecione a data"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva detalhadamente a atividade..."
                        value={formData.descricao}
                        onChange={(e) => handleInputChange("descricao", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Equipamentos Necessários</Label>
                        <div className="flex gap-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              placeholder="Buscar equipamento..."
                              value={equipamentoSearch}
                              onChange={(e) => setEquipamentoSearch(e.target.value)}
                              className="pl-8 w-48"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {equipamentoSearch && (
                        <div className="border rounded-md max-h-40 overflow-y-auto">
                          {searchEquipamentos(equipamentoSearch).map((equipamento) => (
                            <div key={equipamento.id} className="flex items-center justify-between p-2 hover:bg-accent">
                              <div>
                                <span className="font-medium">{equipamento.nome}</span>
                                <span className="text-sm text-muted-foreground ml-2">({equipamento.categoria})</span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addEquipamento(equipamento.id, "Próprio")}
                                  className="text-xs"
                                >
                                  Próprio
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addEquipamento(equipamento.id, "Aluguel")}
                                  className="text-xs"
                                >
                                  Aluguel
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {formData.equipamentos.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Equipamentos Selecionados:</Label>
                          {formData.equipamentos.map((equipamento) => (
                            <div key={equipamento.id} className="flex items-center justify-between p-2 border rounded-md">
                              <div>
                                <span className="font-medium">{equipamento.nome}</span>
                                <Badge variant={equipamento.tipo === "Próprio" ? "default" : "secondary"} className="ml-2 text-xs">
                                  {equipamento.tipo}
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => removeEquipamento(equipamento.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Materiais/Recursos</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addMaterial}>
                          <Package className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      {formData.materiais.map((material, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <Select
                              value={material.nome}
                              onValueChange={(value) => updateMaterial(index, "nome", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Material" />
                              </SelectTrigger>
                              <SelectContent>
                                {materiaisDisponiveis.map((mat) => (
                                  <SelectItem key={mat} value={mat}>
                                    {mat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24 space-y-1">
                            <Input
                              type="number"
                              placeholder="Qtd"
                              value={material.quantidade}
                              onChange={(e) => updateMaterial(index, "quantidade", e.target.value)}
                              min="0"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeMaterial(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Observações gerais, notas técnicas..."
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange("observacoes", e.target.value)}
                        rows={3}
                      />
                      {/* Seção de Anexos */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          Anexos
                        </h4>
                        
                        {/* Upload de Imagens */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-muted-foreground">Imagens</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = '.jpg,.jpeg,.png,.gif,.webp';
                                input.onchange = (e) => {
                                  const files = (e.target as HTMLInputElement).files;
                                  if (files) handleFileUpload(files, 'image');
                                };
                                input.click();
                              }}
                            >
                              <Image className="h-4 w-4 mr-1" />
                              Adicionar Imagens
                            </Button>
                          </div>
                          
                          {formData.imageAttachments.length > 0 && (
                            <div className="space-y-2">
                              {formData.imageAttachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-3 p-2 border rounded-md bg-muted/30">
                                  <Image className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAttachment(attachment.id, 'image')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Upload de Documentos */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-muted-foreground">Documentos</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
                                input.onchange = (e) => {
                                  const files = (e.target as HTMLInputElement).files;
                                  if (files) handleFileUpload(files, 'document');
                                };
                                input.click();
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Adicionar Documentos
                            </Button>
                          </div>
                          
                          {formData.documentAttachments.length > 0 && (
                            <div className="space-y-2">
                              {formData.documentAttachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-3 p-2 border rounded-md bg-muted/30">
                                  <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAttachment(attachment.id, 'document')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Progresso de Upload */}
                        {uploadProgress.map((upload) => (
                          <div key={upload.id} className="border rounded-md p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">{upload.fileName}</span>
                              <span className="text-xs text-muted-foreground">{upload.progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${upload.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {activeTab === "details" && (
              <Button
                variant="outline"
                onClick={() => setActiveTab("basic")}
                disabled={isSubmitting}
              >
                Voltar
              </Button>
            )}
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
          </div>
          
          <div className="flex gap-2">
            {activeTab === "basic" && (
              <Button 
                variant="outline"
                onClick={() => setActiveTab("details")}
                disabled={!isFormValid()}
              >
                Próximo: Detalhamento
              </Button>
            )}
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="gradient-construction border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Criando..." : "Cadastrar Atividade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};