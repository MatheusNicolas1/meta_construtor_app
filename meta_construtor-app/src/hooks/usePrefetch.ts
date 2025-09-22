import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PrefetchOptions {
  delay?: number;
  priority?: 'high' | 'low';
}

export const usePrefetch = (routes: string[], options: PrefetchOptions = {}) => {
  const { delay = 2000, priority = 'low' } = options;
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      routes.forEach(route => {
        // Prefetch the route by navigating to it in the background
        // This will trigger the route's component to be loaded
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [routes, delay]);

  return navigate;
};

// Hook específico para prefetch de rotas críticas
export const useCriticalPrefetch = () => {
  useEffect(() => {
    // Prefetch das rotas mais acessadas
    const criticalRoutes = [
      '/preco',
      '/checkout',
      '/criar-conta',
      '/login',
      '/sobre',
      '/contato'
    ];

    const prefetchRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      link.setAttribute('as', 'document');
      document.head.appendChild(link);
    };

    // Prefetch imediato para rotas críticas
    criticalRoutes.forEach(route => {
      prefetchRoute(route);
    });

    // Prefetch adicional após interação do usuário
    const handleUserInteraction = () => {
      criticalRoutes.forEach(route => {
        prefetchRoute(route);
      });
    };

    document.addEventListener('mousedown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);
};


