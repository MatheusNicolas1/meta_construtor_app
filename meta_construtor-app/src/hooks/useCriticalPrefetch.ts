import { useEffect } from 'react';

// Rotas críticas que devem ser prefetchadas
const CRITICAL_ROUTES = [
  '/preco',
  '/checkout',
  '/criar-conta',
  '/login',
  '/sobre',
  '/contato',
  '/dashboard',
  '/obras',
];

// Rotas secundárias para prefetch após interação
const SECONDARY_ROUTES = [
  '/rdo',
  '/checklist',
  '/equipes',
  '/equipamentos',
  '/fornecedores',
  '/relatorios',
  '/configuracoes',
];

export const useCriticalPrefetch = () => {
  useEffect(() => {
    // Prefetch imediato das rotas críticas
    const prefetchRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      link.setAttribute('as', 'document');
      link.setAttribute('crossorigin', 'anonymous');
      document.head.appendChild(link);
    };

    // Prefetch das rotas críticas
    CRITICAL_ROUTES.forEach(route => {
      prefetchRoute(route);
    });

    // Prefetch de rotas secundárias após interação do usuário
    const handleUserInteraction = () => {
      SECONDARY_ROUTES.forEach(route => {
        prefetchRoute(route);
      });
    };

    // Adicionar listeners para interação do usuário
    const events = ['mousedown', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    // Prefetch adicional após 3 segundos
    const timer = setTimeout(() => {
      SECONDARY_ROUTES.forEach(route => {
        prefetchRoute(route);
      });
    }, 3000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      clearTimeout(timer);
    };
  }, []);
};

// Hook para prefetch de recursos estáticos
export const useResourcePrefetch = () => {
  useEffect(() => {
    const prefetchResource = (href: string, as: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.setAttribute('as', as);
      document.head.appendChild(link);
    };

    // Prefetch de fontes críticas
    prefetchResource('/fonts/inter-var.woff2', 'font');
    
    // Prefetch de imagens críticas
    prefetchResource('/lovable-uploads/5557c860-388b-4ad5-bde2-5718350a8197.png', 'image');
    
    // Prefetch de CSS crítico
    prefetchResource('/src/index.css', 'style');
  }, []);
};


