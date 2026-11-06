import { useState, useEffect, useRef } from 'react';

interface UseNavbarVisibilityOptions {
  /**
   * Scroll offset from the top (in px) within which the navbar is always visible.
   * Defaults to 60px.
   */
  threshold?: number;
  /**
   * Minimum scroll delta (in px) required to trigger a show/hide transition.
   * Defaults to 6px.
   */
  deltaThreshold?: number;
}

/**
 * Universal auto-hiding navbar visibility hook.
 * Uses a single requestAnimationFrame-throttled scroll listener to eliminate
 * any race conditions between smooth scroll engines (Lenis) and native mobile touch events.
 *
 * Rules:
 * - At top of page (scrollY <= threshold): ALWAYS visible
 * - Scrolling DOWN (diff > deltaThreshold): hides (-translate-y-full)
 * - Scrolling UP (diff < -deltaThreshold): reveals (translate-y-0)
 */
export function useNavbarVisibility({
  threshold = 60,
  deltaThreshold = 6,
}: UseNavbarVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isTicking = useRef(false);

  useEffect(() => {
    // Sync initial scroll position on mount
    if (typeof window !== 'undefined') {
      lastScrollY.current = Math.max(0, window.scrollY);
    }

    const onScroll = () => {
      if (!isTicking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);
          const prevScrollY = lastScrollY.current;
          const diff = currentScrollY - prevScrollY;

          // 1. If near or at the top of the viewport, always show
          if (currentScrollY <= threshold) {
            setIsVisible(true);
          }
          // 2. Scrolling DOWN past delta threshold
          else if (diff > deltaThreshold) {
            setIsVisible(false);
          }
          // 3. Scrolling UP past delta threshold
          else if (diff < -deltaThreshold) {
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          isTicking.current = false;
        });

        isTicking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold, deltaThreshold]);

  return isVisible;
}
