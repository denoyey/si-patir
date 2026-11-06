import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: typeof Monitor }[] = [
    { mode: 'system', label: 'Sistem Otomatis (Komputer)', icon: Monitor },
    { mode: 'light', label: 'Mode Terang (Light)', icon: Sun },
    { mode: 'dark', label: 'Mode Gelap (Dark)', icon: Moon },
  ];

  return (
    <div className="flex items-center p-0.5 rounded-md bg-zinc-200/90 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700/80 text-xs shadow-xs transition-colors">
      {options.map(({ mode, label, icon: Icon }) => {
        const isActive = theme === mode;
        return (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            title={label}
            aria-label={label}
            className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer touch-manipulation ${
              isActive
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-medium'
                : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

