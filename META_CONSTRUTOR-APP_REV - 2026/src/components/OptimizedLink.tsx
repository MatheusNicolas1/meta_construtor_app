import React, { memo } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetch } from '@/utils/prefetcher';

interface OptimizedLinkProps extends LinkProps {
  prefetch?: boolean;
  children: React.ReactNode;
}

export const OptimizedLink = memo<OptimizedLinkProps>(({ 
  to, 
  prefetch = true, 
  children, 
  ...props 
}) => {
  const { onHoverPrefetch } = usePrefetch();

  const handleMouseEnter = () => {
    if (prefetch && typeof to === 'string') {
      const route = to.replace('/', '');
      onHoverPrefetch(route);
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
});

OptimizedLink.displayName = 'OptimizedLink';