// Configurações de autenticação
export const AUTH_CONFIG = {
  // URL base do projeto
  BASE_URL: 'https://metaconstrutor-app-eosin.vercel.app',
  
  // URLs de redirecionamento
  REDIRECT_URLS: {
    // URL de produção
    PRODUCTION: 'https://metaconstrutor-app-eosin.vercel.app/dashboard',
    // URL de desenvolvimento local
    LOCAL: 'http://localhost:3000/dashboard',
  },
  
  // Configurações do Google OAuth
  GOOGLE_OAUTH: {
    access_type: 'offline',
    prompt: 'consent',
  }
};

// Função para obter a URL de redirecionamento correta
export const getRedirectUrl = (): string => {
  if (typeof window === 'undefined') {
    return AUTH_CONFIG.REDIRECT_URLS.PRODUCTION;
  }
  
  const origin = window.location.origin;
  
  // Se estiver em produção (vercel.app)
  if (origin.includes('vercel.app')) {
    return AUTH_CONFIG.REDIRECT_URLS.PRODUCTION;
  }
  
  // Se estiver em desenvolvimento local
  if (origin.includes('localhost')) {
    return AUTH_CONFIG.REDIRECT_URLS.LOCAL;
  }
  
  // Fallback para a URL atual
  return `${origin}/dashboard`;
};
