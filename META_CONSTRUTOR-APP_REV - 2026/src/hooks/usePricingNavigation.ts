import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook personalizado para navegação direcionada à página de preços
 */
export const usePricingNavigation = () => {
  const navigate = useNavigate();

  const navigateToFreePlan = useCallback(() => {
    // Define que o usuário quer ver o plano Free e redireciona para a página de preços
    localStorage.setItem('targetPlan', 'free');
    navigate('/preco?plan=free');
  }, [navigate]);

  const navigateToCreateAccount = useCallback(() => {
    navigate('/criar-conta');
  }, [navigate]);

  const navigateToPricing = useCallback(() => {
    // Navega para preços focando no plano Profissional (padrão)
    navigate('/preco');
  }, [navigate]);

  return { 
    navigateToFreePlan, 
    navigateToCreateAccount,
    navigateToPricing
  };
};