// Utilitários para otimização de performance

// Debounce function otimizada
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle function otimizada
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cache inteligente com TTL
class SmartCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; ttl: number }>();

  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const smartCache = new SmartCache();

// Função para preload de recursos
export const preloadResource = (url: string, as: string = 'fetch'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${url}`));
    
    document.head.appendChild(link);
  });
};

// Função para lazy load de módulos
export const lazyLoadModule = <T>(
  moduleLoader: () => Promise<T>
): Promise<T> => {
  const cacheKey = moduleLoader.toString();
  
  if (smartCache.has(cacheKey)) {
    return Promise.resolve(smartCache.get(cacheKey) as T);
  }
  
  return moduleLoader().then((module: T) => {
    smartCache.set(cacheKey, module, 10 * 60 * 1000); // Cache por 10 minutos
    return module;
  });
};

// Otimização de arrays grandes
export const virtualizeArray = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
): { visibleItems: T[]; totalHeight: number; offsetY: number } => {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
};

// Função para detectar dispositivos com recursos limitados
export const isLowEndDevice = (): boolean => {
  const connection = (navigator as any).connection;
  const memory = (performance as any).memory;
  
  // Detectar conexão lenta
  const slowConnection = connection && 
    (connection.effectiveType === 'slow-2g' || 
     connection.effectiveType === '2g' || 
     connection.downlink < 1.5);
  
  // Detectar pouca memória
  const lowMemory = memory && memory.totalJSHeapSize < 64 * 1024 * 1024; // 64MB
  
  // Detectar hardware limitado
  const limitedCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  return !!(slowConnection || lowMemory || limitedCPU);
};

// Função para adaptar performance baseado no dispositivo
export const getPerformanceConfig = () => {
  const isLowEnd = isLowEndDevice();
  
  return {
    animationDuration: isLowEnd ? 200 : 300,
    debounceTime: isLowEnd ? 500 : 300,
    cacheSize: isLowEnd ? 50 : 100,
    lazyLoadMargin: isLowEnd ? '100px' : '200px',
    enableAnimations: !isLowEnd,
    maxConcurrentRequests: isLowEnd ? 2 : 6
  };
};