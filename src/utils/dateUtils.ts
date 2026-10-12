import { TaskRecurrence } from '../types/garden';

/**
 * Returns user's local calendar date formatted as YYYY-MM-DD.
 * Uses en-CA locale which outputs standard ISO YYYY-MM-DD without UTC timezone drift.
 */
export function getLocalTodayDate(): string {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

/**
 * Parses YYYY-MM-DD safely into [year, month, day] without UTC hour shifts.
 */
function parseDateParts(dateStr: string): [number, number, number] {
  const parts = dateStr.split('-').map((p) => parseInt(p, 10));
  if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return [parts[0], parts[1], parts[2]];
  }
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()];
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string safely in local time.
 */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = parseDateParts(dateStr);
  const date = new Date(year, month - 1, day + days);
  return new Intl.DateTimeFormat('en-CA').format(date);
}

/**
 * Adds months to a YYYY-MM-DD string, clamping to month end if needed.
 */
export function addMonths(dateStr: string, months: number): string {
  const [year, month, day] = parseDateParts(dateStr);
  const date = new Date(year, month - 1 + months, day);
  return new Intl.DateTimeFormat('en-CA').format(date);
}

/**
 * Calculates the next occurrence date for recurring tasks.
 */
export function calculateNextOccurrenceDate(
  baseDateStr: string,
  recurrence?: TaskRecurrence
): string {
  if (!recurrence || recurrence === 'none') {
    return baseDateStr;
  }
  switch (recurrence) {
    case 'daily':
      return addDays(baseDateStr, 1);
    case 'weekly':
      return addDays(baseDateStr, 7);
    case 'monthly':
      return addMonths(baseDateStr, 1);
    default:
      return baseDateStr;
  }
}

export type TaskTimeClassification = 'completed' | 'overdue' | 'today' | 'upcoming';

/**
 * Classifies a task based on its due date and completion status.
 */
export function classifyTask(
  dueDate: string,
  completed: boolean,
  todayStr: string = getLocalTodayDate()
): TaskTimeClassification {
  if (completed) {
    return 'completed';
  }
  if (!dueDate || dueDate < todayStr) {
    return 'overdue';
  }
  if (dueDate === todayStr) {
    return 'today';
  }
  return 'upcoming';
}

/**
 * Formats a local YYYY-MM-DD string into a human-friendly display label.
 */
export function formatDisplayDate(
  dateStr: string,
  timeStr?: string,
  todayStr: string = getLocalTodayDate()
): string {
  if (!dateStr) return 'Unscheduled';

  const [year, month, day] = parseDateParts(dateStr);
  const dateObj = new Date(year, month - 1, day);
  const timeSuffix = timeStr ? ` at ${formatDisplayTime(timeStr)}` : '';

  if (dateStr === todayStr) {
    return `Today${timeSuffix}`;
  }

  const tomorrowStr = addDays(todayStr, 1);
  if (dateStr === tomorrowStr) {
    return `Tomorrow${timeSuffix}`;
  }

  const yesterdayStr = addDays(todayStr, -1);
  if (dateStr === yesterdayStr) {
    return `Yesterday (Overdue)${timeSuffix}`;
  }

  if (dateStr < todayStr) {
    const formatted = dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    return `Overdue (${formatted})${timeSuffix}`;
  }

  const formatted = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${formatted}${timeSuffix}`;
}

/**
 * Formats HH:MM (24h) to 12h AM/PM format.
 */
export function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  const displayMinutes = m < 10 ? `0${m}` : `${m}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Formats today's date for display in the page header.
 * e.g. "Saturday, October 10, 2026"
 */
export function formatHeaderDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Parses a journal entry date (YYYY-MM-DD, ISO string, or 'Month DD, YYYY') into an epoch timestamp.
 * Returns 0 if unparseable.
 */
export function parseJournalEntryTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Checks if a given date string belongs to the current calendar month and year.
 */
export function isDateInCurrentMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m] = dateStr.split('-').map(Number);
    return y === currentYear && m - 1 === currentMonth;
  }

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;
  return parsed.getFullYear() === currentYear && parsed.getMonth() === currentMonth;
}

/**
 * Formats a journal date string into a consistent, readable presentation format like 'March 27, 2026'.
 */
export function formatJournalDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Undated';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateStr;
}
