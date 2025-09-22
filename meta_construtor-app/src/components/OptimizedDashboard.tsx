import React, { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Wrench, ClipboardList, FileText } from "lucide-react";
import { Link } from "react-router-dom";

// Componente otimizado para stats
const StatCard = memo(({ stat }: { stat: any }) => (
  <Card className="bg-card border-border responsive-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-card-foreground">
        {stat.title}
      </CardTitle>
      <stat.icon className={`h-4 w-4 ${stat.color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
      <p className="text-xs text-muted-foreground">{stat.description}</p>
    </CardContent>
  </Card>
));

StatCard.displayName = "StatCard";

const OptimizedDashboard = memo(() => {
  // Stats simplificados sem hooks complexos
  const stats = [
    {
      title: "Obras Ativas",
      value: "12",
      description: "+2 este mês",
      icon: Building2,
      color: "text-construction-orange",
    },
    {
      title: "Equipes Trabalhando",
      value: "45",
      description: "Distribuídas em 12 obras",
      icon: Users,
      color: "text-construction-green",
    },
    {
      title: "Equipamentos Ativos",
      value: "28",
      description: "3 em manutenção",
      icon: Wrench,
      color: "text-construction-blue",
    },
    {
      title: "Atividades Pendentes",
      value: "156",
      description: "23 vencendo hoje",
      icon: ClipboardList,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mobile-stack">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas obras e projetos</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Link to="/rdo" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground touch-safe">
              <FileText className="mr-2 h-4 w-4" />
              Novo RDO
            </Button>
          </Link>
          <Link to="/obras" className="w-full sm:w-auto">
            <Button className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto touch-safe">
              <Building2 className="mr-2 h-4 w-4" />
              Nova Obra
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards com renderização otimizada */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Seção de boas-vindas simplificada */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Bem-vindo ao Meta Construtor
          </CardTitle>
          <CardDescription>
            Gerencie suas obras e projetos de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use os botões acima para criar novas obras ou RDOs, ou navegue pelo menu lateral para acessar outras funcionalidades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedDashboard.displayName = "OptimizedDashboard";

export default OptimizedDashboard;