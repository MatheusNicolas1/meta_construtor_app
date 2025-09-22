import { useEffect } from 'react';

export const ServiceWorkerManager = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Registrar service worker para cache
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
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