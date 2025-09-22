import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "./DatePicker";
import { 
  RDO, 
  CreateRDOData, 
  AtividadeRDO, 
  AtividadeExtraRDO,
  EquipeRDO, 
  EquipamentoRDO,
  EquipamentoQuebradoRDO,
  AcidenteRDO,
  MaterialFaltaRDO,
  EstoqueMaterialRDO
} from "@/types/rdo";
import { 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  Clock,
  Cloud,
  Users,
  Wrench,
  AlertTriangle,
  Package,
  Percent
} from "lucide-react";

interface RDOFormEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRDOData) => void;
  rdo?: RDO;
  isEditing?: boolean;
}

export function RDOFormEnhanced({ isOpen, onClose, onSubmit, rdo, isEditing = false }: RDOFormEnhancedProps) {
  // Estados básicos
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    rdo ? new Date(rdo.data) : new Date()
  );
  const [selectedObra, setSelectedObra] = useState<string>(
    rdo ? rdo.obraId.toString() : ""
  );
  const [periodo, setPeriodo] = useState<'Manhã' | 'Tarde' | 'Noite'>(rdo?.periodo || 'Manhã');
  const [clima, setClima] = useState(rdo?.clima || "");
  const [equipeOciosa, setEquipeOciosa] = useState(rdo?.equipeOciosa || false);
  const [tempoOcioso, setTempoOcioso] = useState(rdo?.tempoOcioso || 0);
  const [observacoes, setObservacoes] = useState(rdo?.observacoes || "");

  // Estados das seções
  const [atividades, setAtividades] = useState<AtividadeRDO[]>(rdo?.atividadesRealizadas || []);
  const [atividadesExtras, setAtividadesExtras] = useState<AtividadeExtraRDO[]>(rdo?.atividadesExtras || []);
  const [equipes, setEquipes] = useState<EquipeRDO[]>(rdo?.equipesPresentes || []);
  const [equipamentos, setEquipamentos] = useState<EquipamentoRDO[]>(rdo?.equipamentosUtilizados || []);
  const [equipamentosQuebrados, setEquipamentosQuebrados] = useState<EquipamentoQuebradoRDO[]>(rdo?.equipamentosQuebrados || []);
  const [acidentes, setAcidentes] = useState<AcidenteRDO[]>(rdo?.acidentes || []);
  const [materiaisFalta, setMateriaisFalta] = useState<MaterialFaltaRDO[]>(rdo?.materiaisFalta || []);
  const [estoqueMateriais, setEstoqueMateriais] = useState<EstoqueMaterialRDO[]>(rdo?.estoqueMateriais || []);

  // Mock data
  const obras = [
    { id: 1, nome: "Residencial Vista Verde" },
    { id: 2, nome: "Comercial Center Norte" },
    { id: 3, nome: "Ponte Rio Azul" },
    { id: 4, nome: "Hospital Regional Sul" }
  ];

  const atividadesDisponiveis = [
    { id: 1, nome: "Escavação de Fundação", categoria: "Terraplanagem", unidadeMedida: "m³" },
    { id: 2, nome: "Concretagem de Laje", categoria: "Estrutura", unidadeMedida: "m²" },
    { id: 3, nome: "Instalação Elétrica", categoria: "Instalações", unidadeMedida: "m" },
    { id: 4, nome: "Alvenaria de Vedação", categoria: "Alvenaria", unidadeMedida: "m²" }
  ];

  const equipesDisponiveis = [
    { id: 1, nome: "João Silva", funcao: "Engenheiro Civil" },
    { id: 2, nome: "Maria Santos", funcao: "Mestre de Obras" },
    { id: 3, nome: "Carlos Lima", funcao: "Eletricista" },
    { id: 4, nome: "Ana Costa", funcao: "Pedreiro" }
  ];

  const equipamentosDisponiveis = [
    { id: 1, nome: "Betoneira B-400", categoria: "Concreto" },
    { id: 2, nome: "Grua Torre GTR-50", categoria: "Elevação" },
    { id: 3, nome: "Compressor AR-200", categoria: "Pneumático" },
    { id: 4, nome: "Escavadeira CAT-320", categoria: "Terraplanagem" }
  ];

  const materiaisDisponiveis = [
    { nome: "Cimento CP II-Z-32", categoria: "Cimento", unidade: "sc 50kg" },
    { nome: "Areia Média", categoria: "Agregado", unidade: "m³" },
    { nome: "Brita 1", categoria: "Agregado", unidade: "m³" },
    { nome: "Aço CA-50 12mm", categoria: "Ferro", unidade: "kg" }
  ];

  const climasDisponiveis = ["Ensolarado", "Parcialmente Nublado", "Nublado", "Chuvoso", "Tempestade"];

  const handleSubmit = () => {
    if (!selectedDate || !selectedObra) {
      alert("Por favor, preencha a data e selecione uma obra");
      return;
    }

    const data: CreateRDOData = {
      data: selectedDate.toISOString().split('T')[0],
      obraId: parseInt(selectedObra),
      periodo,
      clima,
      equipeOciosa,
      tempoOcioso: equipeOciosa ? tempoOcioso : undefined,
      atividadesRealizadas: atividades.map(({ id, ...rest }) => rest),
      atividadesExtras: atividadesExtras.map(({ id, ...rest }) => rest),
      equipesPresentes: equipes.map(({ id, ...rest }) => rest),
      equipamentosUtilizados: equipamentos.map(({ id, ...rest }) => rest),
      equipamentosQuebrados: equipamentosQuebrados.map(({ id, ...rest }) => rest),
      acidentes: acidentes.map(({ id, ...rest }) => rest),
      materiaisFalta: materiaisFalta.map(({ id, ...rest }) => rest),
      estoqueMateriais: estoqueMateriais.map(({ id, ...rest }) => rest),
      observacoes
    };

    onSubmit(data);
    onClose();
  };

  const adicionarAtividade = (atividadeId: string) => {
    const atividade = atividadesDisponiveis.find(a => a.id.toString() === atividadeId);
    if (atividade && !atividades.find(a => a.nome === atividade.nome)) {
      setAtividades([...atividades, {
        id: atividade.id,
        nome: atividade.nome,
        categoria: atividade.categoria,
        quantidade: 1,
        unidadeMedida: atividade.unidadeMedida,
        percentualConcluido: 0,
        status: 'Iniciada'
      }]);
    }
  };

  const adicionarAtividadeExtra = () => {
    const novaAtividade: AtividadeExtraRDO = {
      id: Date.now(),
      nome: "",
      descricao: "",
      categoria: "",
      quantidade: 1,
      unidadeMedida: "",
      percentualConcluido: 0,
      justificativa: ""
    };
    setAtividadesExtras([...atividadesExtras, novaAtividade]);
  };

  const adicionarEquipamentoQuebrado = () => {
    const novoEquipamento: EquipamentoQuebradoRDO = {
      id: Date.now(),
      nome: "",
      categoria: "",
      descricaoProblema: "",
      causouOciosidade: false,
      horasParada: 0,
      impactoProducao: ""
    };
    setEquipamentosQuebrados([...equipamentosQuebrados, novoEquipamento]);
  };

  const adicionarAcidente = () => {
    const novoAcidente: AcidenteRDO = {
      id: Date.now(),
      descricao: "",
      gravidade: 'Leve',
      colaboradoresEnvolvidos: [],
      horaOcorrencia: "",
      providenciasTomadas: "",
      precisouPararObra: false
    };
    setAcidentes([...acidentes, novoAcidente]);
  };

  const adicionarMaterialFalta = () => {
    const novoMaterial: MaterialFaltaRDO = {
      id: Date.now(),
      nome: "",
      categoria: "",
      quantidadeNecessaria: 1,
      unidadeMedida: "",
      impactoProducao: 'Baixo',
      prazoEntregaPrevisto: ""
    };
    setMateriaisFalta([...materiaisFalta, novoMaterial]);
  };

  const adicionarEstoqueMaterial = () => {
    const novoEstoque: EstoqueMaterialRDO = {
      id: Date.now(),
      nome: "",
      categoria: "",
      quantidadeAtual: 0,
      quantidadeMinima: 1,
      unidadeMedida: "",
      alertaEstoqueMinimo: false
    };
    setEstoqueMateriais([...estoqueMateriais, novoEstoque]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEditing ? "Editar RDO" : "Novo Relatório Diário de Obra (RDO)"}
          </DialogTitle>
          <DialogDescription>
            Preencha todas as informações do relatório diário de obra
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 1. Informações do Relatório */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Informações do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data do Relatório <span className="text-destructive">*</span></Label>
                  <DatePicker
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    placeholder="Selecione a data"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Obra <span className="text-destructive">*</span></Label>
                  <Select value={selectedObra} onValueChange={setSelectedObra}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id.toString()}>
                          {obra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Período de Trabalho e Clima */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Período de Trabalho e Condições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Período <span className="text-destructive">*</span></Label>
                  <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Clima <span className="text-destructive">*</span></Label>
                  <Select value={clima} onValueChange={setClima}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o clima" />
                    </SelectTrigger>
                    <SelectContent>
                      {climasDisponiveis.map((climaOption) => (
                        <SelectItem key={climaOption} value={climaOption}>
                          {climaOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="equipe-ociosa"
                      checked={equipeOciosa}
                      onCheckedChange={(checked) => setEquipeOciosa(checked === true)}
                    />
                    <Label htmlFor="equipe-ociosa">Equipe ficou ociosa?</Label>
                  </div>
                  {equipeOciosa && (
                    <div className="mt-2">
                      <Label className="text-sm">Tempo ocioso (horas)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={tempoOcioso}
                        onChange={(e) => setTempoOcioso(parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Atividades Realizadas */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center">
                <Percent className="mr-2 h-5 w-5" />
                Atividades Realizadas
              </CardTitle>
              <CardDescription>Atividades previstas no cronograma da obra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={adicionarAtividade}>
                <SelectTrigger>
                  <SelectValue placeholder="Adicionar atividade prevista" />
                </SelectTrigger>
                <SelectContent>
                  {atividadesDisponiveis.map((atividade) => (
                    <SelectItem key={atividade.id} value={atividade.id.toString()}>
                      {atividade.nome} ({atividade.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {atividades.map((atividade, index) => (
                <div key={index} className="p-4 bg-card rounded-lg border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">{atividade.nome}</p>
                      <p className="text-sm text-muted-foreground">{atividade.categoria}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAtividades(atividades.filter((_, i) => i !== index))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-sm">Quantidade</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          value={atividade.quantidade}
                          onChange={(e) => {
                            const newAtividades = [...atividades];
                            newAtividades[index].quantidade = parseFloat(e.target.value) || 0;
                            setAtividades(newAtividades);
                          }}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{atividade.unidadeMedida}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Status</Label>
                      <Select
                        value={atividade.status}
                        onValueChange={(value) => {
                          const newAtividades = [...atividades];
                          newAtividades[index].status = value as any;
                          setAtividades(newAtividades);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Iniciada">Iniciada</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Concluída">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label className="text-sm">Percentual Concluído: {atividade.percentualConcluido}%</Label>
                      <Slider
                        value={[atividade.percentualConcluido]}
                        onValueChange={(value) => {
                          const newAtividades = [...atividades];
                          newAtividades[index].percentualConcluido = value[0];
                          setAtividades(newAtividades);
                        }}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 4. Atividades Extras */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Atividades Extras
              </CardTitle>
              <CardDescription>Atividades não previstas realizadas no dia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={adicionarAtividadeExtra} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Atividade Extra
              </Button>
              
              {atividadesExtras.map((atividade, index) => (
                <div key={index} className="p-4 bg-card rounded-lg border space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Nome da Atividade</Label>
                      <Input
                        value={atividade.nome}
                        onChange={(e) => {
                          const newAtividades = [...atividadesExtras];
                          newAtividades[index].nome = e.target.value;
                          setAtividadesExtras(newAtividades);
                        }}
                        placeholder="Ex: Limpeza adicional"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Categoria</Label>
                      <Input
                        value={atividade.categoria}
                        onChange={(e) => {
                          const newAtividades = [...atividadesExtras];
                          newAtividades[index].categoria = e.target.value;
                          setAtividadesExtras(newAtividades);
                        }}
                        placeholder="Ex: Limpeza"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Descrição</Label>
                    <Textarea
                      value={atividade.descricao}
                      onChange={(e) => {
                        const newAtividades = [...atividadesExtras];
                        newAtividades[index].descricao = e.target.value;
                        setAtividadesExtras(newAtividades);
                      }}
                      placeholder="Descreva a atividade realizada..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm">Quantidade</Label>
                      <Input
                        type="number"
                        min="0"
                        value={atividade.quantidade}
                        onChange={(e) => {
                          const newAtividades = [...atividadesExtras];
                          newAtividades[index].quantidade = parseFloat(e.target.value) || 0;
                          setAtividadesExtras(newAtividades);
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Unidade</Label>
                      <Input
                        value={atividade.unidadeMedida}
                        onChange={(e) => {
                          const newAtividades = [...atividadesExtras];
                          newAtividades[index].unidadeMedida = e.target.value;
                          setAtividadesExtras(newAtividades);
                        }}
                        placeholder="m², m³, kg, etc."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Percentual: {atividade.percentualConcluido}%</Label>
                      <Slider
                        value={[atividade.percentualConcluido]}
                        onValueChange={(value) => {
                          const newAtividades = [...atividadesExtras];
                          newAtividades[index].percentualConcluido = value[0];
                          setAtividadesExtras(newAtividades);
                        }}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex-1 mr-4">
                      <Label className="text-sm">Justificativa</Label>
                      <Textarea
                        value={atividade.justificativa}
                        onChange={(e) => {
                          const newAtividades = [...atividadesExtras];
                          newAtividades[index].justificativa = e.target.value;
                          setAtividadesExtras(newAtividades);
                        }}
                        placeholder="Por que esta atividade foi necessária?"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAtividadesExtras(atividadesExtras.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Continue with more sections... */}
          {/* Para manter o tamanho gerenciável, vou criar o resto do formulário em uma segunda parte */}
          
          {/* Observações Gerais */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Registre observações importantes do dia..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="gradient-construction border-0" onClick={handleSubmit}>
            {isEditing ? "Atualizar RDO" : "Salvar RDO"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}