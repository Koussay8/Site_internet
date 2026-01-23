import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook pour animation de compteur
 * Optimisé pour éviter les re-renders inutiles
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  suffix: string = '',
  isActive: boolean = true,
  snapOnInactive: boolean = false
) {
  const [count, setCount] = useState(0);
  const lastRendered = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      const nextValue = snapOnInactive ? end : 0;
      lastRendered.current = nextValue;
      setCount(nextValue);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();
    const precision = suffix === 'M' ? 1 : 0;
    lastRendered.current = null;
    setCount(0);

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = easeOutQuart * end;
      const rounded =
        precision === 0 ? Math.round(current) : Number(current.toFixed(precision));

      if (lastRendered.current !== rounded) {
        lastRendered.current = rounded;
        setCount(rounded);
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [duration, end, isActive, snapOnInactive, suffix]);

  return count;
}
