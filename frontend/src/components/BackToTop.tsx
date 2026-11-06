import { ArrowUp } from 'lucide-react';
import { useLenisScroll } from '../services/scroll/hooks/useLenisScroll';

export function BackToTop() {
  const { scroll, scrollToTop } = useLenisScroll();
  const isVisible = scroll > 250;

  return (
    <button
      type="button"
      onClick={() => scrollToTop(1.0)}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className={`fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] right-3 sm:right-6 z-50 p-2 sm:p-2.5 rounded-md bg-zinc-950/90 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 shadow-lg border border-zinc-700/60 dark:border-zinc-300 backdrop-blur-xs transition-all duration-300 flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 shrink-0" />
    </button>
  );
}
