import React, { Suspense, ReactNode } from 'react';

interface SafeSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const SafeSuspense: React.FC<SafeSuspenseProps> = ({
  children,
  fallback = <DefaultFallback />,
  delay = 200,
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Componente para lazy loading de rotas
export const LazyRoute: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      {children}
    </Suspense>
  );
};