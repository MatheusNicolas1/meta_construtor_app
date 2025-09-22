import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

interface PerformanceData {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useLocalStorage<PerformanceMetric[]>('performance_metrics', []);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceData | null>(null);

  useEffect(() => {
    // Configurar observer para Core Web Vitals de forma mais estável
    let hasCalculated = false;
    
    const observer = new PerformanceObserver((list) => {
      if (hasCalculated) return; // Evitar múltiplas execuções
      
      for (const entry of list.getEntries()) {
        const metric: PerformanceMetric = {
          name: entry.name,
          value: entry.startTime,
          timestamp: Date.now(),
          url: window.location.pathname
        };

        setMetrics(prev => {
          const newMetrics = [...prev.slice(-99), metric];
          return newMetrics;
        });
      }
    });

    // Observar métricas importantes
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

    // Calcular métricas de performance apenas uma vez
    const calculateMetrics = () => {
      if (hasCalculated) return;
      hasCalculated = true;
      
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const ttfb = navigation?.responseStart - navigation?.requestStart || 0;

      setCurrentMetrics({
        fcp,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb
      });
    };

    // Calcular métricas após carregamento
    if (document.readyState === 'complete') {
      calculateMetrics();
    } else {
      window.addEventListener('load', calculateMetrics);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('load', calculateMetrics);
    };
  }, []); // Dependência vazia para executar apenas uma vez

  const recordCustomMetric = (name: string, value: number) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname
    };
    setMetrics(prev => [...prev.slice(-99), metric]);
  };

  const getAverageMetric = (metricName: string, timeframe: number = 24 * 60 * 60 * 1000) => {
    const cutoff = Date.now() - timeframe;
    const relevantMetrics = metrics.filter(m => m.name === metricName && m.timestamp > cutoff);
    
    if (relevantMetrics.length === 0) return 0;
    
    return relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;
  };

  return {
    metrics,
    currentMetrics,
    recordCustomMetric,
    getAverageMetric
  };
};