import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { Badge } from "@/components/ui/badge";
import { RDOReportSection } from "@/components/reports/RDOReportSection";
import { RDO } from "@/types/rdo";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Building2, 
  Users, 
  Wrench, 
  ClipboardList,
  Download,
  FileText,
  PieChart,
  Activity
} from "lucide-react";

const Relatorios = () => {
  const [selectedObra, setSelectedObra] = useState("all");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();

  // Mock RDO data - in real app, this would be fetched from backend
  const rdoData: RDO[] = [
    {
      id: 1,
      data: "2024-01-15",
      obraId: 1,
      obraNome: "Residencial Vista Verde",
      status: 'Aprovado' as const,
      criadoPorId: 'user-1',
      criadoPorNome: 'João Silva',
      aprovadoPorId: 'user-manager',
      aprovadoPorNome: 'Carlos Santos',
      dataAprovacao: '2024-01-15T18:00:00Z',
      periodo: 'Manhã',
      clima: "Ensolarado",
      equipeOciosa: false,
      atividadesRealizadas: [
        {
          id: 1,
          nome: "Concretagem de Laje",
          categoria: "Estrutura",
          quantidade: 120,
          unidadeMedida: "m²",
          percentualConcluido: 100,
          status: "Concluída"
        },
        {
          id: 2,
          nome: "Instalação Elétrica",
          categoria: "Instalações",
          quantidade: 50,
          unidadeMedida: "m",
          percentualConcluido: 60,
          status: "Em Andamento"
        }
      ],
      atividadesExtras: [
        {
          id: 1,
          nome: "Reparo Emergencial",
          descricao: "Reparo de vazamento",
          categoria: "Manutenção",
          quantidade: 1,
          unidadeMedida: "un",
          percentualConcluido: 100,
          justificativa: "Vazamento imprevisto no sistema hidráulico"
        }
      ],
      equipesPresentes: [
        {
          id: 1,
          nome: "João Silva",
          funcao: "Engenheiro Civil",
          horasTrabalho: 8,
          presente: true
        },
        {
          id: 2,
          nome: "Maria Santos",
          funcao: "Mestre de Obras",
          horasTrabalho: 8,
          presente: true
        }
      ],
      equipamentosUtilizados: [
        {
          id: 1,
          nome: "Betoneira B-400",
          categoria: "Concreto",
          horasUso: 6,
          status: "Operacional"
        }
      ],
      equipamentosQuebrados: [
        {
          id: 1,
          nome: "Furadeira Industrial",
          categoria: "Ferramentas",
          descricaoProblema: "Motor queimado",
          causouOciosidade: true,
          horasParada: 2,
          impactoProducao: "Baixo"
        }
      ],
      acidentes: [],
      materiaisFalta: [
        {
          id: 1,
          nome: "Cimento Portland",
          categoria: "Básicos",
          quantidadeNecessaria: 50,
          unidadeMedida: "sacos",
          impactoProducao: "Alto",
          prazoEntregaPrevisto: "2024-01-16"
        }
      ],
      estoqueMateriais: [
        {
          id: 1,
          nome: "Areia Fina",
          categoria: "Agregados",
          quantidadeAtual: 5,
          quantidadeMinima: 10,
          unidadeMedida: "m³",
          alertaEstoqueMinimo: true
        }
      ],
      observacoes: "Dia produtivo. Concretagem realizada sem intercorrências. Tempo bom para trabalho.",
      imagens: [
        {
          id: 1,
          nome: "laje_concretada.jpg",
          url: "/images/laje_concretada.jpg",
          descricao: "Laje após concretagem",
          timestamp: "2024-01-15T14:30:00Z"
        }
      ],
      documentos: [
        {
          id: 1,
          nome: "controle_concreto.pdf",
          tipo: "PDF",
          url: "/docs/controle_concreto.pdf",
          descricao: "Controle tecnológico do concreto",
          timestamp: "2024-01-15T15:00:00Z"
        }
      ],
      criadoEm: "2024-01-15T08:00:00Z",
      atualizadoEm: "2024-01-15T17:30:00Z"
    },
    // Additional mock data can be added here
  ];

  const obras = [
    { id: 1, nome: "Residencial Vista Verde" },
    { id: 2, nome: "Comercial Center Norte" },
    { id: 3, nome: "Ponte Rio Azul" },
    { id: 4, nome: "Hospital Regional Sul" }
  ];

  const periodos = [
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "90d", label: "Últimos 3 meses" },
    { value: "custom", label: "Período personalizado" }
  ];

  const relatoriosDisponiveis = [
    {
      id: 1,
      titulo: "Relatório de Progresso por Obra",
      descricao: "Acompanhe o progresso físico e financeiro das obras",
      categoria: "Obras",
      icon: Building2,
      color: "text-construction-blue"
    },
    {
      id: 2,
      titulo: "Relatório de Produtividade de Equipes",
      descricao: "Análise de performance das equipes por período",
      categoria: "Equipes",
      icon: Users,
      color: "text-construction-green"
    },
    {
      id: 3,
      titulo: "Relatório de Utilização de Equipamentos",
      descricao: "Controle de uso e disponibilidade dos equipamentos",
      categoria: "Equipamentos",
      icon: Wrench,
      color: "text-construction-orange"
    },
    {
      id: 4,
      titulo: "Relatório Financeiro Consolidado",
      descricao: "Análise financeira completa de custos e receitas",
      categoria: "Financeiro",
      icon: DollarSign,
      color: "text-yellow-500"
    },
    {
      id: 5,
      titulo: "Relatório de Atividades (RDO)",
      descricao: "Consolidação dos relatórios diários de obra",
      categoria: "Atividades",
      icon: ClipboardList,
      color: "text-purple-500"
    },
    {
      id: 6,
      titulo: "Relatório de Cronograma vs Realizado",
      descricao: "Comparativo entre planejado e executado",
      categoria: "Cronograma",
      icon: Calendar,
      color: "text-red-500"
    }
  ];

  const metricas = [
    {
      titulo: "Total de Obras",
      valor: "12",
      variacao: "+2",
      percentual: 20,
      tipo: "positivo",
      icon: Building2
    },
    {
      titulo: "Progresso Médio",
      valor: "68%",
      variacao: "+5%",
      percentual: 5,
      tipo: "positivo",
      icon: TrendingUp
    },
    {
      titulo: "Orçamento Utilizado",
      valor: "R$ 15.2M",
      variacao: "+12%",
      percentual: 12,
      tipo: "neutro",
      icon: DollarSign
    },
    {
      titulo: "Prazo Médio Restante",
      valor: "4.2 meses",
      variacao: "-0.3m",
      percentual: -8,
      tipo: "positivo",
      icon: Calendar
    }
  ];

  const getVariacaoColor = (tipo: string) => {
    switch (tipo) {
      case "positivo":
        return "text-construction-green";
      case "negativo":
        return "text-red-500";
      default:
        return "text-construction-orange";
    }
  };

  const getVariacaoIcon = (tipo: string) => {
    switch (tipo) {
      case "positivo":
        return TrendingUp;
      case "negativo":
        return TrendingDown;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Central de Relatórios</h1>
          <p className="text-muted-foreground">Análises e insights das suas obras e operações</p>
        </div>
        <Button className="gradient-construction border-0 hover:opacity-90">
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Filtros de Relatório</CardTitle>
          <CardDescription>Configure os parâmetros para gerar relatórios personalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Obra</label>
              <Select value={selectedObra} onValueChange={setSelectedObra}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as obras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as obras</SelectItem>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id.toString()}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Período</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((periodo) => (
                    <SelectItem key={periodo.value} value={periodo.value}>
                      {periodo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPeriodo === "custom" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Data Início</label>
                  <DatePicker
                    date={dataInicio}
                    onDateChange={setDataInicio}
                    placeholder="Data início"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Data Fim</label>
                  <DatePicker
                    date={dataFim}
                    onDateChange={setDataFim}
                    placeholder="Data fim"
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricas.map((metrica, index) => {
          const VariacaoIcon = getVariacaoIcon(metrica.tipo);
          return (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {metrica.titulo}
                </CardTitle>
                <metrica.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{metrica.valor}</div>
                <div className={`flex items-center text-xs ${getVariacaoColor(metrica.tipo)}`}>
                  <VariacaoIcon className="h-3 w-3 mr-1" />
                  {metrica.variacao} este mês
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-construction-blue" />
              Progresso das Obras
            </CardTitle>
            <CardDescription>Acompanhamento do progresso físico por obra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {obras.map((obra, index) => {
                const progresso = [75, 45, 90, 25][index];
                return (
                  <div key={obra.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-card-foreground">{obra.nome}</span>
                      <span className="font-medium text-construction-green">{progresso}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-construction-green h-2 rounded-full transition-all" 
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-construction-orange" />
              Distribuição de Recursos
            </CardTitle>
            <CardDescription>Alocação de equipes e equipamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-construction-blue/10 rounded-lg">
                  <Users className="h-8 w-8 text-construction-blue mx-auto mb-2" />
                  <p className="text-2xl font-bold text-card-foreground">45</p>
                  <p className="text-sm text-muted-foreground">Colaboradores</p>
                </div>
                <div className="text-center p-4 bg-construction-orange/10 rounded-lg">
                  <Wrench className="h-8 w-8 text-construction-orange mx-auto mb-2" />
                  <p className="text-2xl font-bold text-card-foreground">28</p>
                  <p className="text-sm text-muted-foreground">Equipamentos</p>
                </div>
              </div>
              <div className="text-center p-4 bg-construction-green/10 rounded-lg">
                <Building2 className="h-8 w-8 text-construction-green mx-auto mb-2" />
                <p className="text-2xl font-bold text-card-foreground">12</p>
                <p className="text-sm text-muted-foreground">Obras Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RDO Integration Section */}
      <RDOReportSection 
        rdos={rdoData}
        selectedObra={selectedObra}
        dateRange={dataInicio && dataFim ? { start: dataInicio, end: dataFim } : undefined}
      />

      {/* Available Reports */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Relatórios Disponíveis</CardTitle>
          <CardDescription>Selecione o tipo de relatório que deseja gerar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatoriosDisponiveis.map((relatorio) => (
              <Card key={relatorio.id} className="bg-muted/20 border-border hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <relatorio.icon className={`h-5 w-5 ${relatorio.color}`} />
                        <CardTitle className="text-base text-card-foreground">
                          {relatorio.titulo}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {relatorio.categoria}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {relatorio.descricao}
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-1" />
                      Gerar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;