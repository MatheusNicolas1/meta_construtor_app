import { useNavigate } from 'react-router-dom';
import { startTransition, useCallback } from 'react';

/**
 * Hook personalizado que envolve todas as navegações em startTransition
 * para evitar erros de suspense síncrono
 */
export const useNavigationTransition = () => {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to: string | number, options?: any) => {
    startTransition(() => {
      if (typeof to === 'number') {
        navigate(to);
      } else {
        navigate(to, options);
      }
    });
  }, [navigate]);

  return { navigate: navigateWithTransition };
};