import { useEffect } from 'react';
import { LenisScrollEngine } from '../LenisScrollEngine';

let lockCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalBodyTouchAction = '';

/**
 * useBodyScrollLock
 * Prevents background body and document scrolling when a modal or overlay is open.
 * Uses reference counting so nested/stacked modals safely maintain the lock.
 * Integrates with LenisScrollEngine to pause and resume smooth scroll appropriately.
 */
export function useBodyScrollLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;

    if (lockCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      originalHtmlOverflow = document.documentElement.style.overflow;
      originalBodyTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      LenisScrollEngine.getInstance().stop();
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
        LenisScrollEngine.getInstance().start();
      }
    };
  }, [isLocked]);
}
