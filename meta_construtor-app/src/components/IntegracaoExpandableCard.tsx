import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  ExternalLink,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpandable } from "@/hooks/use-expandable";

interface Integracao {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  icon: any;
  conectado: boolean;
  ultimaSync: string | null;
  configuracoes: any;
}

interface IntegracaoExpandableCardProps {
  integracao: Integracao;
  onConfigurar: (integracao: Integracao) => void;
  onConectar: (integracao: Integracao) => void;
  onDesconectar: (integracao: Integracao) => void;
}

export function IntegracaoExpandableCard({ 
  integracao, 
  onConfigurar, 
  onConectar, 
  onDesconectar 
}: IntegracaoExpandableCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const getStatusIcon = (conectado: boolean) => {
    return conectado ? CheckCircle : XCircle;
  };

  const getStatusColor = (conectado: boolean) => {
    return conectado ? "text-construction-green" : "text-destructive";
  };

  const getCategoriaColor = (categoria: string) => {
    return "border border-border text-muted-foreground";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const StatusIcon = getStatusIcon(integracao.conectado);

  return (
    <Card className="cursor-pointer transition-all duration-300 hover:shadow-md border-border/50" onClick={toggleExpand}>
      <CardContent className="p-4">
        {/* Header compacto com informações principais */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <integracao.icon className="h-4 w-4 text-construction-orange flex-shrink-0" />
              <h4 className="font-semibold text-sm text-card-foreground truncate">
                {integracao.nome}
              </h4>
              <Badge className={getCategoriaColor(integracao.categoria)} variant="secondary">
                {integracao.categoria}
              </Badge>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>Última sync: {formatDate(integracao.ultimaSync)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            {integracao.conectado ? (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigurar(integracao);
                }}
                className="h-7 w-7 p-0"
                title="Configurar"
              >
                <Settings className="h-3 w-3" />
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  onConectar(integracao);
                }}
                className="h-7 w-7 p-0"
                title="Conectar"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Status principal */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-3 w-3 ${getStatusColor(integracao.conectado)}`} />
            <span className="text-xs font-medium text-card-foreground">
              {integracao.conectado ? "Conectado" : "Desconectado"}
            </span>
          </div>
          {integracao.conectado && (
            <Badge variant="outline" className="text-xs h-5 px-2">
              Ativo
            </Badge>
          )}
        </div>

        {/* Descrição compacta */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {integracao.descricao}
        </p>

        {/* Conteúdo expandível otimizado */}
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
                  className="pt-3 border-t border-border/30 space-y-3"
                >
                  {/* Configurações ativas */}
                  {integracao.conectado && Object.keys(integracao.configuracoes).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-card-foreground">Configurações</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(integracao.configuracoes).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded">
                            <span className="text-muted-foreground capitalize truncate">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <Badge variant={value ? "default" : "secondary"} className="text-xs h-4 px-1">
                              {value ? "On" : "Off"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status de conexão */}
                  {!integracao.conectado && (
                    <div className="flex items-center space-x-2 p-2 border border-border rounded text-xs">
                      <AlertCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Disponível para conectar
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Botões de ação principal */}
        <div className="mt-4 pt-3 border-t border-border/30">
          {integracao.conectado ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigurar(integracao);
                }}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDesconectar(integracao);
                }}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Desconectar
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full h-8 text-xs gradient-construction border-0"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConectar(integracao);
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Conectar Integração
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}