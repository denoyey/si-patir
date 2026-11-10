import type { Ref } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AvatarWithFallback } from './AvatarWithFallback';
import { type ActivityLog, formatLogTime, formatLogDateTime } from '../utils/logFormatters';

interface ActivityLogItemProps {
  log: ActivityLog;
  compact?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showDate?: boolean;
  itemRef?: Ref<HTMLDivElement>;
}

/**
 * Shared activity log row rendered in both the compact sidebar stream and the full log history modal.
 */
export function ActivityLogItem({
  log,
  compact = false,
  isExpanded = false,
  onToggleExpand,
  showDate = false,
  itemRef,
}: ActivityLogItemProps) {
  const isTaskCompleted = log.event_type === 'TASK_COMPLETED';
  const shouldClamp = compact && !isExpanded;
  const formattedTime = showDate ? formatLogDateTime(log.created_at) : formatLogTime(log.created_at);

  return (
    <div
      ref={itemRef}
      className="p-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors flex items-start gap-2.5"
    >
      <AvatarWithFallback
        username={log.author}
        name={log.author}
        className="w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 shrink-0 mt-0.5 object-cover"
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              @{log.author}
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium shrink-0 ${
                isTaskCompleted
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {isTaskCompleted ? 'TASK' : 'PUSH'}
            </span>
          </div>

          <span
            className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0"
            title={log.created_at}
          >
            {formattedTime}
          </span>
        </div>

        {compact && onToggleExpand ? (
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-full text-left cursor-pointer group/msg focus:outline-hidden"
            title={isExpanded ? 'Ringkas pesan' : 'Klik untuk pesan lengkap'}
          >
            <p
              className={`text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-snug break-words group-hover/msg:text-zinc-950 dark:group-hover/msg:text-white transition-colors ${
                shouldClamp ? 'line-clamp-2' : ''
              }`}
            >
              {log.commit_message}
            </p>
          </button>
        ) : (
          <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-snug break-words">
            {log.commit_message}
          </p>
        )}

        {log.task_code && (
          <div className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>#{log.task_code} selesai</span>
          </div>
        )}
      </div>
    </div>
  );
}
