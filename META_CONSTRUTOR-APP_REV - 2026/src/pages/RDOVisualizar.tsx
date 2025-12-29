import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Mail, Printer, Calendar, User, Building2, Clock, FileText } from "lucide-react";

const RDOVisualizar = () => {
  const { id } = useParams();

  // Mock data - em produção, seria buscado da API
  const rdoData = {
    id: id || "1",
    numeroRDO: "RDO-2024-001",
    obra: "Residencial Vista Verde",
    responsavel: "Eng. João Silva",
    data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "aprovado" as const,
    periodo: {
      inicio: "07:00",
      fim: "17:00",
      intervalos: "12:00 - 13:00"
    },
    clima: "Ensolarado",
    temperatura: "25°C",
    atividades: [
      { id: 1, descricao: "Concretagem da laje do 2º pavimento", equipe: "Equipe A", quantidade: "50m²", status: "Concluída" },
      { id: 2, descricao: "Instalação de armadura das vigas", equipe: "Equipe B", quantidade: "15 peças", status: "Concluída" },
      { id: 3, descricao: "Alvenaria de vedação", equipe: "Equipe C", quantidade: "25m²", status: "Em andamento" }
    ],
    equipamentos: [
      { id: 1, nome: "Betoneira 400L", horas: "8h", status: "Operando" },
      { id: 2, nome: "Grua Torre", horas: "8h", status: "Operando" }
    ],
    observacoes: "Obra em ritmo normal. Sem intercorrências relevantes.",
    aprovadoPor: "Eng. Carlos Manager",
    dataAprovacao: new Date()
  };

  const getStatusBadge = (status: "pendente" | "aprovado" | "rejeitado" | "em_analise") => {
    switch (status) {
      case "aprovado":
        return <Badge variant="default" className="bg-construction-green text-white">Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="destructive">Rejeitado</Badge>;
      case "em_analise":
        return <Badge variant="secondary" className="bg-construction-blue text-white">Em Análise</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Link to="/home">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center space-x-3">
              <FileText className="h-8 w-8 text-construction-orange" />
              <span>{rdoData.numeroRDO}</span>
              {getStatusBadge(rdoData.status)}
            </h1>
            <p className="text-muted-foreground">{rdoData.obra}</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Mail className="mr-2 h-4 w-4" />
            Enviar por Email
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
          <Button className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Informações Gerais */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Data</span>
              </div>
              <p className="font-medium text-card-foreground">{rdoData.data.toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Responsável</span>
              </div>
              <p className="font-medium text-card-foreground">{rdoData.responsavel}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Obra</span>
              </div>
              <p className="font-medium text-card-foreground">{rdoData.obra}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Período</span>
              </div>
              <p className="font-medium text-card-foreground">{rdoData.periodo.inicio} - {rdoData.periodo.fim}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Atividades Realizadas */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Atividades Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rdoData.atividades.map((atividade) => (
              <div key={atividade.id} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2 flex-1">
                  <p className="font-medium text-card-foreground">{atividade.descricao}</p>
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
                    <span>Equipe: {atividade.equipe}</span>
                    <span>Quantidade: {atividade.quantidade}</span>
                  </div>
                </div>
                <Badge variant={atividade.status === "Concluída" ? "default" : "secondary"} className={atividade.status === "Concluída" ? "bg-construction-green text-white" : ""}>
                  {atividade.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipamentos */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Equipamentos Utilizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {rdoData.equipamentos.map((equipamento) => (
              <div key={equipamento.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-card-foreground">{equipamento.nome}</p>
                  <p className="text-sm text-muted-foreground">Horas trabalhadas: {equipamento.horas}</p>
                </div>
                <Badge variant="outline" className="text-construction-green border-construction-green">
                  {equipamento.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-card-foreground">{rdoData.observacoes}</p>
          
          {rdoData.status === "aprovado" && (
            <div className="mt-6 p-4 bg-construction-green/10 border border-construction-green/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-construction-green">RDO Aprovado</p>
                  <p className="text-sm text-muted-foreground">
                    Aprovado por: {rdoData.aprovadoPor} em {rdoData.dataAprovacao.toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="default" className="bg-construction-green text-white">
                  Aprovado
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RDOVisualizar;