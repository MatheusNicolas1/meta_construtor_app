import React, { createContext, useContext, useEffect } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceContextType {
  recordCustomMetric: (name: string, value: number) => void;
  getAverageMetric: (metricName: string, timeframe?: number) => number;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const { recordCustomMetric, getAverageMetric } = usePerformanceMonitor();

  useEffect(() => {
    // Registrar métricas básicas sem loop infinito
    const startTime = performance.now();
    
    const handleRouteChange = () => {
      const endTime = performance.now();
      // Verificar se a função existe antes de chamar
      if (recordCustomMetric && typeof recordCustomMetric === 'function') {
        recordCustomMetric('route-change-duration', endTime - startTime);
      }
    };

    // Apenas registrar evento uma vez
    window.addEventListener('beforeunload', handleRouteChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, []); // Array vazio para evitar loop

  const value = {
    recordCustomMetric,
    getAverageMetric
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};