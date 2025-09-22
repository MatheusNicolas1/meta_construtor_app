const CACHE_NAME = 'metaconstrutor-v3';

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Não fazer cache de URLs específicas na instalação
  // Apenas marcar como instalado
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Assumir controle de todas as páginas
      return self.clients.claim();
    })
  );
});

// Servir do cache quando disponível
self.addEventListener('fetch', (event) => {
  // Apenas interceptar requisições de navegação (páginas)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Se falhar, tentar servir do cache
          return caches.match('/');
        })
    );
  }
  // Para outras requisições, deixar passar normalmente
});