// Sistema de tarefas em background para não bloquear UI
class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  private taskQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private maxConcurrentTasks = 2;
  private currentTasks = 0;

  static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  // Adicionar tarefa à fila
  addTask<T>(task: () => Promise<T>, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };

      // Inserir baseado na prioridade
      if (priority === 'high') {
        this.taskQueue.unshift(wrappedTask);
      } else if (priority === 'medium') {
        // Inserir no meio
        const middleIndex = Math.floor(this.taskQueue.length / 2);
        this.taskQueue.splice(middleIndex, 0, wrappedTask);
      } else {
        this.taskQueue.push(wrappedTask);
      }

      this.processQueue();
    });
  }

  // Processar fila de tarefas
  private async processQueue() {
    if (this.isProcessing || this.currentTasks >= this.maxConcurrentTasks) {
      return;
    }

    if (this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.currentTasks++;

    const task = this.taskQueue.shift();
    if (task) {
      try {
        await task();
      } catch (error) {
        console.error('Background task failed:', error);
      } finally {
        this.currentTasks--;
        this.isProcessing = false;
        
        // Processar próxima tarefa
        if (this.taskQueue.length > 0) {
          // Pequeno delay para não sobrecarregar
          setTimeout(() => this.processQueue(), 10);
        }
      }
    }
  }

  // Limpar fila
  clearQueue() {
    this.taskQueue = [];
    console.log('🧹 Fila de tarefas em background limpa');
  }

  // Estatísticas
  getStats() {
    return {
      queueLength: this.taskQueue.length,
      currentTasks: this.currentTasks,
      isProcessing: this.isProcessing
    };
  }
}

export const backgroundTaskManager = BackgroundTaskManager.getInstance();

// Utilitários para uso comum
export const runInBackground = <T>(
  task: () => Promise<T>, 
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<T> => {
  return backgroundTaskManager.addTask(task, priority);
};

// Tarefas específicas para otimização
export const backgroundOptimizations = {
  // Limpeza de cache antigo
  cleanupOldCache: () => runInBackground(async () => {
    const keys = Object.keys(localStorage);
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
    
    keys.forEach(key => {
      if (key.startsWith('cache_') || key.startsWith('prefetch_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp && data.timestamp < cutoff) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove se não conseguir parsear
          localStorage.removeItem(key);
        }
      }
    });
    
    console.log('🧹 Cache antigo limpo');
  }, 'low'),

  // Preload de recursos críticos
  preloadCriticalResources: () => runInBackground(async () => {
    const criticalUrls = [
      '/api/dashboard/stats',
      '/api/user/profile',
      '/api/obras/recent'
    ];

    const promises = criticalUrls.map(url => 
      fetch(url, { method: 'HEAD' }).catch(() => {
        // Ignorar erros - é apenas preload
      })
    );

    await Promise.allSettled(promises);
    console.log('📦 Recursos críticos preloaded');
  }, 'high'),

  // Otimização de imagens carregadas
  optimizeLoadedImages: () => runInBackground(async () => {
    const images = document.querySelectorAll('img[src]');
    
    images.forEach((img: any) => {
      // Lazy load para imagens que não estão visíveis
      if (!img.loading && !isElementInViewport(img)) {
        img.loading = 'lazy';
      }
      
      // Adicionar decode="async" para performance
      if (!img.decode) {
        img.decoding = 'async';
      }
    });
    
    console.log(`🖼️ ${images.length} imagens otimizadas`);
  }, 'low'),

  // Análise de performance da página
  analyzePagePerformance: () => runInBackground(async () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      };
      
      // Log apenas se performance estiver ruim
      if (metrics.totalLoadTime > 3000) {
        console.warn('⚠️ Performance da página baixa:', metrics);
      } else {
        console.log('✅ Performance da página boa:', metrics);
      }
      
      return metrics;
    }
  }, 'low'),

  // Limpeza de event listeners não utilizados
  cleanupEventListeners: () => runInBackground(async () => {
    // Remover listeners de elementos que não existem mais
    const elements = document.querySelectorAll('[data-cleanup-listeners]');
    elements.forEach(element => {
      element.removeAttribute('data-cleanup-listeners');
    });
    
    console.log('🧹 Event listeners desnecessários removidos');
  }, 'low')
};

// Função auxiliar para verificar se elemento está no viewport
function isElementInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Inicializar otimizações em background
export const initializeBackgroundOptimizations = () => {
  console.log('🚀 Inicializando otimizações em background...');
  
  // Executar otimizações iniciais
  setTimeout(() => {
    backgroundOptimizations.preloadCriticalResources();
    backgroundOptimizations.optimizeLoadedImages();
  }, 2000);
  
  // Executar limpezas periódicas
  setTimeout(() => {
    backgroundOptimizations.cleanupOldCache();
    backgroundOptimizations.analyzePagePerformance();
  }, 5000);
  
  // Limpezas periódicas
  setInterval(() => {
    backgroundOptimizations.cleanupEventListeners();
    backgroundOptimizations.optimizeLoadedImages();
  }, 60000); // A cada minuto
  
  setInterval(() => {
    backgroundOptimizations.cleanupOldCache();
  }, 300000); // A cada 5 minutos
  
  console.log('✅ Otimizações em background configuradas');
};