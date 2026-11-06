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
      className={`fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] right-3 sm:right-6 z-40 w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-zinc-950/85 hover:bg-zinc-800 dark:bg-white/90 dark:hover:bg-white text-white dark:text-zinc-950 shadow-md border border-zinc-700/60 dark:border-zinc-300 backdrop-blur-xs transition-all duration-300 flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 ${
        isVisible
          ? 'opacity-85 sm:opacity-90 hover:opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
    </button>
  );
}
