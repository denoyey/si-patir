export interface ActivityLog {
  id: number;
  event_type: string;
  author: string;
  commit_message: string;
  task_code?: string;
  status: string;
  created_at: string;
}

const SHORT_DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;
const FULL_DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
const SHORT_MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] as const;

function parseTimestamp(timestamp: string): Date | null {
  if (!timestamp) return null;
  const direct = new Date(timestamp);
  if (!isNaN(direct.getTime())) return direct;

  // Safari fallback for SQL datetime "YYYY-MM-DD HH:mm:ss"
  const normalized = new Date(timestamp.replace(' ', 'T'));
  return isNaN(normalized.getTime()) ? null : normalized;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Formats an activity timestamp as compact Indonesian short day + time (e.g. "Sel, 19:14").
 */
export function formatLogTime(timestamp: string): string {
  const d = parseTimestamp(timestamp);
  if (!d) return timestamp || '';
  const day = SHORT_DAYS_ID[d.getDay()];
  return `${day}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Formats an activity timestamp with Indonesian short day, date, and time (e.g. "Sel, 10 Nov • 19:14").
 */
export function formatLogDateTime(timestamp: string): string {
  const d = parseTimestamp(timestamp);
  if (!d) return timestamp || '';
  const day = SHORT_DAYS_ID[d.getDay()];
  const month = SHORT_MONTHS_ID[d.getMonth()];
  return `${day}, ${pad2(d.getDate())} ${month} • ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Formats full hover tooltip timestamp in Indonesian (e.g. "Selasa, 10 Nov 2026 • 19:14:22").
 */
export function formatLogFullTitle(timestamp: string): string {
  const d = parseTimestamp(timestamp);
  if (!d) return timestamp || '';
  const day = FULL_DAYS_ID[d.getDay()];
  const month = SHORT_MONTHS_ID[d.getMonth()];
  return `${day}, ${d.getDate()} ${month} ${d.getFullYear()} • ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
