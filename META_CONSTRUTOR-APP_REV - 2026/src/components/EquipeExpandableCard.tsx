import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Phone,
  Mail,
  Edit,
  Trash2,
  Building2,
  User,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandable } from "@/hooks/use-expandable";

interface Membro {
  id: number | string;
  nome: string;
  funcao: string;
  equipe: string;
  obra: string;
  telefone: string;
  email: string;
  status: string;
}

interface EquipeExpandableCardProps {
  membro: Membro;
  onEdit: (membro: Membro) => void;
  onDelete: (id: number | string) => void;
}

export function EquipeExpandableCard({ membro, onEdit, onDelete }: EquipeExpandableCardProps) {
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
      case "Férias":
        return "bg-construction-blue text-white";
      case "Licença":
        return "bg-yellow-500 text-white";
      case "Inativo":
        return "bg-red-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
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
                <User className="h-4 w-4 text-construction-orange flex-shrink-0" />
                <h3 className="text-lg font-semibold text-card-foreground truncate">
                  {membro.nome}
                </h3>
              </div>
              <Badge className={getStatusColor(membro.status)}>
                {membro.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{membro.funcao}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{membro.equipe}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{membro.obra}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 ml-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(membro);
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
                onDelete(membro.id);
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
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Informações de Contato:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {membro.telefone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        {membro.email}
                      </div>
                    </div>
                  </div>

                  {/* Work Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Detalhes do Trabalho:</h4>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">Função</p>
                        <p className="text-sm text-construction-blue">{membro.funcao}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">Equipe</p>
                        <p className="text-sm text-construction-green">{membro.equipe}</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Project */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-card-foreground">Obra Atual:</h4>
                    <p className="text-sm text-construction-orange bg-muted/20 p-3 rounded-lg">
                      {membro.obra}
                    </p>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Card>
  );
}