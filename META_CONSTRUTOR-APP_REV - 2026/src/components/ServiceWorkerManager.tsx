import { useEffect } from 'react';

export const ServiceWorkerManager = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Registrar service worker para cache
      navigator.serviceWorker.register('/sw.js?v=3', { scope: '/' })
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Service Worker registration only
    // Preloading removed to avoid 404s on non-existent API routes
  }, []);

  return null;
};