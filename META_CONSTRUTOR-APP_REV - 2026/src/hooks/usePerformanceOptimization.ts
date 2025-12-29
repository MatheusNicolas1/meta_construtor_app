import { useEffect, useState, useCallback, useMemo } from 'react';

interface PerformanceMetrics {
  memoryUsage: number;
  connectionType: string;
  isSlowConnection: boolean;
  devicePixelRatio: number;
}

export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    connectionType: 'unknown',
    isSlowConnection: false,
    devicePixelRatio: 1,
  });

  // Detectar conexão lenta
  const checkConnectionSpeed = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const slowConnections = ['slow-2g', '2g', '3g'];
      return {
        type: connection.effectiveType || 'unknown',
        isSlowConnection: slowConnections.includes(connection.effectiveType),
      };
    }
    return { type: 'unknown', isSlowConnection: false };
  }, []);

  // Monitorar uso de memória
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }, []);

  // Configurações otimizadas baseadas na performance
  const optimizedSettings = useMemo(() => {
    const { isSlowConnection, memoryUsage } = metrics;
    
    return {
      // Reduzir qualidade de imagem em conexões lentas
      imageQuality: isSlowConnection ? 70 : 85,
      
      // Lazy loading mais agressivo em dispositivos com pouca memória
      lazyLoadingMargin: memoryUsage > 80 ? '20px' : '100px',
      
      // Reduzir animações em conexões lentas
      enableAnimations: !isSlowConnection && memoryUsage < 75,
      
      // Prefetch menos recursos em conexões lentas
      enablePrefetch: !isSlowConnection && memoryUsage < 60,
      
      // Chunk size menor para conexões lentas
      chunkSize: isSlowConnection ? 'small' : 'normal',
    };
  }, [metrics]);

  useEffect(() => {
    const updateMetrics = () => {
      const connectionInfo = checkConnectionSpeed();
      const memoryUsage = checkMemoryUsage();
      
      setMetrics({
        memoryUsage,
        connectionType: connectionInfo.type,
        isSlowConnection: connectionInfo.isSlowConnection,
        devicePixelRatio: window.devicePixelRatio || 1,
      });
    };

    // Verificar inicialmente
    updateMetrics();

    // Verificar periodicamente (a cada 30 segundos)
    const interval = setInterval(updateMetrics, 30000);

    // Verificar quando a conexão mudar
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateMetrics);
      
      return () => {
        clearInterval(interval);
        connection.removeEventListener('change', updateMetrics);
      };
    }

    return () => clearInterval(interval);
  }, [checkConnectionSpeed, checkMemoryUsage]);

  // Helper para otimizar imagens
  const getOptimizedImageProps = useCallback((originalSrc: string, width?: number, height?: number) => {
    const { imageQuality } = optimizedSettings;
    const { isSlowConnection } = metrics;
    
    return {
      src: originalSrc,
      quality: imageQuality,
      loading: 'lazy' as const,
      decoding: 'async' as const,
      // Usar dimensões menores em conexões lentas
      width: isSlowConnection && width ? Math.floor(width * 0.8) : width,
      height: isSlowConnection && height ? Math.floor(height * 0.8) : height,
    };
  }, [optimizedSettings, metrics]);

  // Helper para decidir se deve prefetch
  const shouldPrefetch = useCallback((priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!optimizedSettings.enablePrefetch) return false;
    
    switch (priority) {
      case 'high':
        return true;
      case 'medium':
        return !metrics.isSlowConnection;
      case 'low':
        return !metrics.isSlowConnection && metrics.memoryUsage < 50;
      default:
        return false;
    }
  }, [optimizedSettings.enablePrefetch, metrics]);

  return {
    metrics,
    optimizedSettings,
    getOptimizedImageProps,
    shouldPrefetch,
  };
};