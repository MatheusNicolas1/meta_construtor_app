import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cacheManager } from '@/utils/cacheManager';
import { useCallback } from 'react';

// Hook para cache otimizado de dados
export const useDataCache = () => {
  const queryClient = useQueryClient();

  const getCachedData = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      staleWhileRevalidate?: boolean;
    }
  ): Promise<T> => {
    return cacheManager.cachedFetch(key, fetcher, options);
  }, []);

  const invalidateCache = useCallback((pattern: string) => {
    cacheManager.invalidatePattern(pattern);
    // Também invalidar no React Query
    queryClient.invalidateQueries({ queryKey: [pattern] });
  }, [queryClient]);

  const prefetchData = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>
  ) => {
    return queryClient.prefetchQuery({
      queryKey: [key],
      queryFn: fetcher,
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }, [queryClient]);

  return {
    getCachedData,
    invalidateCache,
    prefetchData,
    cacheStats: cacheManager.getStats()
  };
};

// Hook especializado para dados de obras
export const useObraCache = (obraId?: string) => {
  const { getCachedData, invalidateCache } = useDataCache();

  const getObraData = useCallback(async <T>(
    dataType: string,
    fetcher: () => Promise<T>
  ): Promise<T> => {
    if (!obraId) throw new Error('ID da obra é obrigatório');
    
    const key = `obra:${obraId}:${dataType}`;
    return getCachedData(key, fetcher, {
      ttl: 10 * 60 * 1000, // 10 minutos para dados de obra
      staleWhileRevalidate: true
    });
  }, [obraId, getCachedData]);

  const invalidateObraCache = useCallback(() => {
    if (obraId) {
      invalidateCache(`obra:${obraId}`);
    }
  }, [obraId, invalidateCache]);

  return {
    getObraData,
    invalidateObraCache
  };
};

// Hook para dados de dashboard (mais frequente)
export const useDashboardCache = () => {
  const { getCachedData } = useDataCache();

  const getDashboardData = useCallback(async <T>(
    dataType: string,
    fetcher: () => Promise<T>
  ): Promise<T> => {
    const key = `dashboard:${dataType}`;
    return getCachedData(key, fetcher, {
      ttl: 2 * 60 * 1000, // 2 minutos para dados de dashboard
      staleWhileRevalidate: true
    });
  }, [getCachedData]);

  return { getDashboardData };
};