import Lenis from 'lenis';
import type {
  IScrollStrategy,
  ScrollToOptions,
  ScrollEventListener,
  ScrollEventData,
} from './interfaces/IScrollStrategy';

export class LenisScrollEngine implements IScrollStrategy {
  private static instance: LenisScrollEngine | null = null;
  private lenis: Lenis | null = null;
  private isInitialized: boolean = false;
  private listeners: Set<ScrollEventListener> = new Set();
  private unsubscribeLenis: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): LenisScrollEngine {
    if (!LenisScrollEngine.instance) {
      LenisScrollEngine.instance = new LenisScrollEngine();
    }
    return LenisScrollEngine.instance;
  }

  public init(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    this.lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      anchors: { offset: -75, duration: 1.2 },
      stopInertiaOnNavigate: true,
      prevent: (node: HTMLElement) => this.shouldPreventScroll(node),
    });

    this.unsubscribeLenis = this.lenis.on('scroll', (e: any) => {
      const data: ScrollEventData = {
        scroll: e.scroll ?? 0,
        limit: e.limit ?? 0,
        velocity: e.velocity ?? 0,
        direction: e.direction ?? 0,
        progress: e.progress ?? 0,
        animatedScroll: e.animatedScroll ?? e.scroll ?? 0,
      };
      this.listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (err) {
          console.error('[LenisScrollEngine] Listener error:', err);
        }
      });
    });

    this.isInitialized = true;
  }

  /**
   * Deteksi otomatis cerdas tanpa layout thrashing: jika scroll terjadi pada tabel, stream log,
   * dialog modal, atau elemen yang memiliki attribute data-lenis-prevent, Lenis
   * akan otomatis dinonaktifkan pada elemen tersebut agar scrolling native tetap mulus.
   */
  public shouldPreventScroll(node: HTMLElement): boolean {
    if (!node || typeof node.hasAttribute !== 'function') return false;

    // 1. Explicit data-lenis-prevent attribute or closest ancestor
    if (
      node.hasAttribute('data-lenis-prevent') ||
      node.hasAttribute('data-lenis-prevent-touch') ||
      node.hasAttribute('data-lenis-prevent-wheel') ||
      Boolean(node.closest?.('[data-lenis-prevent]'))
    ) {
      return true;
    }

    // 2. Form input controls
    const tagName = node.tagName?.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tagName)) {
      return true;
    }

    // 3. Modal Dialog / Popover / Backdrops
    if (node.getAttribute('role') === 'dialog' || Boolean(node.closest?.('[role="dialog"]'))) {
      return true;
    }

    // 4. Tables, table wrapper, dan scrollable containers
    if (
      tagName === 'table' ||
      Boolean(node.closest?.('table')) ||
      node.classList?.contains('overflow-y-auto') ||
      node.classList?.contains('overflow-x-auto') ||
      node.classList?.contains('overflow-auto') ||
      node.classList?.contains('touch-scroll')
    ) {
      return true;
    }

    return false;
  }

  public destroy(): void {
    if (this.unsubscribeLenis) {
      this.unsubscribeLenis();
      this.unsubscribeLenis = null;
    }
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
      this.isInitialized = false;
    }
    this.listeners.clear();
  }

  public scrollTo(target: number | HTMLElement | string, options?: ScrollToOptions): void {
    if (this.lenis) {
      try {
        this.lenis.scrollTo(target as any, {
          duration: options?.duration ?? 1.2,
          offset: options?.offset ?? 0,
          immediate: options?.immediate ?? false,
          lock: options?.lock ?? false,
          force: options?.force ?? true,
          onComplete: options?.onComplete,
        });
      } catch (err) {
        console.warn('[LenisScrollEngine] scrollTo error:', err);
      }
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: options?.immediate ? 'auto' : 'smooth' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0);
          window.scrollTo({ top: y, behavior: options?.immediate ? 'auto' : 'smooth' });
        }
      } else if (target instanceof HTMLElement) {
        const y = target.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0);
        window.scrollTo({ top: y, behavior: options?.immediate ? 'auto' : 'smooth' });
      }
    }
  }

  public scrollToTop(duration: number = 1.0): void {
    this.scrollTo(0, { duration, immediate: false, offset: 0, force: true });
  }

  /**
   * Resets scroll position immediately to the very top (0, 0)
   * used synchronously on route transitions between pages.
   */
  public resetToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
    if (this.lenis) {
      try {
        const lenisAny = this.lenis as any;
        if (typeof lenisAny.reset === 'function') {
          lenisAny.reset();
        }
        this.lenis.scrollTo(0, { immediate: true, force: true, offset: 0 });
        this.lenis.resize();
      } catch {
        // Safe fallback - window.scrollTo(0, 0) already performed
      }
    }
  }

  public stop(): void {
    this.lenis?.stop();
  }

  public start(): void {
    this.lenis?.start();
  }

  public getScroll(): number {
    return this.lenis?.animatedScroll ?? (typeof window !== 'undefined' ? window.scrollY : 0);
  }

  public getVelocity(): number {
    return this.lenis?.velocity ?? 0;
  }

  public isScrolling(): boolean {
    return this.lenis?.isScrolling !== false;
  }

  public on(event: 'scroll', callback: ScrollEventListener): () => void {
    this.listeners.add(callback);
    return () => this.off(event, callback);
  }

  public off(_event: 'scroll', callback: ScrollEventListener): void {
    this.listeners.delete(callback);
  }
}
