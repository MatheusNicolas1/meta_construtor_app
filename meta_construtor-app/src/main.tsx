import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializePrefetch } from './utils/prefetcher'
import { initializeRoutePreloader } from './utils/routePreloader'
import { performanceMonitor } from './utils/performanceMonitor'
import { initializeBackgroundOptimizations } from './utils/backgroundTasks'

// ============================================
// SISTEMA DE PERFORMANCE ULTRA-OTIMIZADO 🚀
// ============================================

// Performance crítica - execução imediata
const initializeCriticalSystems = () => {
  console.log('⚡ Inicializando sistemas críticos de performance...');
  
  // 1. Monitor de performance (imediato)
  performanceMonitor.start();
  
  // 2. Prefetch de dados essenciais (100ms)
  setTimeout(() => {
    initializePrefetch();
  }, 100);
  
  // 3. Preload de rotas principais (300ms)
  setTimeout(() => {
    initializeRoutePreloader();
  }, 300);
  
  // 4. Otimizações em background (1s)
  setTimeout(() => {
    initializeBackgroundOptimizations();
  }, 1000);
  
  console.log('✅ Todos os sistemas de performance inicializados!');
};

// Executar inicialização crítica
initializeCriticalSystems();

// Render da aplicação
createRoot(document.getElementById("root")!).render(<App />);
