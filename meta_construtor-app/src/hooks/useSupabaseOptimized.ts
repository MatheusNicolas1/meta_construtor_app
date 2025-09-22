import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSupabaseOptimizedOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  cacheTime?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Cache simples em memória
const cache = new Map<string, CacheEntry>();

export const useSupabaseOptimized = ({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  enabled = true,
  cacheTime = 5 * 60 * 1000, // 5 minutos
}: UseSupabaseOptimizedOptions) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gerar chave de cache baseada nos parâmetros
  const cacheKey = useMemo(() => {
    return `${table}-${JSON.stringify({ select, filters, orderBy, limit })}`;
  }, [table, select, filters, orderBy, limit]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Verificar cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(select);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Aplicar ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Aplicar limite
      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Atualizar cache
      cache.set(cacheKey, {
        data: result || [],
        timestamp: Date.now(),
        expiresAt: Date.now() + cacheTime,
      });

      setData(result || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro na consulta Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [table, select, filters, orderBy, limit, enabled, cacheKey, cacheTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    cache.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  // Função para limpar todo o cache
  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache,
    clearCache,
  };
};

// Hook para operações de escrita otimizadas
export const useSupabaseMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    operation: () => Promise<any>,
    invalidateKeys?: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      // Invalidar cache das chaves especificadas
      if (invalidateKeys) {
        invalidateKeys.forEach(key => {
          cache.delete(key);
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    execute,
    loading,
    error,
  };
};


