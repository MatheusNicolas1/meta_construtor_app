import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Building2,
  Star,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandable } from "@/hooks/use-expandable";

interface Fornecedor {
  id: number | string;
  nome: string;
  categoria: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  contato: string;
  status: string;
  avaliacao: number;
  observacoes: string;
  ultimoPedido: string | null;
  totalPedidos: number;
}

interface FornecedorExpandableCardProps {
  fornecedor: Fornecedor;
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (id: number | string) => void;
}

export function FornecedorExpandableCard({ fornecedor, onEdit, onDelete }: FornecedorExpandableCardProps) {
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
      case "Inativo":
        return "bg-red-500 text-white";
      case "Pendente":
        return "bg-construction-orange text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = [
      "bg-construction-blue text-white",
      "bg-construction-orange text-white",
      "bg-construction-green text-white",
      "bg-purple-500 text-white",
      "bg-yellow-500 text-white"
    ];
    return colors[categoria.length % colors.length];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <Card
      className="responsive-card w-full cursor-pointer bg-card border-border"
      onClick={toggleExpand}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 w-full">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Truck className="h-5 w-5 text-construction-orange flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-card-foreground truncate">
                  {fornecedor.nome}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getCategoriaColor(fornecedor.categoria)} variant="secondary">
                {fornecedor.categoria}
              </Badge>
              <Badge className={getStatusColor(fornecedor.status)}>
                {fornecedor.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{fornecedor.telefone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{fornecedor.contato}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1">
                  {renderStars(fornecedor.avaliacao).slice(0, 1)}
                  <span className="text-xs">{fornecedor.avaliacao.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 sm:flex-col sm:items-end">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(fornecedor);
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
                onDelete(fornecedor.id);
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
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Informações de Contato:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {fornecedor.telefone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        {fornecedor.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {fornecedor.endereco}
                      </div>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Dados da Empresa:</h4>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">CNPJ</p>
                        <p className="text-sm text-construction-blue">{fornecedor.cnpj}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">Contato</p>
                        <p className="text-sm text-construction-green">{fornecedor.contato}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-card-foreground">Avaliação:</h4>
                    <div className="flex items-center space-x-2 bg-muted/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-1">
                        {renderStars(fornecedor.avaliacao)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {fornecedor.avaliacao.toFixed(1)} de 5
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <ShoppingCart className="h-4 w-4 text-construction-blue mr-1" />
                        <span className="text-sm font-medium text-card-foreground">Pedidos</span>
                      </div>
                      <p className="text-lg font-bold text-construction-blue">{fornecedor.totalPedidos}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-construction-green mr-1" />
                        <span className="text-sm font-medium text-card-foreground">Último Pedido</span>
                      </div>
                      <p className="text-sm font-medium text-construction-green">{formatDate(fornecedor.ultimoPedido)}</p>
                    </div>
                  </div>

                  {/* Observations */}
                  {fornecedor.observacoes && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-card-foreground">Observações:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                        {fornecedor.observacoes}
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