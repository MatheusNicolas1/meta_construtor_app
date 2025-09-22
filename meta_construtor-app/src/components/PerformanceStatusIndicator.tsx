import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/utils/performanceMonitor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Clock, 
  MemoryStick, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceStatusIndicatorProps {
  minimal?: boolean;
  className?: string;
}

export const PerformanceStatusIndicator: React.FC<PerformanceStatusIndicatorProps> = ({
  minimal = false,
  className
}) => {
  const { getMetrics, getScore, getAlerts, start } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState<any>({});
  const [score, setScore] = useState<number>(100);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Iniciar monitoramento
    start();

    // Atualizar métricas a cada 2 segundos
    const interval = setInterval(() => {
      setMetrics(getMetrics());
      setScore(getScore());
      setAlerts(getAlerts());
    }, 2000);

    // Mostrar indicador apenas se performance baixa ou em desenvolvimento
    const shouldShow = process.env.NODE_ENV === 'development' || getScore() < 85;
    setIsVisible(shouldShow);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible && minimal) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (minimal) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Badge 
          variant={getScoreVariant(score)}
          className="flex items-center gap-1 px-3 py-1"
        >
          <Activity className="w-3 h-3" />
          {score}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Score Geral */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Score Geral</span>
          <Badge variant={getScoreVariant(score)} className="flex items-center gap-1">
            {score >= 90 ? (
              <CheckCircle className="w-3 h-3" />
            ) : score >= 70 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {score}/100
          </Badge>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {metrics.fps && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span>FPS: {metrics.fps.latest}</span>
            </div>
          )}
          
          {metrics.memory_used && (
            <div className="flex items-center gap-1">
              <MemoryStick className="w-3 h-3 text-purple-500" />
              <span>RAM: {Math.round(metrics.memory_used.latest)}MB</span>
            </div>
          )}
          
          {metrics['largest-contentful-paint'] && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-500" />
              <span>LCP: {Math.round(metrics['largest-contentful-paint'].latest)}ms</span>
            </div>
          )}
          
          {metrics['first-contentful-paint'] && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span>FCP: {Math.round(metrics['first-contentful-paint'].latest)}ms</span>
            </div>
          )}
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              Alertas
            </div>
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded"
              >
                {alert}
              </div>
            ))}
          </div>
        )}

        {/* Dicas de Otimização */}
        {score < 80 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            💡 Dica: {score < 60 
              ? "Performance muito baixa. Considere recarregar a página."
              : score < 80 
              ? "Performance pode ser melhorada. Feche abas desnecessárias."
              : "Performance boa, mas pode ser otimizada."
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente mais simples para uso geral
export const PerformanceIndicator = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Mostrar apenas em desenvolvimento ou se performance baixa
    const shouldShow = process.env.NODE_ENV === 'development';
    setShow(shouldShow);
  }, []);

  if (!show) return null;

  return <PerformanceStatusIndicator minimal={true} />;
};