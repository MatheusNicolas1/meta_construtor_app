import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Calendar,
  User,
  Download,
  Eye,
  Edit,
  Trash2,
  Building2,
  FileType,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandable } from "@/hooks/use-expandable";

interface Documento {
  id: number;
  nome: string;
  tipo: string;
  obra: string;
  arquivo: string;
  tamanho: string;
  dataUpload: string;
  autor: string;
  versao: string;
  status: string;
  descricao: string;
}

interface DocumentoExpandableCardProps {
  documento: Documento;
  onEdit: (documento: Documento) => void;
  onDelete: (id: number) => void;
  onDownload: (documento: Documento) => void;
  onView: (documento: Documento) => void;
}

export function DocumentoExpandableCard({ 
  documento, 
  onEdit, 
  onDelete, 
  onDownload, 
  onView 
}: DocumentoExpandableCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprovado":
      case "Válido":
      case "Atualizado":
        return "bg-construction-green text-white";
      case "Em Revisão":
        return "bg-construction-orange text-white";
      case "Em Elaboração":
        return "bg-construction-blue text-white";
      case "Vencido":
        return "bg-red-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Projeto":
        return "bg-construction-blue text-white";
      case "Licença":
        return "bg-construction-green text-white";
      case "Relatório":
        return "bg-construction-orange text-white";
      case "Memorial":
        return "bg-purple-500 text-white";
      case "Cronograma":
        return "bg-yellow-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card
      className="responsive-card w-full cursor-pointer bg-card border-border"
      onClick={toggleExpand}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-construction-orange flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-card-foreground truncate">
                  {documento.nome}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getTipoColor(documento.tipo)} variant="secondary">
                {documento.tipo}
              </Badge>
              <Badge className={getStatusColor(documento.status)}>
                {documento.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{documento.obra}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{documento.autor}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{formatDate(documento.dataUpload)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 overflow-x-auto pb-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onDownload(documento);
              }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Download"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onView(documento);
              }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Visualizar"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(documento);
              }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Editar"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(documento.id);
              }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Excluir"
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
                  {/* Document Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Versão</p>
                      <p className="text-sm text-construction-blue">{documento.versao}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Tamanho</p>
                      <p className="text-sm text-construction-green">{documento.tamanho}</p>
                    </div>
                  </div>

                  {/* File Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Informações do Arquivo:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileType className="mr-2 h-4 w-4" />
                        {documento.arquivo}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        Criado por: {documento.autor}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Upload em: {formatDate(documento.dataUpload)}
                      </div>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-card-foreground">Obra Vinculada:</h4>
                    <p className="text-sm text-construction-orange bg-muted/20 p-3 rounded-lg">
                      {documento.obra}
                    </p>
                  </div>

                  {/* Description */}
                  {documento.descricao && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-card-foreground">Descrição:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                        {documento.descricao}
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