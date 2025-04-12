
import { useState } from "react";
import { 
  Download, 
  Filter, 
  RefreshCw,
  Clock,
  TrendingUp,
  CloudRain,
  AlertTriangle,
  DollarSign,
  PieChart,
  UserX,
  Bandage,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { ChartContainer } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockProjects = [
  { id: 1, name: "Residencial Vista Mar" },
  { id: 2, name: "Comercial Centro Empresarial" },
  { id: 3, name: "Reforma Apto 301" },
  { id: 4, name: "Edifício Parque Verde" },
];

const mockIdleHoursData = [
  { name: 'Jan', hours: 12 },
  { name: 'Fev', hours: 8 },
  { name: 'Mar', hours: 15 },
  { name: 'Abr', hours: 6 },
  { name: 'Mai', hours: 10 },
  { name: 'Jun', hours: 4 },
];

const mockProductivityData = [
  { name: 'Jan', value: 72 },
  { name: 'Fev', value: 85 },
  { name: 'Mar', value: 78 },
  { name: 'Abr', value: 90 },
  { name: 'Mai', value: 83 },
  { name: 'Jun', value: 87 },
];

const mockRainHoursData = [
  { name: 'Jan', hours: 48 },
  { name: 'Fev', hours: 65 },
  { name: 'Mar', hours: 30 },
  { name: 'Abr', hours: 20 },
  { name: 'Mai', hours: 15 },
  { name: 'Jun', hours: 8 },
];

const mockAbsenteeismData = [
  { name: 'Jan', days: 24 },
  { name: 'Fev', days: 18 },
  { name: 'Mar', days: 22 },
  { name: 'Abr', days: 16 },
  { name: 'Mai', days: 20 },
  { name: 'Jun', days: 15 },
];

const mockAccidentsData = [
  { name: 'Jan', count: 2 },
  { name: 'Fev', count: 0 },
  { name: 'Mar', count: 1 },
  { name: 'Abr', count: 0 },
  { name: 'Mai', count: 0 },
  { name: 'Jun', count: 1 },
];

const mockABCCurveData = [
  { name: 'Concreto', value: 35 },
  { name: 'Aço', value: 25 },
  { name: 'Alvenaria', value: 15 },
  { name: 'Esquadrias', value: 10 },
  { name: 'Instalações', value: 8 },
  { name: 'Outros', value: 7 },
];

const mockCostComparisonData = [
  { name: 'Jan', budget: 100000, actual: 95000 },
  { name: 'Fev', budget: 120000, actual: 125000 },
  { name: 'Mar', budget: 90000, actual: 92000 },
  { name: 'Abr', budget: 85000, actual: 80000 },
  { name: 'Mai', budget: 110000, actual: 115000 },
  { name: 'Jun', budget: 95000, actual: 98000 },
];

const COLORS = ['#FF6B00', '#114084', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

// Define chart types with their metadata for toggle functionality
const chartTypes = [
  { id: 'productivity', name: 'Produtividade', icon: TrendingUp, initiallyVisible: true },
  { id: 'idle-hours', name: 'Horas Ociosas', icon: Clock, initiallyVisible: true },
  { id: 'rain-hours', name: 'Horas de Chuva', icon: CloudRain, initiallyVisible: true },
  { id: 'absenteeism', name: 'Faltas', icon: UserX, initiallyVisible: true },
  { id: 'accidents', name: 'Acidentes', icon: Bandage, initiallyVisible: true },
  { id: 'abc-curve', name: 'Curva ABC', icon: PieChart, initiallyVisible: true },
  { id: 'cost-comparison', name: 'Custos', icon: DollarSign, initiallyVisible: true },
];

// Default date range (últimos 6 meses)
const defaultDateRange = {
  start: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
};

const Analyses = () => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [dateRange, setDateRange] = useState(defaultDateRange);
  // State to track which charts are visible
  const [visibleCharts, setVisibleCharts] = useState(
    chartTypes.reduce((acc, chart) => ({ ...acc, [chart.id]: chart.initiallyVisible }), {})
  );
  const [isFiltered, setIsFiltered] = useState(false);

  const handleGeneratePDF = () => {
    toast({
      title: "PDF exportado com sucesso",
      description: "O relatório de análises foi exportado em formato PDF."
    });
  };

  const toggleChart = (chartId: string) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }));
  };

  // Handle filtering action
  const handleFilter = () => {
    setIsFiltered(true);
    toast({
      title: "Filtros aplicados",
      description: "Os gráficos foram atualizados com base nos filtros selecionados."
    });
  };

  // Fix for reset button
  const handleReset = () => {
    setSelectedProject("");
    setDateRange(defaultDateRange);
    setVisibleCharts(
      chartTypes.reduce((acc, chart) => ({ ...acc, [chart.id]: chart.initiallyVisible }), {})
    );
    setIsFiltered(false);
    
    toast({
      title: "Filtros resetados",
      description: "Os filtros foram redefinidos para os valores padrão."
    });
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Análises</h1>
          <p className="text-meta-gray-dark dark:text-meta-gray mt-1">Métricas e estatísticas dos seus projetos</p>
        </div>
        <Button 
          onClick={handleGeneratePDF}
          className="bg-meta-orange hover:bg-meta-orange/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters - Improved mobile layout */}
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
          <CardDescription>
            Selecione os parâmetros para filtrar suas análises
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="project">Projeto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project" className="w-full">
                  <SelectValue placeholder="Todos os projetos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button 
              className="bg-meta-blue hover:bg-meta-blue/90 w-full sm:w-auto"
              onClick={handleFilter}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Toggles */}
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle>Visualização de Gráficos</CardTitle>
          <CardDescription>
            Selecione quais gráficos deseja visualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {chartTypes.map((chart) => (
              <div key={chart.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`toggle-${chart.id}`} 
                  checked={visibleCharts[chart.id]} 
                  onCheckedChange={() => toggleChart(chart.id)}
                />
                <Label htmlFor={`toggle-${chart.id}`} className="flex items-center gap-2 cursor-pointer">
                  <chart.icon className="h-4 w-4" />
                  <span>{chart.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message when no filters are applied */}
      {!isFiltered && (
        <div className="border border-dashed border-meta-gray rounded-lg p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-meta-orange mx-auto mb-3" />
          <p className="text-meta-gray-dark mb-4">Aplique os filtros para visualizar os gráficos.</p>
          <Button 
            onClick={handleFilter} 
            className="bg-meta-orange hover:bg-meta-orange/90"
          >
            <Filter className="mr-2 h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      )}

      {/* All Charts Section - Only show when filtered */}
      {isFiltered && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Productivity Chart */}
          {visibleCharts['productivity'] && (
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle>Produtividade ao Longo do Tempo</CardTitle>
                <CardDescription>
                  Análise da produtividade mensal da equipe (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockProductivityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.3)" />
                      <XAxis dataKey="name" stroke="currentColor" />
                      <YAxis domain={[0, 100]} stroke="currentColor" />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Produtividade']}
                        labelFormatter={(label) => `Mês: ${label}`}
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#FF6B00" 
                        strokeWidth={2}
                        name="Produtividade" 
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Idle Hours Chart */}
          {visibleCharts['idle-hours'] && (
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle>Horas Ociosas</CardTitle>
                <CardDescription>
                  Análise das horas ociosas registradas por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={mockIdleHoursData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.3)" />
                      <XAxis dataKey="name" stroke="currentColor" />
                      <YAxis stroke="currentColor" />
                      <Tooltip 
                        formatter={(value) => [`${value} horas`, 'Tempo ocioso']}
                        labelFormatter={(label) => `Mês: ${label}`}
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="hours" 
                        fill="#114084" 
                        name="Horas Ociosas" 
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rain Hours Chart */}
          {visibleCharts['rain-hours'] && (
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle>Horas de Chuva</CardTitle>
                <CardDescription>
                  Análise das horas de chuva registradas por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={mockRainHoursData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.3)" />
                      <XAxis dataKey="name" stroke="currentColor" />
                      <YAxis stroke="currentColor" />
                      <Tooltip 
                        formatter={(value) => [`${value} horas`, 'Horas de chuva']}
                        labelFormatter={(label) => `Mês: ${label}`}
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="hours" 
                        fill="#36A2EB" 
                        name="Horas de Chuva" 
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Absenteeism Chart */}
          {visibleCharts['absenteeism'] && (
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle>Faltas de Colaboradores</CardTitle>
                <CardDescription>
                  Análise das faltas registradas por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={mockAbsenteeismData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.3)" />
                      <XAxis dataKey="name" stroke="currentColor" />
                      <YAxis stroke="currentColor" />
                      <Tooltip 
                        formatter={(value) => [`${value} dias`, 'Faltas']}
                        labelFormatter={(label) => `Mês: ${label}`}
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="days" 
                        fill="#FF6B00" 
                        name="Dias de Falta" 
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accidents Chart */}
          {visibleCharts['accidents'] && (
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle>Acidentes</CardTitle>
                <CardDescription>
                  Análise dos acidentes registrados por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={mockAccidentsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.3)" />
                      <XAxis dataKey="name" stroke="currentColor" />
                      <YAxis stroke="currentColor" />
                      <Tooltip 
                        formatter={(value) => [`${value}`, 'Acidentes']}
                        labelFormatter={(label) => `Mês: ${label}`}
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        fill="#FF4545" 
                        name="Número de Acidentes" 
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ABC Curve Chart */}
          {visibleCharts['abc-curve'] && (
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle>Curva ABC de Insumos</CardTitle>
                <CardDescription>
                  Distribuição dos principais insumos por custo (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <Pie
                        data={mockABCCurveData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockABCCurveData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Porcentagem']}
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Comparison Chart */}
          {visibleCharts['cost-comparison'] && (
            <Card className="dark:border-gray-700">
              <CardHeader>
                <CardTitle>Orçado vs. Executado</CardTitle>
                <CardDescription>
                  Comparação entre custos orçados e executados ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart 
                      data={mockCostComparisonData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.3)" />
                      <XAxis dataKey="name" stroke="currentColor" />
                      <YAxis stroke="currentColor" />
                      <Tooltip 
                        formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      />
                      <Legend />
                      <Bar dataKey="budget" fill="#114084" name="Orçado" />
                      <Bar dataKey="actual" fill="#FF6B00" name="Executado" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Analyses;
