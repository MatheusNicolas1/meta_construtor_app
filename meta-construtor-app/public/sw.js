// Service Worker para MetaConstrutor PWA
const CACHE_NAME = 'metaconstrutor-v1.0.0';
const STATIC_CACHE_NAME = 'metaconstrutor-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'metaconstrutor-dynamic-v1.0.0';

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/app',
  '/dashboard',
  '/obras',
  '/rdo',
  '/equipes',
  '/equipamentos',
  '/relatorios',
  '/configuracoes',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// URLs da API que devem ser cacheadas
const API_CACHE_PATTERNS = [
  /\/api\/obras/,
  /\/api\/equipes/,
  /\/api\/equipamentos/,
  /\/api\/rdos/,
  /\/rest\/v1\/obras/,
  /\/rest\/v1\/equipes/,
  /\/rest\/v1\/equipamentos/,
  /\/rest\/v1\/rdos/
];

// URLs que nunca devem ser cacheadas
const NEVER_CACHE_PATTERNS = [
  /\/auth\//,
  /\/realtime/,
  /analytics/,
  /tracking/
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('metaconstrutor-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições que nunca devem ser cacheadas
  if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return;
  }
  
  // Estratégias diferentes para diferentes tipos de requisição
  if (request.method === 'GET') {
    if (url.origin === location.origin) {
      // Recursos do mesmo domínio
      event.respondWith(handleSameOriginRequest(request));
    } else if (isAPIRequest(url)) {
      // Requisições para API
      event.respondWith(handleAPIRequest(request));
    } else {
      // Outros recursos externos
      event.respondWith(handleExternalRequest(request));
    }
  } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    // Requisições de modificação - armazenar para sincronização offline
    event.respondWith(handleMutationRequest(request));
  }
});

// Lidar com requisições do mesmo domínio (Cache First)
async function handleSameOriginRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Retornar do cache e atualizar em background
      fetchAndUpdateCache(request, cache);
      return cachedResponse;
    }
    
    // Se não estiver no cache, buscar da rede
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Same origin request failed:', error);
    return getOfflineFallback(request);
  }
}

// Lidar com requisições de API (Network First)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache...');
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não houver cache, retornar resposta offline
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Esta operação requer conexão com a internet',
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Lidar com requisições externas (Cache First)
async function handleExternalRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] External request failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Lidar com requisições de mutação (POST, PUT, DELETE)
async function handleMutationRequest(request) {
  try {
    // Tentar fazer a requisição imediatamente
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Mutation request failed, storing for background sync...');
    
    // Se falhar, armazenar para sincronização posterior
    await storePendingRequest(request);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Operação armazenada para sincronização quando conexão for restabelecida',
      queued: true
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Armazenar requisição pendente para sincronização
async function storePendingRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()].reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {}),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  };
  
  const cache = await caches.open('pending-requests');
  const response = new Response(JSON.stringify(requestData));
  await cache.put(new Request(`pending-${Date.now()}`), response);
}

// Buscar e atualizar cache em background
async function fetchAndUpdateCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silenciosamente falhar - já temos uma resposta do cache
  }
}

// Verificar se é uma requisição de API
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         url.hostname.includes('supabase') ||
         url.pathname.startsWith('/api/');
}

// Fallback offline para páginas
function getOfflineFallback(request) {
  if (request.destination === 'document') {
    return caches.match('/') || new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MetaConstrutor - Offline</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #0A192F; 
              color: white; 
            }
            .container { 
              max-width: 500px; 
              margin: 0 auto; 
            }
            .logo { 
              color: #F7931E; 
              font-size: 2em; 
              margin-bottom: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">MetaConstrutor</div>
            <h1>Você está offline</h1>
            <p>Verifique sua conexão com a internet e tente novamente.</p>
            <p>Algumas funcionalidades podem estar disponíveis em cache.</p>
            <button onclick="window.location.reload()">Tentar Novamente</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  return new Response('Offline', { status: 503 });
}

// Background Sync para sincronizar dados offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingRequests());
  }
});

// Sincronizar requisições pendentes
async function syncPendingRequests() {
  try {
    const cache = await caches.open('pending-requests');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        const requestData = await response.json();
        
        // Reconstituir e executar a requisição
        const fetchRequest = new Request(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        const result = await fetch(fetchRequest);
        
        if (result.ok) {
          await cache.delete(request);
          console.log('[SW] Synchronized pending request:', requestData.url);
        }
      } catch (error) {
        console.error('[SW] Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MetaConstrutor';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'Visualizar'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully'); 