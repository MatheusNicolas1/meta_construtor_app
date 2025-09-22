import { useState, useEffect } from 'react';

/**
 * Hook para detectar se o usuário está em um dispositivo móvel
 * Útil para ajustar comportamentos específicos de mobile
 */
export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    // Verificar imediatamente
    checkMobile();

    // Verificar se a orientação mudou (especialmente útil para tablets)
    const handleOrientationChange = () => {
      setTimeout(checkMobile, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return isMobile;
};
