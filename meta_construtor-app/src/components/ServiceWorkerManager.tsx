import { useEffect } from 'react';

export const ServiceWorkerManager = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Limpar service workers antigos primeiro
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.scope.includes('metaconstrutor')) {
            registration.unregister();
          }
        });
      });

      // Aguardar um pouco antes de registrar o novo
      setTimeout(() => {
        navigator.serviceWorker.register('/sw.js', { 
          scope: '/',
          updateViaCache: 'none'
        })
          .then((registration) => {
            console.log('SW registered successfully: ', registration);
            
            // Forçar atualização se houver nova versão
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nova versão disponível, recarregar página
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.error('SW registration failed: ', registrationError);
          });
      }, 1000);
    }

    // Preload recursos críticos
    const preloadResources = () => {
      const criticalResources = [
        '/api/dashboard/stats',
        '/api/obras/recent',
        '/api/rdo/recent'
      ];

      criticalResources.forEach(url => {
        fetch(url, { method: 'HEAD' }).catch(() => {
          // Ignore errors for optional preloading
        });
      });
    };

    // Preload após carregamento inicial
    setTimeout(preloadResources, 1000);
  }, []);

  return null;
};