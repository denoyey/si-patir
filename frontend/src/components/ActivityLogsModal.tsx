import { useState, useEffect, useMemo } from 'react';
import { Activity, Search, X } from 'lucide-react';
import { useBodyScrollLock } from '../services/scroll/hooks/useBodyScrollLock';
import { ActivityLogItem } from './ActivityLogItem';
import type { ActivityLog } from '../utils/logFormatters';

interface ActivityLogsModalProps {
  isOpen: boolean;
  logs: ActivityLog[];
  authors: string[];
  initialSearchQuery?: string;
  initialAuthorFilter?: string;
  onClose: () => void;
}

interface ActivityLogsModalContentProps {
  logs: ActivityLog[];
  authors: string[];
  initialSearchQuery: string;
  initialAuthorFilter: string;
  onClose: () => void;
}

function ActivityLogsModalContent({
  logs,
  authors,
  initialSearchQuery,
  initialAuthorFilter,
  onClose,
}: ActivityLogsModalContentProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [authorFilter, setAuthorFilter] = useState(initialAuthorFilter);
  const [eventFilter, setEventFilter] = useState<'ALL' | 'PUSH' | 'TASK'>('ALL');

  const authorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
      const key = log.author.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      const matchSearch =
        !q ||
        log.commit_message.toLowerCase().includes(q) ||
        log.author.toLowerCase().includes(q) ||
        log.event_type.toLowerCase().includes(q) ||
        (log.task_code && log.task_code.toLowerCase().includes(q));

      const matchAuthor =
        authorFilter === 'ALL' || log.author.toLowerCase() === authorFilter.toLowerCase();

      const matchEvent =
        eventFilter === 'ALL' ||
        (eventFilter === 'TASK'
          ? log.event_type === 'TASK_COMPLETED'
          : log.event_type !== 'TASK_COMPLETED');

      return matchSearch && matchAuthor && matchEvent;
    });
  }, [logs, searchQuery, authorFilter, eventFilter]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-none flex items-center justify-center p-3 sm:p-5 overscroll-contain"
      data-lenis-prevent
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-logs-modal-title"
    >
      <div
        data-lenis-prevent
        className="w-full max-w-3xl bg-white dark:bg-[#0c0f17] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl flex flex-col max-h-[88vh] overflow-hidden overscroll-contain"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121623] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2
              id="all-logs-modal-title"
              className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white truncate"
            >
              Riwayat Aktivitas Webhook
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
              {filteredLogs.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup riwayat log"
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3.5 sm:px-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0e121b]/60 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                id="modal-log-search"
                name="modal_log_search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari commit, #TASK, atau author..."
                autoComplete="off"
                aria-label="Cari riwayat aktivitas"
                className="w-full h-8 pl-8 pr-7 rounded-md bg-white dark:bg-[#090b10] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs font-mono focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/80 p-0.5 rounded-md text-[11px] font-mono shrink-0 self-start sm:self-auto">
              {(['ALL', 'PUSH', 'TASK'] as const).map((ev) => (
                <button
                  key={ev}
                  type="button"
                  onClick={() => setEventFilter(ev)}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    eventFilter === ev
                      ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white font-semibold shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {ev === 'ALL' ? 'Semua' : ev === 'PUSH' ? 'Push' : 'Task'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setAuthorFilter('ALL')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer border ${
                authorFilter === 'ALL'
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold border-zinc-950 dark:border-white shadow-2xs'
                  : 'bg-white dark:bg-[#090b10] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              Semua ({logs.length})
            </button>
            {authors.map((author) => {
              const isSelected = authorFilter.toLowerCase() === author.toLowerCase();
              const count = authorCounts.get(author.toLowerCase()) ?? 0;
              return (
                <button
                  key={author}
                  type="button"
                  onClick={() => setAuthorFilter(isSelected ? 'ALL' : author)}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer border ${
                    isSelected
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold border-zinc-950 dark:border-white shadow-2xs'
                      : 'bg-white dark:bg-[#090b10] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  @{author} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Full Log Feed */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-scroll divide-y divide-zinc-100 dark:divide-zinc-800/60"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-14 px-4 text-zinc-400 dark:text-zinc-600 text-xs space-y-2">
              <p>Tidak ada log yang cocok dengan filter.</p>
              {(searchQuery || authorFilter !== 'ALL' || eventFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setAuthorFilter('ALL');
                    setEventFilter('ALL');
                  }}
                  className="text-blue-600 dark:text-blue-400 underline cursor-pointer text-[11px]"
                >
                  Reset semua filter
                </button>
              )}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <ActivityLogItem key={log.id} log={log} compact={false} showDate />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#121623] flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
          <span>
            <strong className="text-zinc-900 dark:text-white">{filteredLogs.length}</strong> dari{' '}
            <strong className="text-zinc-900 dark:text-white">{logs.length}</strong> log
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-sans font-medium text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen/wide modal displaying the complete searchable webhook activity history.
 */
export function ActivityLogsModal({
  isOpen,
  logs,
  authors,
  initialSearchQuery = '',
  initialAuthorFilter = 'ALL',
  onClose,
}: ActivityLogsModalProps) {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ActivityLogsModalContent
      logs={logs}
      authors={authors}
      initialSearchQuery={initialSearchQuery}
      initialAuthorFilter={initialAuthorFilter}
      onClose={onClose}
    />
  );
}

