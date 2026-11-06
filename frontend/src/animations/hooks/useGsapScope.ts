import { useLayoutEffect, useRef } from 'react';
import { GsapAnimationEngine } from '../services/GsapAnimationEngine';

/**
 * useGsapScope
 * Custom hook React untuk mengisolasi animasi GSAP dalam scope elemen DOM tertentu.
 * Menjamin pembersihan memori otomatis (context.revert()) saat komponen di-unmount.
 */
export function useGsapScope() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engine = GsapAnimationEngine.getInstance();

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = engine.createContext(containerRef.current, () => {
      engine.animateDashboardEntrance(containerRef.current!);
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return { containerRef, engine };
}

