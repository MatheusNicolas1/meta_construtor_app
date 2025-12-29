"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Calendar,
  User,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExpandable } from "@/hooks/use-expandable";

interface ChecklistItem {
  id: number;
  descricao: string;
  concluido: boolean;
  obrigatorio: boolean;
}

interface ChecklistExpandableCardProps {
  id: number;
  titulo: string;
  obra: string;
  categoria: string;
  itens: ChecklistItem[];
  dataInicio: string;
  dataConclusao: string | null;
  responsavel: string;
  status: string;
}

export function ChecklistExpandableCard({
  id,
  titulo,
  obra,
  categoria,
  itens,
  dataInicio,
  dataConclusao,
  responsavel,
  status,
}: ChecklistExpandableCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-construction-green/20 text-construction-green border border-construction-green/30";
      case "Em Andamento":
        return "bg-construction-orange/20 text-construction-orange border border-construction-orange/30";
      case "Pendente":
        return "bg-construction-blue/20 text-construction-blue border border-construction-blue/30";
      case "Rascunho":
        return "bg-secondary text-secondary-foreground";
      case "Cancelado":
        return "bg-destructive/20 text-destructive border border-destructive/30";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const calculateProgress = (itens: ChecklistItem[]) => {
    const concluidos = itens.filter(item => item.concluido).length;
    return Math.round((concluidos / itens.length) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const progress = calculateProgress(itens);
  const criticalPendingItems = itens.filter(item => item.obrigatorio && !item.concluido);

  return (
    <Card 
      className="w-full max-w-md cursor-pointer transition-all duration-300 hover:shadow-lg border-border/50" 
      onClick={toggleExpand}
    >
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start w-full">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={getStatusColor(status)}
            >
              {status}
            </Badge>
            <h3 className="text-xl font-semibold text-card-foreground">{titulo}</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <CheckSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Checklist {categoria}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Building2 className="h-4 w-4 mr-2" />
          <span>{obra}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span className="font-semibold text-construction-green">{progress}%</span>
            </div>
            <ProgressBar value={progress} className="h-2" />
          </div>

          {/* Critical Items Alert */}
          {criticalPendingItems.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-red-600">
                {criticalPendingItems.length} itens obrigatórios pendentes
              </span>
            </div>
          )}

          {/* Expandable Content */}
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
                    className="space-y-4 pt-2"
                  >
                    {/* Project Details */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Início: {formatDate(dataInicio)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <CheckSquare className="h-4 w-4 mr-1 text-construction-green" />
                          <span>{itens.filter(item => item.concluido).length}/{itens.length}</span>
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                          <span>{criticalPendingItems.length} críticos</span>
                        </div>
                      </div>
                    </div>

                    {/* Responsible */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Responsável
                      </h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${responsavel}&background=random`}
                            alt={responsavel}
                          />
                          <AvatarFallback className="text-xs">
                            {responsavel[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-card-foreground">{responsavel}</span>
                      </div>
                    </div>

                    {/* Category and Completion */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Categoria: {categoria}</span>
                        {dataConclusao && (
                          <span className="text-muted-foreground">
                            Concluído: {formatDate(dataConclusao)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Recent Items Preview */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Itens do Checklist</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {itens.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                item.concluido ? 'bg-construction-green' : 'bg-muted-foreground'
                              }`} />
                              <span className="text-muted-foreground truncate">{item.descricao}</span>
                              {item.obrigatorio && (
                                <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                                  Obrig.
                                </Badge>
                              )}
                            </div>
                            {item.concluido && (
                              <CheckCircle2 className="h-4 w-4 text-construction-green flex-shrink-0" />
                            )}
                          </div>
                        ))}
                        {itens.length > 5 && (
                          <div className="text-center text-sm text-muted-foreground py-1">
                            +{itens.length - 5} itens adicionais
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-2">
                      <Button 
                        className="w-full gradient-construction"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to checklist details
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ver Detalhes do Checklist
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <span>Última atualização: há 2 horas</span>
          <span>{criticalPendingItems.length} itens críticos</span>
        </div>
      </CardFooter>
    </Card>
  );
}