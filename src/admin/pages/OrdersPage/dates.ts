import { pad } from '../DashboardPage/dashboard'

/** "14:05" — also the value format of `<input type="time">`. */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** "2026.09.25" */
export function formatDate(date: Date): string {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

/** "2026.09.25 14:05" */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

/** "09.25 14:05" (order lists), or "—" while the server time is not known yet. */
export function formatShortDateTime(date: Date | null): string {
  if (!date) return '—'
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${formatTime(date)}`
}

/** "2026-09-25" — the value format of `<input type="date">` (local day); empty without a date. */
export function toDateInput(date: Date | null): string {
  if (!date) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Local time from `<input type="date">` and `<input type="time">` values; `null` if either is empty or invalid. */
export function fromDateInput(day: string, time = '00:00'): Date | null {
  const dayParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  const timeParts = /^(\d{2}):(\d{2})/.exec(time)
  if (!dayParts || !timeParts) return null
  const [, year, month, date] = dayParts.map(Number)
  const [, hours, minutes] = timeParts.map(Number)
  const result = new Date(year, month - 1, date, hours, minutes)
  return Number.isNaN(result.getTime()) ? null : result
}
