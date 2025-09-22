import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Building2,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandable } from "@/hooks/use-expandable";

interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  modelo: string;
  status: string;
  obra: string;
  localizacao: string;
  proximaManutencao: string;
  observacoes: string;
}

interface EquipamentoExpandableCardProps {
  equipamento: Equipamento;
  onEdit: (equipamento: Equipamento) => void;
  onDelete: (id: number) => void;
}

export function EquipamentoExpandableCard({ equipamento, onEdit, onDelete }: EquipamentoExpandableCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-construction-green text-white";
      case "Disponível":
        return "bg-construction-blue text-white";
      case "Manutenção":
        return "bg-construction-orange text-white";
      case "Inativo":
        return "bg-red-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card
      className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg bg-card border-border"
      onClick={toggleExpand}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex justify-between items-start w-full">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-construction-orange flex-shrink-0" />
                <h3 className="text-lg font-semibold text-card-foreground truncate">
                  {equipamento.nome}
                </h3>
              </div>
              <Badge className={getStatusColor(equipamento.status)}>
                {equipamento.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Settings className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{equipamento.categoria}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{equipamento.obra}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{equipamento.localizacao}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 ml-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(equipamento);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(equipamento.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3" />
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
                  {/* Equipment Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Categoria</p>
                      <p className="text-sm text-construction-blue">{equipamento.categoria}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Modelo</p>
                      <p className="text-sm text-construction-green">{equipamento.modelo}</p>
                    </div>
                  </div>

                  {/* Location and Maintenance */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Localização e Manutenção:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {equipamento.localizacao}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Próxima manutenção: {formatDate(equipamento.proximaManutencao)}
                      </div>
                    </div>
                  </div>

                  {/* Current Project */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-card-foreground">Obra Atual:</h4>
                    <p className="text-sm text-construction-orange bg-muted/20 p-3 rounded-lg">
                      {equipamento.obra}
                    </p>
                  </div>

                  {/* Observations */}
                  {equipamento.observacoes && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-card-foreground">Observações:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                        {equipamento.observacoes}
                      </p>
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