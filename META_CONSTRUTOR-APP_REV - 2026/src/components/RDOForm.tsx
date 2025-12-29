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
import { DatePicker } from "./DatePicker";
import { RDO, CreateRDOData, AtividadeRDO, EquipeRDO, EquipamentoRDO } from "@/types/rdo";
import { Plus, Trash2, Upload, FileText } from "lucide-react";

interface RDOFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRDOData) => void;
  rdo?: RDO;
  isEditing?: boolean;
}

export function RDOForm({ isOpen, onClose, onSubmit, rdo, isEditing = false }: RDOFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    rdo ? new Date(rdo.data) : new Date()
  );
  const [selectedObra, setSelectedObra] = useState<string>(
    rdo ? rdo.obraId.toString() : ""
  );
  const [observacoes, setObservacoes] = useState(rdo?.observacoes || "");
  const [atividades, setAtividades] = useState<AtividadeRDO[]>(rdo?.atividadesRealizadas || []);
  const [equipes, setEquipes] = useState<EquipeRDO[]>(rdo?.equipesPresentes || []);
  const [equipamentos, setEquipamentos] = useState<EquipamentoRDO[]>(rdo?.equipamentosUtilizados || []);

  // Mock data - in real app, these would be fetched based on selected obra
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

  const handleSubmit = () => {
    if (!selectedDate || !selectedObra) {
      alert("Por favor, preencha a data e selecione uma obra");
      return;
    }

    const data: CreateRDOData = {
      data: selectedDate.toISOString().split('T')[0],
      obraId: parseInt(selectedObra),
      periodo: 'Manhã',
      clima: 'Ensolarado',
      equipeOciosa: false,
      atividadesRealizadas: atividades.map(({ id, ...rest }) => rest),
      atividadesExtras: [],
      equipesPresentes: equipes.map(({ id, ...rest }) => rest),
      equipamentosUtilizados: equipamentos.map(({ id, ...rest }) => rest),
      equipamentosQuebrados: [],
      acidentes: [],
      materiaisFalta: [],
      estoqueMateriais: [],
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

  const removerAtividade = (index: number) => {
    setAtividades(atividades.filter((_, i) => i !== index));
  };

  const adicionarEquipe = (equipeId: string) => {
    const equipe = equipesDisponiveis.find(e => e.id.toString() === equipeId);
    if (equipe && !equipes.find(e => e.nome === equipe.nome)) {
      setEquipes([...equipes, {
        id: equipe.id,
        nome: equipe.nome,
        funcao: equipe.funcao,
        horasTrabalho: 8,
        presente: true
      }]);
    }
  };

  const removerEquipe = (index: number) => {
    setEquipes(equipes.filter((_, i) => i !== index));
  };

  const adicionarEquipamento = (equipamentoId: string) => {
    const equipamento = equipamentosDisponiveis.find(e => e.id.toString() === equipamentoId);
    if (equipamento && !equipamentos.find(e => e.nome === equipamento.nome)) {
      setEquipamentos([...equipamentos, {
        id: equipamento.id,
        nome: equipamento.nome,
        categoria: equipamento.categoria,
        horasUso: 8,
        status: 'Operacional'
      }]);
    }
  };

  const removerEquipamento = (index: number) => {
    setEquipamentos(equipamentos.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEditing ? "Editar RDO" : "Novo Relatório Diário de Obra (RDO)"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do relatório diário
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Data e Obra */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Relatório</Label>
              <DatePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder="Selecione a data"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Obra <span className="text-red-500">*</span></Label>
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

          {/* Atividades Realizadas */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Atividades Realizadas</CardTitle>
              <CardDescription>Selecione as atividades executadas no dia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select onValueChange={adicionarAtividade}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar atividade" />
                  </SelectTrigger>
                  <SelectContent>
                    {atividadesDisponiveis.map((atividade) => (
                      <SelectItem key={atividade.id} value={atividade.id.toString()}>
                        {atividade.nome} ({atividade.categoria})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {atividades.map((atividade, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{atividade.nome}</p>
                    <p className="text-sm text-muted-foreground">{atividade.categoria}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20"
                      value={atividade.quantidade}
                      onChange={(e) => {
                        const newAtividades = [...atividades];
                        newAtividades[index].quantidade = parseFloat(e.target.value) || 0;
                        setAtividades(newAtividades);
                      }}
                    />
                    <span className="text-sm text-muted-foreground">{atividade.unidadeMedida}</span>
                    <Select
                      value={atividade.status}
                      onValueChange={(value) => {
                        const newAtividades = [...atividades];
                        newAtividades[index].status = value as any;
                        setAtividades(newAtividades);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Iniciada">Iniciada</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem value="Concluída">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => removerAtividade(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Equipes Presentes */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Equipes Presentes</CardTitle>
              <CardDescription>Registre a presença das equipes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={adicionarEquipe}>
                <SelectTrigger>
                  <SelectValue placeholder="Adicionar membro da equipe" />
                </SelectTrigger>
                <SelectContent>
                  {equipesDisponiveis.map((equipe) => (
                    <SelectItem key={equipe.id} value={equipe.id.toString()}>
                      {equipe.nome} - {equipe.funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {equipes.map((equipe, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{equipe.nome}</p>
                    <p className="text-sm text-muted-foreground">{equipe.funcao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Horas:</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={equipe.horasTrabalho}
                      onChange={(e) => {
                        const newEquipes = [...equipes];
                        newEquipes[index].horasTrabalho = parseFloat(e.target.value) || 0;
                        setEquipes(newEquipes);
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => removerEquipe(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Equipamentos Utilizados */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Equipamentos Utilizados</CardTitle>
              <CardDescription>Registre os equipamentos em uso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={adicionarEquipamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Adicionar equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipamentosDisponiveis.map((equipamento) => (
                    <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                      {equipamento.nome} ({equipamento.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {equipamentos.map((equipamento, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{equipamento.nome}</p>
                    <p className="text-sm text-muted-foreground">{equipamento.categoria}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Horas:</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={equipamento.horasUso}
                      onChange={(e) => {
                        const newEquipamentos = [...equipamentos];
                        newEquipamentos[index].horasUso = parseFloat(e.target.value) || 0;
                        setEquipamentos(newEquipamentos);
                      }}
                    />
                    <Select
                      value={equipamento.status}
                      onValueChange={(value) => {
                        const newEquipamentos = [...equipamentos];
                        newEquipamentos[index].status = value as any;
                        setEquipamentos(newEquipamentos);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operacional">Operacional</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Parado">Parado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => removerEquipamento(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upload de Arquivos */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Anexos</CardTitle>
              <CardDescription>Faça upload de imagens e documentos relacionados ao RDO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Imagens da Obra</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-construction-orange/50 transition-colors">
                    <Upload className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Arraste imagens aqui</p>
                    <Button variant="outline" size="sm">
                      Selecionar Imagens
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Documentos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-construction-orange/50 transition-colors">
                    <FileText className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Arraste documentos aqui</p>
                    <Button variant="outline" size="sm">
                      Selecionar Documentos
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações Gerais</Label>
            <Textarea
              placeholder="Registre observações importantes do dia..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
            />
          </div>
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