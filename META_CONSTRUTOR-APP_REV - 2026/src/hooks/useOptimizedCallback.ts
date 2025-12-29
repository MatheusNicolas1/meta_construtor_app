import { useCallback, useRef } from 'react';

// Hook para otimizar callbacks com debounce automático
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  delay: number = 0
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (delay > 0) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    } else {
      return callback(...args);
    }
  }, deps) as T;
};

// Hook para memoização inteligente de valores computados
export const useComputedValue = <T>(
  compute: () => T,
  deps: React.DependencyList
): T => {
  const memoRef = useRef<{ value: T; deps: React.DependencyList }>();

  if (!memoRef.current || !areEqual(memoRef.current.deps, deps)) {
    memoRef.current = {
      value: compute(),
      deps
    };
  }

  return memoRef.current.value;
};

const areEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
};