import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

export const useCountUp = ({ end, duration = 2000, start = 0, decimals = 0 }: UseCountUpOptions) => {
  const [count, setCount] = useState(start);
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsInView(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const range = end - start;

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function para animação suave
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (range * easeOutQuart);
      
      setCount(currentCount);

      if (progress === 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [isInView, start, end, duration]);

  return { 
    count: decimals > 0 ? count.toFixed(decimals) : Math.floor(count),
    ref: elementRef
  };
};
