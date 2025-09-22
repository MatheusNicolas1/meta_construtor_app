import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  User,
  Building2,
  FileText,
  Edit,
  Trash2,
  Users,
  Wrench,
  ClipboardList,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandable } from "@/hooks/use-expandable";
import { RDO } from "@/types/rdo";

interface RDOExpandableCardProps {
  rdo: RDO;
  onEdit: (rdo: RDO) => void;
  onDelete: (id: number) => void;
}

export function RDOExpandableCard({ rdo, onEdit, onDelete }: RDOExpandableCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-construction-green text-white";
      case "Em Andamento":
        return "bg-construction-orange text-white";
      case "Iniciada":
        return "bg-construction-blue text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Status N/A</Badge>;
    
    switch (status) {
      case "aprovado":
        return <Badge className="bg-construction-green text-white">Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="destructive">Rejeitado</Badge>;
      case "em_analise":
        return <Badge className="bg-construction-blue text-white">Em Análise</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  // Determine status based on activities completion
  const getOverallStatus = () => {
    if (rdo.atividadesRealizadas.length === 0) return "pendente";
    const completedActivities = rdo.atividadesRealizadas.filter(a => a.status === "Concluída").length;
    const totalActivities = rdo.atividadesRealizadas.length;
    
    if (completedActivities === totalActivities) return "aprovado";
    if (completedActivities > 0) return "em_analise";
    return "pendente";
  };

  return (
    <Card
      className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg bg-card border-border"
      onClick={toggleExpand}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-construction-orange flex-shrink-0" />
                <h3 className="text-lg font-semibold text-card-foreground truncate">
                  RDO #{rdo.id}
                </h3>
              </div>
              {getStatusBadge(getOverallStatus())}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formatDate(rdo.data)} - {rdo.periodo}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{rdo.obraNome}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {rdo.equipesPresentes.length > 0 ? rdo.equipesPresentes[0].nome : "Sem responsável"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row justify-end lg:flex-col lg:space-y-1 space-x-1 lg:space-x-0">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(rdo);
              }}
              className="h-8 px-3 touch-safe"
              title="Editar RDO"
            >
              <Edit className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline text-xs">Editar</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(rdo.id);
              }}
              className="h-8 px-3 touch-safe text-destructive hover:text-destructive"
              title="Excluir RDO"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline text-xs">Excluir</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <motion.div
        style={{ height: animatedHeight }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="overflow-hidden"
      >
        <div ref={contentRef}>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 pb-6"
              >
                <CardContent className="p-0 space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <div className="flex flex-col items-center mb-1">
                        <ClipboardList className="h-4 w-4 text-construction-blue mb-1" />
                        <span className="text-xs font-medium text-card-foreground">Atividades</span>
                      </div>
                      <p className="text-lg font-bold text-construction-blue">{rdo.atividadesRealizadas.length}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center mb-1">
                        <Users className="h-4 w-4 text-construction-green mb-1" />
                        <span className="text-xs font-medium text-card-foreground">Equipes</span>
                      </div>
                      <p className="text-lg font-bold text-construction-green">{rdo.equipesPresentes.length}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center mb-1">
                        <Wrench className="h-4 w-4 text-construction-orange mb-1" />
                        <span className="text-xs font-medium text-card-foreground">Equipamentos</span>
                      </div>
                      <p className="text-lg font-bold text-construction-orange">{rdo.equipamentosUtilizados.length}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center mb-1">
                        <span className="text-xs font-medium text-card-foreground">Clima</span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{rdo.clima}</p>
                    </div>
                  </div>

                  {/* Activities */}
                  {rdo.atividadesRealizadas.length > 0 && (
                    <div>
                      <h4 className="font-medium text-card-foreground mb-2">Atividades Realizadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {rdo.atividadesRealizadas.map((atividade, index) => (
                          <Badge key={index} className={getStatusColor(atividade.status)}>
                            {atividade.nome} - {atividade.quantidade}{atividade.unidadeMedida}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teams */}
                  {rdo.equipesPresentes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-card-foreground mb-2">Equipes Presentes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {rdo.equipesPresentes.map((equipe, index) => (
                          <Badge key={index} variant="outline">
                            {equipe.nome} ({equipe.horasTrabalho}h)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {rdo.equipamentosUtilizados.length > 0 && (
                    <div>
                      <h4 className="font-medium text-card-foreground mb-2">Equipamentos Utilizados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {rdo.equipamentosUtilizados.map((equipamento, index) => (
                          <Badge key={index} variant="secondary">
                            {equipamento.nome} ({equipamento.horasUso}h)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observations */}
                  {rdo.observacoes && (
                    <div>
                      <h4 className="font-medium text-card-foreground mb-2">Observações:</h4>
                      <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg text-sm">{rdo.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Card>
  );
}