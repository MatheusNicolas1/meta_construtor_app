import { smartCache } from './performanceOptimizations';

interface CacheConfig {
  ttl?: number;
  maxSize?: number;
  staleWhileRevalidate?: boolean;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = smartCache;
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Cache com deduplicação de requisições
  async cachedFetch<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    config: CacheConfig = {}
  ): Promise<T> {
    const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = config;

    // Verificar se há cache válido
    const cached = this.cache.get(key);
    if (cached && !staleWhileRevalidate) {
      return cached as T;
    }

    // Verificar se há uma requisição em andamento para evitar duplicatas
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Se tem cache válido mas stale-while-revalidate está ativo
    if (cached && staleWhileRevalidate) {
      // Retornar cache imediatamente
      this.revalidateInBackground(key, fetcher, ttl);
      return cached as T;
    }

    // Criar nova requisição
    const request = this.executeRequest(key, fetcher, ttl);
    this.pendingRequests.set(key, request);

    try {
      const result = await request;
      this.pendingRequests.delete(key);
      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  private async executeRequest<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number
  ): Promise<T> {
    try {
      const result = await fetcher();
      this.cache.set(key, result, ttl);
      return result;
    } catch (error) {
      // Em caso de erro, tentar retornar cache expirado se existir
      const staleData = this.cache.get(key);
      if (staleData) {
        console.warn('Retornando dados cache expirados devido a erro:', error);
        return staleData as T;
      }
      throw error;
    }
  }

  private async revalidateInBackground<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number
  ): Promise<void> {
    try {
      const result = await fetcher();
      this.cache.set(key, result, ttl);
    } catch (error) {
      console.error('Erro na revalidação em background:', error);
    }
  }

  // Cache para dados específicos do usuário
  cacheUserData<T>(userId: string, dataType: string, data: T, ttl?: number): void {
    const key = `user:${userId}:${dataType}`;
    this.cache.set(key, data, ttl);
  }

  getUserData<T>(userId: string, dataType: string): T | null {
    const key = `user:${userId}:${dataType}`;
    return this.cache.get(key) as T | null;
  }

  // Cache para dados de obra
  cacheObraData<T>(obraId: string, dataType: string, data: T, ttl?: number): void {
    const key = `obra:${obraId}:${dataType}`;
    this.cache.set(key, data, ttl);
  }

  getObraData<T>(obraId: string, dataType: string): T | null {
    const key = `obra:${obraId}:${dataType}`;
    return this.cache.get(key) as T | null;
  }

  // Invalidar cache relacionado
  invalidatePattern(pattern: string): void {
    // Implementação básica - em produção usar padrões mais sofisticados
    const keys = Object.keys(localStorage).filter(key => 
      key.includes(pattern)
    );
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Limpar cache
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Estatísticas do cache
  getStats() {
    return {
      size: this.cache.size(),
      pendingRequests: this.pendingRequests.size
    };
  }
}

export const cacheManager = CacheManager.getInstance();
export default cacheManager;