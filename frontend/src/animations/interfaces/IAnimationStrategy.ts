export interface IAnimationStrategy {
  animateDashboardEntrance(container: HTMLElement): void;
  animateStatCounter(element: HTMLElement, targetValue: number, suffix?: string): void;
  animateProgressBar(barElement: HTMLElement, percentage: number): void;
  animateLogArrival(logElement: HTMLElement): void;
  animateModalEntrance(modalBox: HTMLElement, backdrop: HTMLElement): void;
  animateToastEntrance(toastElement: HTMLElement): void;
}
