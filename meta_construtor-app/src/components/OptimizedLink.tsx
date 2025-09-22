import React, { useCallback } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface OptimizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  prefetch?: boolean;
  priority?: 'high' | 'low';
  children: React.ReactNode;
}

export const OptimizedLink: React.FC<OptimizedLinkProps> = ({
  to,
  prefetch = true,
  priority = 'low',
  children,
  ...props
}) => {
  const handleMouseEnter = useCallback(() => {
    if (prefetch && priority === 'low') {
      // Prefetch quando o usuário passa o mouse
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = to;
      link.setAttribute('as', 'document');
      document.head.appendChild(link);
    }
  }, [to, prefetch, priority]);

  const handleFocus = useCallback(() => {
    if (prefetch && priority === 'low') {
      // Prefetch quando o usuário foca no link
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = to;
      link.setAttribute('as', 'document');
      document.head.appendChild(link);
    }
  }, [to, prefetch, priority]);

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      {children}
    </Link>
  );
};