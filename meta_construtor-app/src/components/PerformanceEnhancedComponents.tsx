import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAggressiveMemo, useInstantCallback } from "@/hooks/useInstantCallback";

// Card otimizado com memoização agressiva
export const OptimizedCard = memo<{
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}>(({ title, description, children, className, onClick }) => {
  const handleClick = useInstantCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Card 
      className={cn("cursor-pointer transition-colors hover:bg-accent/50", className)}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

// Badge otimizado com cores pré-calculadas
export const StatusBadge = memo<{
  status: 'ativo' | 'inativo' | 'pausado' | 'concluido' | 'pendente';
  className?: string;
}>(({ status, className }) => {
  const badgeConfig = useAggressiveMemo(() => {
    const configs = {
      ativo: { variant: 'default' as const, text: 'Ativo', className: 'bg-green-500/10 text-green-700 border-green-200' },
      inativo: { variant: 'secondary' as const, text: 'Inativo', className: 'bg-gray-500/10 text-gray-700 border-gray-200' },
      pausado: { variant: 'outline' as const, text: 'Pausado', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
      concluido: { variant: 'default' as const, text: 'Concluído', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
      pendente: { variant: 'destructive' as const, text: 'Pendente', className: 'bg-red-500/10 text-red-700 border-red-200' },
    };
    return configs[status];
  }, [status]);

  return (
    <Badge 
      variant={badgeConfig.variant}
      className={cn(badgeConfig.className, className)}
    >
      {badgeConfig.text}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Lista virtualizada para grandes volumes de dados
export const VirtualizedList = memo<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
}>(({ items, renderItem, itemHeight, containerHeight, className }) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useAggressiveMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const endIndex = Math.min(items.length, startIndex + visibleCount);
    
    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useInstantCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div 
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleItems.offsetY}px)` }}>
          {visibleItems.items.map((item, index) => (
            <div key={index + visibleItems.startIndex} style={{ height: itemHeight }}>
              {renderItem(item, index + visibleItems.startIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Botão otimizado com estados pré-calculados
export const OptimizedButton = memo<{
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}>(({ variant = 'default', size = 'default', loading, disabled, children, onClick, className }) => {
  const handleClick = useInstantCallback(() => {
    if (!loading && !disabled) {
      onClick?.();
    }
  }, [onClick, loading, disabled]);

  const isDisabled = loading || disabled;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        loading && "opacity-50 cursor-wait",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      ) : (
        children
      )}
    </Button>
  );
});

OptimizedButton.displayName = 'OptimizedButton';

// Grid responsivo otimizado
export const ResponsiveGrid = memo<{
  children: React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}>(({ children, columns = { default: 1, md: 2, lg: 3 }, gap = 4, className }) => {
  const gridClasses = useAggressiveMemo(() => {
    const classes = [];
    
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    classes.push(`gap-${gap}`);
    
    return classes.join(' ');
  }, [columns, gap]);

  return (
    <div className={cn("grid", gridClasses, className)}>
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = 'ResponsiveGrid';

// Skeleton loader otimizado
export const OptimizedSkeleton = memo<{
  variant?: 'card' | 'list' | 'text' | 'avatar' | 'button';
  count?: number;
  className?: string;
}>(({ variant = 'card', count = 1, className }) => {
  const skeletonItems = useAggressiveMemo(() => {
    const items = [];
    
    for (let i = 0; i < count; i++) {
      let content;
      
      switch (variant) {
        case 'card':
          content = (
            <Card key={i} className={cn("animate-pulse", className)}>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                  <div className="h-3 bg-muted rounded w-4/6" />
                </div>
              </CardContent>
            </Card>
          );
          break;
        case 'list':
          content = (
            <div key={i} className={cn("flex items-center space-x-4 animate-pulse", className)}>
              <div className="rounded-full bg-muted h-10 w-10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          );
          break;
        case 'text':
          content = (
            <div key={i} className={cn("space-y-2 animate-pulse", className)}>
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          );
          break;
        case 'avatar':
          content = (
            <div key={i} className={cn("rounded-full bg-muted h-10 w-10 animate-pulse", className)} />
          );
          break;
        case 'button':
          content = (
            <div key={i} className={cn("h-10 bg-muted rounded px-4 animate-pulse", className)} />
          );
          break;
        default:
          content = (
            <div key={i} className={cn("h-4 bg-muted rounded animate-pulse", className)} />
          );
      }
      
      items.push(content);
    }
    
    return items;
  }, [variant, count, className]);

  return <>{skeletonItems}</>;
});

OptimizedSkeleton.displayName = 'OptimizedSkeleton';