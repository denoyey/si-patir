import { useState, useEffect, useRef } from 'react';
import { LenisScrollEngine } from '../LenisScrollEngine';
import type { ScrollEventData } from '../interfaces/IScrollStrategy';

const engine = LenisScrollEngine.getInstance();

interface UseNavbarVisibilityOptions {
  /**
   * Scroll offset from the top (in px) within which the navbar is always visible.
   * Defaults to 60px.
   */
  threshold?: number;
  /**
   * Minimum scroll delta required to trigger a show/hide transition.
   * Prevents erratic flickering on micro-scrolls.
   * Defaults to 6px.
   */
  deltaThreshold?: number;
}

/**
 * Hook to manage smart auto-hiding navbar behavior:
 * - Hides when scrolling down past threshold
 * - Reveals smoothly when scrolling up
 * - Always visible when at the top of the page
 * - Works universally across desktop, tablet, and mobile devices (including iPhone)
 */
export function useNavbarVisibility({
  threshold = 60,
  deltaThreshold = 6,
}: UseNavbarVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    engine.init();

    const handleScrollEvent = (currentScrollY: number) => {
      const sanitizedScrollY = Math.max(0, currentScrollY);
      const prevScrollY = lastScrollY.current;
      const diff = sanitizedScrollY - prevScrollY;

      if (sanitizedScrollY <= threshold) {
        setIsVisible(true);
      } else if (diff > deltaThreshold) {
        setIsVisible(false);
      } else if (diff < -deltaThreshold) {
        setIsVisible(true);
      }

      lastScrollY.current = sanitizedScrollY;
    };

    // 1. Lenis reactive scroll watcher
    const unsubscribeLenis = engine.on('scroll', (data: ScrollEventData) => {
      handleScrollEvent(data.scroll);
    });

    // 2. Native window scroll event fallback
    const handleNativeScroll = () => {
      handleScrollEvent(window.scrollY);
    };

    window.addEventListener('scroll', handleNativeScroll, { passive: true });

    return () => {
      unsubscribeLenis();
      window.removeEventListener('scroll', handleNativeScroll);
    };
  }, [threshold, deltaThreshold]);

  return isVisible;
}
