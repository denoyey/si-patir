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
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
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
   * Deteksi otomatis cerdas: jika scroll terjadi pada tabel, stream log,
   * dialog modal, atau elemen yang memiliki scrollbar internal, Lenis
   * akan otomatis dinonaktifkan pada elemen tersebut agar scrolling bawaan (native)
   * tetap berjalan lancar tanpa terganggu.
   */
  public shouldPreventScroll(node: HTMLElement): boolean {
    if (!node || typeof node.hasAttribute !== 'function') return false;

    // 1. Explicit data-lenis-prevent attribute
    if (
      node.hasAttribute('data-lenis-prevent') ||
      node.hasAttribute('data-lenis-prevent-touch') ||
      node.hasAttribute('data-lenis-prevent-wheel')
    ) {
      return true;
    }

    // 2. Form input controls
    const tagName = node.tagName?.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tagName)) {
      return true;
    }

    // 3. Modal Dialog / Popover / Backdrops
    if (node.getAttribute('role') === 'dialog' || node.closest?.('[role="dialog"]')) {
      return true;
    }

    // 4. Tables, table wrapper, dan terminal stream
    if (
      tagName === 'table' ||
      node.closest?.('table') ||
      node.classList?.contains('overflow-y-auto') ||
      node.classList?.contains('overflow-x-auto') ||
      node.classList?.contains('overflow-auto') ||
      node.classList?.contains('touch-scroll')
    ) {
      return true;
    }

    // 5. Elemen yang memiliki scrollable content (scrollHeight > clientHeight)
    if (node !== document.documentElement && node !== document.body) {
      try {
        const style = window.getComputedStyle(node);
        const hasScrollY =
          (style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
        const hasScrollX =
          (style.overflowX === 'auto' || style.overflowX === 'scroll') && node.scrollWidth > node.clientWidth;
        if (hasScrollY || hasScrollX) return true;
      } catch {
        // Fallback aman jika getComputedStyle gagal
      }
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
      this.lenis.scrollTo(target as any, options as any);
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  public scrollToTop(duration: number = 1.0): void {
    this.scrollTo(0, { duration, immediate: false });
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
    return !!this.lenis?.isScrolling;
  }

  public on(event: 'scroll', callback: ScrollEventListener): () => void {
    if (event === 'scroll') {
      this.listeners.add(callback);
      return () => {
        this.listeners.delete(callback);
      };
    }
    return () => {};
  }

  public off(event: 'scroll', callback: ScrollEventListener): void {
    if (event === 'scroll') {
      this.listeners.delete(callback);
    }
  }
}

