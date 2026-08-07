/**
 * UTC datetime helpers for free-text ISO fields + datetime-local pickers.
 * All values are treated as UTC (aerospace convention), not browser local.
 */

const PAD = (n: number) => String(n).padStart(2, '0')

/** True if `Date` parses to a finite instant. */
export function isValidDate(d: Date): boolean {
  return Number.isFinite(d.getTime())
}

/**
 * Resolve a free-text ISO (or empty) param to a Date.
 * Empty / invalid → `fallback` (typically `new Date()` = now).
 */
export function resolveUtcParam(raw: string, fallback: Date = new Date()): Date {
  const s = raw.trim()
  if (!s) return fallback
  const d = new Date(s)
  return isValidDate(d) ? d : fallback
}

/**
 * Format a Date as `YYYY-MM-DDTHH:mm:ss` using **UTC** components for
 * `<input type="datetime-local">` (we treat the control as UTC, not local).
 */
export function toUtcDatetimeLocalValue(d: Date): string {
  if (!isValidDate(d)) return ''
  return (
    `${d.getUTCFullYear()}-${PAD(d.getUTCMonth() + 1)}-${PAD(d.getUTCDate())}` +
    `T${PAD(d.getUTCHours())}:${PAD(d.getUTCMinutes())}:${PAD(d.getUTCSeconds())}`
  )
}

/**
 * Parse a datetime-local string as **UTC** and return canonical ISO-8601 (`…Z`).
 * Accepts `YYYY-MM-DDTHH:mm` or with seconds.
 */
export function fromUtcDatetimeLocalValue(local: string): string {
  const s = local.trim()
  if (!s) return ''
  // datetime-local may omit seconds
  const withSec = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? `${s}:00` : s
  const iso = withSec.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(withSec) ? withSec : `${withSec}Z`
  const d = new Date(iso)
  return isValidDate(d) ? d.toISOString() : s
}

/** Canonical UTC ISO for “now” (millisecond precision, trailing Z). */
export function nowUtcIso(): string {
  return new Date().toISOString()
}
