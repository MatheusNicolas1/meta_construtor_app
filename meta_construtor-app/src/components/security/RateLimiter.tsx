import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  key: string;
}

interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

// Hook para rate limiting no frontend
export const useRateLimit = (config: RateLimitConfig) => {
  const { toast } = useToast();
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const getStorageKey = useCallback(() => `rateLimit_${config.key}`, [config.key]);

  const getRateLimitState = useCallback((): RateLimitState => {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return { attempts: 0, firstAttempt: Date.now() };
    
    try {
      return JSON.parse(stored);
    } catch {
      return { attempts: 0, firstAttempt: Date.now() };
    }
  }, [getStorageKey]);

  const saveRateLimitState = useCallback((state: RateLimitState) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  }, [getStorageKey]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = getRateLimitState();

    // Verificar se ainda está bloqueado
    if (state.blockedUntil && now < state.blockedUntil) {
      const remaining = Math.ceil((state.blockedUntil - now) / 1000);
      setRemainingTime(remaining);
      setIsBlocked(true);
      return false;
    }

    // Reset se a janela de tempo expirou
    if (now - state.firstAttempt > config.windowMs) {
      const newState: RateLimitState = {
        attempts: 0,
        firstAttempt: now,
      };
      saveRateLimitState(newState);
      setIsBlocked(false);
      setRemainingTime(0);
      return true;
    }

    // Verificar se excedeu o limite
    if (state.attempts >= config.maxAttempts) {
      const blockedUntil = now + config.blockDurationMs;
      const newState: RateLimitState = {
        ...state,
        blockedUntil,
      };
      saveRateLimitState(newState);
      
      const remaining = Math.ceil(config.blockDurationMs / 1000);
      setRemainingTime(remaining);
      setIsBlocked(true);
      
      toast({
        title: "Muitas tentativas",
        description: `Tente novamente em ${remaining} segundos`,
        variant: "destructive",
      });
      
      return false;
    }

    setIsBlocked(false);
    setRemainingTime(0);
    return true;
  }, [config, getRateLimitState, saveRateLimitState, toast]);

  const recordAttempt = useCallback(() => {
    const state = getRateLimitState();
    const now = Date.now();

    // Reset se a janela expirou
    if (now - state.firstAttempt > config.windowMs) {
      const newState: RateLimitState = {
        attempts: 1,
        firstAttempt: now,
      };
      saveRateLimitState(newState);
      return;
    }

    const newState: RateLimitState = {
      ...state,
      attempts: state.attempts + 1,
    };
    saveRateLimitState(newState);
  }, [config.windowMs, getRateLimitState, saveRateLimitState]);

  const reset = useCallback(() => {
    localStorage.removeItem(getStorageKey());
    setIsBlocked(false);
    setRemainingTime(0);
  }, [getStorageKey]);

  // Timer para countdown
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  return {
    isBlocked,
    remainingTime,
    checkRateLimit,
    recordAttempt,
    reset,
  };
};

// Configurações predefinidas de rate limiting
export const RATE_LIMIT_CONFIGS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 15 * 60 * 1000, // 15 minutos bloqueado
    key: 'login',
  },
  export: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 5 * 60 * 1000, // 5 minutos bloqueado
    key: 'export',
  },
  email: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 10 * 60 * 1000, // 10 minutos bloqueado
    key: 'email',
  },
  upload: {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 1000, // 2 minutos bloqueado
    key: 'upload',
  },
} as const;