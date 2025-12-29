import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { smartCache } from '@/utils/performanceOptimizations';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  cacheTTL?: number;
  enableSmartCache?: boolean;
}

export const useOptimizedQuery = <T>({
  queryKey,
  queryFn,
  cacheTTL = 5 * 60 * 1000, // 5 minutos
  enableSmartCache = true,
  ...options
}: OptimizedQueryOptions<T>) => {
  const cacheKey = JSON.stringify(queryKey);

  const optimizedQueryFn = async (): Promise<T> => {
    // Verificar cache inteligente primeiro
    if (enableSmartCache) {
      const cached = smartCache.get(cacheKey);
      if (cached) {
        return cached as T;
      }
    }

    // Buscar dados
    const data = await queryFn();
    
    // Armazenar no cache inteligente
    if (enableSmartCache) {
      smartCache.set(cacheKey, data, cacheTTL);
    }

    return data;
  };

  return useQuery({
    queryKey,
    queryFn: optimizedQueryFn,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Retry inteligente baseado no tipo de erro
      if (error instanceof Error && error.message.includes('Network')) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};