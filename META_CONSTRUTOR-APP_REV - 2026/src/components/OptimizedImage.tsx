import React from 'react';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  lazy = true,
  quality = 80,
  format = 'webp',
  placeholder,
  onLoad,
  onError
}) => {
  const { ref, src: optimizedSrc, isLoaded, isInView } = useImageOptimization(src, {
    lazy,
    quality,
    format,
    placeholder
  });

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {(isInView || !lazy) && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
        />
      )}
    </div>
  );
};