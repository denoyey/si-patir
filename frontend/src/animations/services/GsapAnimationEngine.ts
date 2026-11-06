import { gsap } from 'gsap';
import type { IAnimationStrategy } from '../interfaces/IAnimationStrategy';

/**
 * GsapAnimationEngine
 * Engine animasi berbasis Object-Oriented Programming (OOP) yang mengelola
 * seluruh transisi, mikro-interaksi, dan visualisasi real-time aplikasi SI-PATIR.
 */
export class GsapAnimationEngine implements IAnimationStrategy {
  private static instance: GsapAnimationEngine;

  private constructor() {
    // Inisialisasi konfigurasi global GSAP
    gsap.config({
      autoSleep: 60,
      nullTargetWarn: false,
    });
  }

  /**
   * Singleton pattern accessor
   */
  public static getInstance(): GsapAnimationEngine {
    if (!GsapAnimationEngine.instance) {
      GsapAnimationEngine.instance = new GsapAnimationEngine();
    }
    return GsapAnimationEngine.instance;
  }

  /**
   * Mengatur scope animasi yang aman untuk lifecycle React (anti-memory leak)
   */
  public createContext(scopeElement: HTMLElement, callback: (ctx: gsap.Context) => void): gsap.Context {
    return gsap.context(callback, scopeElement);
  }

  /**
   * Animasi masuk (entrance) seluruh layout dashboard dengan efek stagger modern
   */
  public animateDashboardEntrance(container: HTMLElement): void {
    if (!container) return;

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Header & Repository badge
    const header = container.querySelector('[data-anim="header"]');
    if (header) {
      timeline.fromTo(
        header,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }

    // 2. Stat metric cards
    const statCards = container.querySelectorAll('[data-anim="stat-card"]');
    if (statCards.length > 0) {
      timeline.fromTo(
        statCards,
        { opacity: 0, y: 14, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08 },
        '-=0.25'
      );
    }

    // 3. Main content grids (Leaderboard, Tasks, Live Webhook)
    const contentGrids = container.querySelectorAll('[data-anim="content-grid"]');
    if (contentGrids.length > 0) {
      timeline.fromTo(
        contentGrids,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
        '-=0.2'
      );
    }
  }

  /**
   * Animasi counter angka halus (misal total komit, penyelesaian tugas)
   */
  public animateStatCounter(element: HTMLElement, targetValue: number, suffix: string = ''): void {
    if (!element) return;

    const currentText = element.innerText.replace(/[^0-9]/g, '');
    const startValue = currentText ? parseInt(currentText, 10) : 0;
    const targetObj = { val: isNaN(startValue) ? 0 : startValue };

    gsap.to(targetObj, {
      val: targetValue,
      duration: 0.85,
      ease: 'power2.out',
      onUpdate: () => {
        if (element) {
          element.innerText = `${Math.round(targetObj.val)}${suffix}`;
        }
      },
    });
  }

  /**
   * Animasi transisi progress bar penyelesaian tugas
   */
  public animateProgressBar(barElement: HTMLElement, percentage: number): void {
    if (!barElement) return;

    gsap.to(barElement, {
      width: `${Math.min(Math.max(percentage, 0), 100)}%`,
      duration: 0.75,
      ease: 'power3.out',
    });
  }

  /**
   * Animasi sorotan saat event webhook baru tiba di live audit stream
   */
  public animateLogArrival(logElement: HTMLElement): void {
    if (!logElement) return;

    const timeline = gsap.timeline();
    timeline
      .fromTo(
        logElement,
        { opacity: 0, x: -16, backgroundColor: 'rgba(16, 185, 129, 0.15)' },
        { opacity: 1, x: 0, backgroundColor: 'rgba(17, 20, 29, 0)', duration: 0.6, ease: 'power2.out' }
      );
  }

  /**
   * Animasi kemunculan pop-up dialog / modal
   */
  public animateModalEntrance(modalBox: HTMLElement, backdrop: HTMLElement): void {
    if (!modalBox || !backdrop) return;

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      .fromTo(
        modalBox,
        { opacity: 0, scale: 0.94, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' },
        '-=0.15'
      );
  }

  /**
   * Animasi kemunculan Toast Notification real-time
   */
  public animateToastEntrance(toastElement: HTMLElement): void {
    if (!toastElement) return;

    gsap.fromTo(
      toastElement,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
    );
  }

  /**
   * Animasi klik / interaksi tombol instan
   */
  public animateButtonPress(buttonElement: HTMLElement): void {
    if (!buttonElement) return;

    gsap.timeline()
      .to(buttonElement, { scale: 0.96, duration: 0.1, ease: 'power1.in' })
      .to(buttonElement, { scale: 1, duration: 0.15, ease: 'power1.out' });
  }
}
