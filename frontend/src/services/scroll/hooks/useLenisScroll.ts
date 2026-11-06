import { useEffect, useState, useCallback } from 'react';
import { LenisScrollEngine } from '../LenisScrollEngine';
import type { ScrollEventData, ScrollToOptions } from '../interfaces/IScrollStrategy';

const engine = LenisScrollEngine.getInstance();

export function useLenisScroll() {
  const [scrollData, setScrollData] = useState<ScrollEventData>({
    scroll: 0,
    limit: 0,
    velocity: 0,
    direction: 0,
    progress: 0,
    animatedScroll: 0,
  });

  useEffect(() => {
    engine.init();

    const unsubscribe = engine.on('scroll', (data: ScrollEventData) => {
      setScrollData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const scrollToTop = useCallback((duration: number = 1.0) => {
    engine.scrollToTop(duration);
  }, []);

  const scrollTo = useCallback((target: number | HTMLElement | string, options?: ScrollToOptions) => {
    engine.scrollTo(target, options);
  }, []);

  return {
    engine,
    scroll: scrollData.scroll,
    animatedScroll: scrollData.animatedScroll,
    velocity: scrollData.velocity,
    direction: scrollData.direction,
    progress: scrollData.progress,
    scrollToTop,
    scrollTo,
  };
}
