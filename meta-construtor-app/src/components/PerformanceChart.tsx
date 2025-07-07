
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PerformanceData {
  obras: Array<{
    name: string;
    progresso: number;
    orcamento: number;
    executado: number;
  }>;
  resumo: {
    totalAndamento: number;
    totalFinalizadas: number;
    mediaExecucao: number;
  };
}

const chartConfig = {
  progresso: {
    label: "Progresso",
    color: "#F7931E",
  },
  orcamento: {
    label: "Orçamento",
    color: "#001F3F",
  },
  executado: {
    label: "Executado",
    color: "#F7931E",
  },
};

export function PerformanceChart({ obras, resumo }: PerformanceData) {
  const statusData = [
    { name: 'Em Andamento', value: resumo.totalAndamento, color: '#F7931E' },
    { name: 'Finalizadas', value: resumo.totalFinalizadas, color: '#001F3F' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Progresso das Obras */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso por Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={obras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="progresso" fill="#F7931E" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status das Obras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Média de Execução:</span>
              <span className="font-medium">{resumo.mediaExecucao}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
