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
      className={`fixed bottom-6 right-6 z-50 p-2.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 shadow-md border border-zinc-700/60 dark:border-zinc-300 transition-all duration-300 flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 shrink-0" />
    </button>
  );
}

