import { useState, useRef, useEffect } from 'react';
import { Monitor, Sun, Moon, Check } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const options: { mode: ThemeMode; label: string; icon: typeof Monitor }[] = [
    { mode: 'system', label: 'Sistem (Otomatis)', icon: Monitor },
    { mode: 'light', label: 'Mode Terang (Light)', icon: Sun },
    { mode: 'dark', label: 'Mode Gelap (Dark)', icon: Moon },
  ];

  const currentOption = options.find((opt) => opt.mode === theme) || options[0];
  const CurrentIcon = currentOption.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Tema: ${currentOption.label}`}
        title={`Tema: ${currentOption.label}`}
        className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-md bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-95 flex items-center justify-center transition cursor-pointer touch-manipulation shadow-xs"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-200 shrink-0" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Pilihan tema tampilan"
          className="absolute right-0 mt-1.5 w-44 rounded-md bg-white dark:bg-[#12151f] border border-zinc-200 dark:border-zinc-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
            Tema Tampilan
          </div>
          {options.map(({ mode, label, icon: Icon }) => {
            const isActive = theme === mode;
            return (
              <button
                key={mode}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(mode);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs flex items-center justify-between text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
