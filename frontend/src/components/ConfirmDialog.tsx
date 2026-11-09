import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';
import { useBodyScrollLock } from '../services/scroll/hooks/useBodyScrollLock';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll and pause Lenis while confirm dialog is open
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-none flex items-center justify-center p-4 overscroll-contain"
      data-lenis-prevent
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-dialog-title"
      aria-describedby="custom-dialog-description"
    >
      <div
        ref={dialogRef}
        data-lenis-prevent
        className="w-full max-w-md bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 sm:p-6 shadow-2xl relative transition-all animate-in fade-in zoom-in-95 duration-150 overscroll-contain"
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Tutup dialog"
          className="absolute top-4 right-4 p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer active:scale-95 disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* Status Icon */}
          <div
            className={`p-2.5 rounded-md shrink-0 mt-0.5 border ${
              isDanger
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                : isWarning
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-5 h-5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-4">
            <h3
              id="custom-dialog-title"
              className="text-sm sm:text-base font-semibold text-zinc-950 dark:text-white tracking-tight"
            >
              {title}
            </h3>
            <p
              id="custom-dialog-description"
              className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed"
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-8.5 px-3.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 active:scale-95 transition cursor-pointer text-xs font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-8.5 px-4 rounded-md font-semibold text-xs transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
