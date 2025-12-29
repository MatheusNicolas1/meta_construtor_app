import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { performanceOptimizer } from '@/utils/performanceOptimizer';

interface PerformanceContextType {
  isLowEndDevice: boolean;
  shouldReduceAnimations: boolean;
  shouldOptimizeImages: boolean;
  imageQuality: number;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isLowEndDevice: false,
  shouldReduceAnimations: false,
  shouldOptimizeImages: false,
  imageQuality: 85,
});

export const usePerformance = () => useContext(PerformanceContext);

interface PerformanceManagerProps {
  children: ReactNode;
}

export const PerformanceManager: React.FC<PerformanceManagerProps> = ({ children }) => {
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceContextType>({
    isLowEndDevice: false,
    shouldReduceAnimations: false,
    shouldOptimizeImages: false,
    imageQuality: 85,
  });

  useEffect(() => {
    const checkPerformance = () => {
      const isLowEnd = performanceOptimizer.isLowEndDevice();
      
      setPerformanceSettings({
        isLowEndDevice: isLowEnd,
        shouldReduceAnimations: isLowEnd,
        shouldOptimizeImages: isLowEnd,
        imageQuality: isLowEnd ? 70 : 85,
      });
    };

    checkPerformance();

    // Recheck on connection change
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', checkPerformance);
      return () => connection.removeEventListener('change', checkPerformance);
    }
  }, []);

  // Aplicar otimizações CSS baseadas na performance
  useEffect(() => {
    if (performanceSettings.shouldReduceAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.style.setProperty('--transition-duration', '0.1s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }
  }, [performanceSettings.shouldReduceAnimations]);

  return (
    <PerformanceContext.Provider value={performanceSettings}>
      {children}
    </PerformanceContext.Provider>
  );
};