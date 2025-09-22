import { PerformanceOptimizedApp } from "@/components/PerformanceOptimizedApp";
import { performanceMonitor } from "@/utils/performanceMonitor";
import { useCriticalPrefetch } from "@/hooks/useCriticalPrefetch";
import "./utils/clearDebugData"; // Limpar dados de debug

// Componente wrapper para otimizações
const OptimizedApp = () => {
  useCriticalPrefetch();
  
  return <PerformanceOptimizedApp />;
};

// Inicializar monitor de performance
if (typeof window !== 'undefined') {
  setTimeout(() => {
    performanceMonitor.start();
  }, 500);
}

const App = () => <OptimizedApp />;

export default App;