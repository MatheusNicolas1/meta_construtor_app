import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  quality?: number;
}

export const LazyImage = memo(({
  src,
  alt,
  className,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E",
  width,
  height,
  loading = 'lazy',
  quality = 85
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(img);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Otimizar src para WebP se suportado
  const optimizedSrc = React.useMemo(() => {
    if (!src) return placeholder;
    
    // Verificar se o navegador suporta WebP
    const supportsWebP = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;
    
    if (supportsWebP && !src.endsWith('.webp') && !src.includes('data:')) {
      // Tentar converter para WebP se possível
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return src;
  }, [src, placeholder]);

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : placeholder}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          error && "opacity-50",
          className
        )}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Erro ao carregar imagem
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';