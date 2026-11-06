export interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  lock?: boolean;
  force?: boolean;
  onComplete?: () => void;
}

export interface ScrollEventData {
  scroll: number;
  limit: number;
  velocity: number;
  direction: number;
  progress: number;
  animatedScroll: number;
}

export type ScrollEventListener = (data: ScrollEventData) => void;

export interface IScrollStrategy {
  init(): void;
  destroy(): void;
  scrollTo(target: number | HTMLElement | string, options?: ScrollToOptions): void;
  scrollToTop(duration?: number): void;
  stop(): void;
  start(): void;
  getScroll(): number;
  getVelocity(): number;
  isScrolling(): boolean;
  on(event: 'scroll', callback: ScrollEventListener): () => void;
  off(event: 'scroll', callback: ScrollEventListener): void;
  shouldPreventScroll(node: HTMLElement): boolean;
}
