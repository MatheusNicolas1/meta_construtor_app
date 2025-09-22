// Configurações de performance
export const PERFORMANCE_CONFIG = {
  // Configurações de cache
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
    LONG_TTL: 30 * 60 * 1000, // 30 minutos
    SHORT_TTL: 1 * 60 * 1000, // 1 minuto
  },
  
  // Configurações de lazy loading
  LAZY_LOADING: {
    ROOT_MARGIN: '50px',
    THRESHOLD: 0.1,
    DELAY: 200,
  },
  
  // Configurações de prefetch
  PREFETCH: {
    CRITICAL_DELAY: 0, // Imediato
    SECONDARY_DELAY: 3000, // 3 segundos
    INTERACTION_DELAY: 100, // 100ms após interação
  },
  
  // Configurações de imagens
  IMAGES: {
    DEFAULT_QUALITY: 75,
    DEFAULT_FORMAT: 'webp',
    PLACEHOLDER_BLUR: true,
  },
  
  // Configurações de bundle
  BUNDLE: {
    CHUNK_SIZE_WARNING: 1000,
    VENDOR_CHUNK_SIZE: 200,
    ROUTE_CHUNK_SIZE: 100,
  },
  
  // Configurações de Supabase
  SUPABASE: {
    QUERY_TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
    BATCH_SIZE: 100,
  },
};

// Rotas críticas para prefetch
export const CRITICAL_ROUTES = [
  '/preco',
  '/checkout',
  '/criar-conta',
  '/login',
  '/sobre',
  '/contato',
  '/dashboard',
  '/obras',
];

// Rotas secundárias para prefetch
export const SECONDARY_ROUTES = [
  '/rdo',
  '/checklist',
  '/equipes',
  '/equipamentos',
  '/fornecedores',
  '/relatorios',
  '/configuracoes',
];

// Recursos estáticos para prefetch
export const STATIC_RESOURCES = [
  { href: '/fonts/inter-var.woff2', as: 'font' },
  { href: '/lovable-uploads/5557c860-388b-4ad5-bde2-5718350a8197.png', as: 'image' },
  { href: '/src/index.css', as: 'style' },
];

// Configurações de monitoramento
export const MONITORING_CONFIG = {
  ENABLED: true,
  SAMPLE_RATE: 0.1, // 10% das sessões
  METRICS: {
    LCP: { threshold: 2500 }, // 2.5s
    FCP: { threshold: 1800 }, // 1.8s
    TTI: { threshold: 3800 }, // 3.8s
    CLS: { threshold: 0.1 },
  },
};


