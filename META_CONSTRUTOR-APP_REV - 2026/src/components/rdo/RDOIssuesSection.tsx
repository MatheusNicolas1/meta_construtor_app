import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Wrench, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RDOFormData } from "@/schemas/rdoSchema";

interface RDOIssuesSectionProps {
  form: UseFormReturn<RDOFormData>;
}

const equipamentosDisponiveis = [
  { id: 1, nome: "Betoneira B-400", categoria: "Concreto" },
  { id: 2, nome: "Grua Torre GTR-50", categoria: "Elevação" },
  { id: 3, nome: "Compressor AR-200", categoria: "Pneumático" },
  { id: 4, nome: "Escavadeira CAT-320", categoria: "Terraplanagem" },
  { id: 5, nome: "Retroescavadeira JCB", categoria: "Terraplanagem" },
  { id: 6, nome: "Furadeira Industrial", categoria: "Perfuração" },
];

const tiposOcorrencia = [
  "Acidente de trabalho",
  "Queda de altura", 
  "Lesão por esforço repetitivo",
  "Queimadura",
  "Corte",
  "Problemas de segurança",
  "Conflito entre colaboradores",
  "Problema com fornecedor",
  "Atraso de material",
  "Condição climática adversa",
  "Outro"
];

export function RDOIssuesSection({ form }: RDOIssuesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    fields: issuesFields,
    append: appendIssue,
    remove: removeIssue,
  } = useFieldArray({
    control: form.control,
    name: "equipamentosQuebrados",
  });

  const adicionarProblema = () => {
    appendIssue({
      nome: "",
      categoria: "",
      descricaoProblema: "",
      causouOciosidade: false,
      horasParada: 0,
      impactoProducao: "",
      issueType: 'equipment',
      tipoOcorrencia: "",
      envolvidos: [],
      acoesTomadas: "",
    });
  };

  const atualizarIssue = (index: number, field: string, value: any) => {
    const currentIssues = form.getValues("equipamentosQuebrados");
    const updatedIssues = [...currentIssues];
    updatedIssues[index] = { ...updatedIssues[index], [field]: value };
    form.setValue("equipamentosQuebrados", updatedIssues);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card border-border border-destructive/20">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-lg text-card-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Problemas e Ocorrências
                {issuesFields.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {issuesFields.length}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isOpen ? "Recolher" : "Expandir"}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Registre problemas de equipamentos ou ocorrências/acidentes da obra
              </p>
              <Button onClick={adicionarProblema} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Problema/Ocorrência
              </Button>
            </div>

            {issuesFields.map((issue, index) => (
              <div key={issue.id} className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-card-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Registro #{index + 1}
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeIssue(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tipo de Issue */}
                <div>
                  <Label className="text-sm font-medium">Tipo de Registro *</Label>
                  <RadioGroup
                    value={issue.issueType}
                    onValueChange={(value) => atualizarIssue(index, 'issueType', value)}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="equipment" id={`equipment-${issue.id}`} />
                      <Label htmlFor={`equipment-${issue.id}`} className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Problema de Equipamento
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="occurrence" id={`occurrence-${issue.id}`} />
                      <Label htmlFor={`occurrence-${issue.id}`} className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Ocorrência/Acidente da Obra
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Campos para Problema de Equipamento */}
                {issue.issueType === 'equipment' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Nome do Equipamento *</Label>
                        <Select
                          value={issue.nome}
                          onValueChange={(value) => {
                            const equipamento = equipamentosDisponiveis.find(e => e.nome === value);
                            atualizarIssue(index, 'nome', value);
                            if (equipamento) {
                              atualizarIssue(index, 'categoria', equipamento.categoria);
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o equipamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipamentosDisponiveis.map((equipamento) => (
                              <SelectItem key={equipamento.id} value={equipamento.nome}>
                                {equipamento.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Categoria</Label>
                        <Input
                          value={issue.categoria}
                          className="mt-1"
                          readOnly
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Campos para Ocorrência */}
                {issue.issueType === 'occurrence' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Tipo de Ocorrência *</Label>
                        <Select
                          value={issue.tipoOcorrencia}
                          onValueChange={(value) => atualizarIssue(index, 'tipoOcorrencia', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposOcorrencia.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Envolvidos</Label>
                        <Input
                          placeholder="Nomes dos envolvidos (separados por vírgula)"
                          value={issue.envolvidos?.join(', ') || ''}
                          onChange={(e) => {
                            const envolvidos = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                            atualizarIssue(index, 'envolvidos', envolvidos);
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Descrição do Problema (comum) */}
                <div>
                  <Label className="text-sm">
                    {issue.issueType === 'equipment' ? 'Descrição do Problema *' : 'Descrição da Ocorrência *'}
                  </Label>
                  <Textarea
                    placeholder={issue.issueType === 'equipment' 
                      ? "Descreva o problema apresentado pelo equipamento..." 
                      : "Descreva a ocorrência ou acidente..."
                    }
                    value={issue.descricaoProblema}
                    onChange={(e) => atualizarIssue(index, 'descricaoProblema', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Ações Tomadas (apenas para ocorrências) */}
                {issue.issueType === 'occurrence' && (
                  <div>
                    <Label className="text-sm">Ações Tomadas</Label>
                    <Textarea
                      placeholder="Descreva as ações e providências tomadas..."
                      value={issue.acoesTomadas || ''}
                      onChange={(e) => atualizarIssue(index, 'acoesTomadas', e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                )}

                {/* Impacto e Ociosidade */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`causou-ociosidade-${issue.id}`}
                      checked={issue.causouOciosidade}
                      onCheckedChange={(checked) => 
                        atualizarIssue(index, 'causouOciosidade', checked === true)
                      }
                    />
                    <Label htmlFor={`causou-ociosidade-${issue.id}`} className="text-sm">
                      Causou ociosidade da equipe?
                    </Label>
                  </div>

                  {issue.causouOciosidade && (
                    <div className="flex-1">
                      <Label className="text-sm">Horas de Parada</Label>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={issue.horasParada || 0}
                        onChange={(e) => 
                          atualizarIssue(index, 'horasParada', parseFloat(e.target.value) || 0)
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Impacto na Produção */}
                <div>
                  <Label className="text-sm">Impacto na Produção</Label>
                  <Textarea
                    placeholder="Descreva o impacto na produção da obra..."
                    value={issue.impactoProducao}
                    onChange={(e) => atualizarIssue(index, 'impactoProducao', e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            ))}

            {issuesFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Nenhum problema ou ocorrência registrado</p>
                <p className="text-sm">Use o botão acima para registrar problemas de equipamentos ou ocorrências da obra</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}