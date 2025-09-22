import { useCallback, useMemo, useRef } from 'react';
import { debounce, throttle } from '@/utils/performanceOptimizations';

// Hook para callbacks instantâneos sem delays
export const useInstantCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Hook para callbacks com debounce automático
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  deps: React.DependencyList
): T => {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return debouncedFn as T;
};

// Hook para memoização agressiva (similar ao useMemo mas mais otimizado)
export const useAggressiveMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const lastDeps = useRef<React.DependencyList>();
  const memoizedValue = useRef<T>();

  // Comparação otimizada de dependências
  const depsChanged = !lastDeps.current || 
    deps.length !== lastDeps.current.length || 
    deps.some((dep, index) => !Object.is(dep, lastDeps.current![index]));

  if (depsChanged) {
    memoizedValue.current = factory();
    lastDeps.current = deps;
  }

  return memoizedValue.current!;
};