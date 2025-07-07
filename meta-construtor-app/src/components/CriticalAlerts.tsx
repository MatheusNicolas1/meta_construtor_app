
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, DollarSign, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Alert {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'warning' | 'error' | 'info';
  categoria: 'prazo' | 'custo' | 'equipamento';
  detalhes?: string;
}

interface CriticalAlertsProps {
  alertas: Alert[];
}

export function CriticalAlerts({ alertas }: CriticalAlertsProps) {
  if (alertas.length === 0) return null;

  const getIcon = (categoria: string) => {
    switch (categoria) {
      case 'prazo': return Clock;
      case 'custo': return DollarSign;
      case 'equipamento': return Settings;
      default: return AlertTriangle;
    }
  };

  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          Alertas Críticos
          <Badge variant="secondary" className="ml-auto">
            {alertas.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertas.map((alerta) => {
            const IconComponent = getIcon(alerta.categoria);
            return (
              <TooltipProvider key={alerta.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-sm transition-shadow cursor-pointer">
                      <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${getIconColor(alerta.tipo)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-orange-800 dark:text-orange-200 truncate">
                          {alerta.titulo}
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-300 truncate">
                          {alerta.descricao}
                        </p>
                      </div>
                      <Badge variant={alerta.tipo === 'error' ? 'destructive' : 'secondary'}>
                        {alerta.tipo === 'error' ? 'Crítico' : 'Atenção'}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{alerta.detalhes || alerta.descricao}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
