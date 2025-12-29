import { useState, useEffect, useRef } from 'react';

interface ImageOptimizationOptions {
  lazy?: boolean;
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
  placeholder?: string;
}

export const useImageOptimization = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!options.lazy);
  const [optimizedSrc, setOptimizedSrc] = useState(options.placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!options.lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options.lazy]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    
    // Tentar carregar formato WebP se suportado
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('webp') > -1;
    };

    let finalSrc = src;
    
    // Se a fonte é uma URL externa, tentar otimizar
    if (options.format === 'webp' && supportsWebP() && src.startsWith('http')) {
      // Implementação básica - em produção usar serviço de otimização de imagens
      finalSrc = src;
    }

    img.onload = () => {
      setOptimizedSrc(finalSrc);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setOptimizedSrc(src); // Fallback para imagem original
      setIsLoaded(true);
    };

    img.src = finalSrc;
  }, [isInView, src, options.format]);

  return {
    ref: imgRef,
    src: optimizedSrc,
    isLoaded,
    isInView
  };
};