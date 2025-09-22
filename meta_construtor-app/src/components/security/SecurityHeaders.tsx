import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SecurityHeadersProps {
  nonce?: string;
  title?: string;
  description?: string;
}

// Componente para aplicar headers de segurança e CSP
export const SecurityHeaders: React.FC<SecurityHeadersProps> = ({ 
  nonce,
  title = "Meta Construtor",
  description = "Sistema de gestão de obras e RDOs"
}) => {
  // Gerar nonce se não fornecido
  const scriptNonce = nonce || generateNonce();

  useEffect(() => {
    // Configurar headers de segurança via meta tags
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!metaCSP) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', buildCSP(scriptNonce));
      document.head.appendChild(cspMeta);
    }
  }, [scriptNonce]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
      
      {/* HSTS for HTTPS */}
      <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
      
      {/* CSP */}
      <meta 
        httpEquiv="Content-Security-Policy" 
        content={buildCSP(scriptNonce)}
      />
      
      {/* Prevent MIME sniffing */}
      <meta httpEquiv="X-Download-Options" content="noopen" />
      
      {/* Disable DNS prefetching for privacy */}
      <meta httpEquiv="x-dns-prefetch-control" content="off" />
    </Helmet>
  );
};

// Gerar nonce para scripts
const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Construir Content Security Policy
const buildCSP = (nonce: string): string => {
  const isDevelopment = import.meta.env.DEV;
  
  const policies = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${isDevelopment ? "'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://bgdvlhttyjeuprrfxgun.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  // Em desenvolvimento, relaxar algumas restrições
  if (isDevelopment) {
    policies.push("connect-src 'self' ws://localhost:* http://localhost:* https://bgdvlhttyjeuprrfxgun.supabase.co");
  }

  return policies.join('; ');
};

export default SecurityHeaders;