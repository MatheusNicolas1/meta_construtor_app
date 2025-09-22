import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Building2, MapPin, User, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useExpandable } from "@/hooks/use-expandable";
import { useRef, useEffect } from "react";

interface Obra {
  id: number;
  nome: string;
  progresso: number;
  prazo: string;
  status: string;
  responsavel: string;
  localizacao: string;
  equipe: string[];
  materiaisPrincipais: string[];
  orcamento: number;
  proximaEtapa: string;
  dataInicio: string;
  atividades: number;
}

interface ObraCardProps {
  obra: Obra;
}

const mockObras: Obra[] = [
  {
    id: 1,
    nome: "Residencial Vista Verde",
    progresso: 75,
    prazo: "2024-03-15",
    status: "Em andamento",
    responsavel: "Eng. João Silva",
    localizacao: "Zona Sul - SP",
    equipe: ["João Silva", "Maria Costa", "Pedro Santos"],
    materiaisPrincipais: ["Concreto", "Aço", "Alvenaria"],
    orcamento: 2500000,
    proximaEtapa: "Instalações elétricas",
    dataInicio: "2023-08-15",
    atividades: 45
  },
  {
    id: 2,
    nome: "Comercial Center Norte",
    progresso: 45,
    prazo: "2024-05-20",
    status: "Em andamento",
    responsavel: "Eng. Maria Santos",
    localizacao: "Zona Norte - SP",
    equipe: ["Maria Santos", "Carlos Lima", "Ana Silva"],
    materiaisPrincipais: ["Estrutura metálica", "Vidro", "Revestimento"],
    orcamento: 4200000,
    proximaEtapa: "Cobertura metálica",
    dataInicio: "2023-10-01",
    atividades: 68
  },
  {
    id: 3,
    nome: "Ponte Rio Azul",
    progresso: 90,
    prazo: "2024-02-28",
    status: "Finalizando",
    responsavel: "Eng. Carlos Lima",
    localizacao: "Interior - SP",
    equipe: ["Carlos Lima", "Roberto Silva", "Luis Costa"],
    materiaisPrincipais: ["Concreto armado", "Aço estrutural"],
    orcamento: 1800000,
    proximaEtapa: "Acabamento final",
    dataInicio: "2023-06-01",
    atividades: 123
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

function ObraCard({ obra }: ObraCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em andamento":
        return <Badge variant="default" className="bg-construction-orange text-white">Em andamento</Badge>;
      case "Finalizando":
        return <Badge variant="default" className="bg-construction-green text-white">Finalizando</Badge>;
      case "Iniciando":
        return <Badge variant="secondary" className="bg-construction-blue text-white">Iniciando</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <Card className="cursor-pointer transition-all duration-300 hover:shadow-md border-border/50" onClick={toggleExpand}>
      <CardContent className="p-4">
        {/* Header compacto com informações principais */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-card-foreground truncate">
                {obra.nome}
              </h4>
              {getStatusBadge(obra.status)}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            <Link to={`/obras/${obra.id}`} onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Building2 className="h-3 w-3" />
              </Button>
            </Link>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Localização e responsável na mesma linha */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{obra.localizacao}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
            <span className="truncate">{obra.responsavel}</span>
          </div>
        </div>

        {/* Datas abaixo da localização */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
            <span className="truncate">Início: {formatDate(obra.dataInicio)}</span>
          </div>
          <span className="text-muted-foreground truncate">Término: {formatDate(obra.prazo)}</span>
        </div>

        {/* Progresso com quantidade de atividades */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="text-muted-foreground">• {obra.atividades} atividades</span>
            </div>
            <span className="font-semibold text-construction-green">{obra.progresso}%</span>
          </div>
          <ProgressBar value={obra.progresso} className="h-2" />
        </div>

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
                  {/* Informações financeiras e detalhadas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-card-foreground">Orçamento</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {formatCurrency(obra.orcamento)}
                      </Badge>
                    </div>
                  </div>

                  {/* Próxima etapa */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-card-foreground">Próxima Etapa</span>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2 rounded">
                      {obra.proximaEtapa}
                    </p>
                  </div>

                  {/* Equipe */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-card-foreground">Equipe</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {obra.equipe.length} membros
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {obra.equipe.map((membro, index) => (
                        <Badge key={index} variant="secondary" className="text-xs h-5 px-2">
                          {membro}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Materiais principais */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-card-foreground">Materiais Principais</span>
                    <div className="flex flex-wrap gap-1">
                      {obra.materiaisPrincipais.map((material, index) => (
                        <Badge key={index} variant="outline" className="text-xs h-5 px-2">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Botão de ação principal */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <Link to={`/obras/${obra.id}`} onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="w-full h-8 text-xs font-medium">
              Visualizar Obra Completa
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentObras() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Obras Recentes
        </CardTitle>
        <CardDescription>Suas obras mais atualizadas - Clique para expandir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {mockObras.slice(0, 3).map((obra) => (
            <ObraCard key={obra.id} obra={obra} />
          ))}
        </div>
        
        <Link to="/obras">
          <Button variant="outline" className="w-full mt-4">
            Ver Todas as Obras
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}