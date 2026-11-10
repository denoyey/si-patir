export interface ActivityLog {
  id: number;
  event_type: string;
  author: string;
  commit_message: string;
  task_code?: string;
  status: string;
  created_at: string;
}

/**
 * Formats an activity timestamp as compact HH:MM:SS for stream feeds.
 */
export function formatLogTime(timestamp: string): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch {
    return timestamp;
  }
}

/**
 * Formats an activity timestamp with date and time for the full history modal.
 */
export function formatLogDateTime(timestamp: string): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    const datePart = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${datePart} • ${timePart}`;
  } catch {
    return timestamp;
  }
}
