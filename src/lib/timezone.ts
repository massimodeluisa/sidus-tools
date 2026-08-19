/**
 * IANA-timezone-aware date/time formatting.
 * Every conversion goes through `Intl` with IANA zone ids: no manual
 * UTC-offset arithmetic anywhere in this module.
 */

/** ~30 common IANA zones, used only when `Intl.supportedValuesOf` is unavailable. */
const FALLBACK_TIME_ZONES = [
  'UTC',
  'Europe/Rome',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Europe/Athens',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Mexico_City',
  'America/Bogota',
  'America/Sao_Paulo',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Honolulu',
  'Africa/Cairo',
  'Africa/Nairobi',
]

/** Browser-resolved IANA zone id, falling back to `'UTC'` if resolution fails. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

/** Sorted list of supported IANA zone ids (always includes `'UTC'`). */
export function listTimeZones(): string[] {
  const zones =
    typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('timeZone')
      : FALLBACK_TIME_ZONES
  const withUtc = zones.includes('UTC') ? zones : [...zones, 'UTC']
  return [...withUtc].sort((a, b) => a.localeCompare(b))
}

/** True if `tz` is a zone id `Intl` can resolve. */
export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/**
 * Format an instant in a given IANA zone.
 * Invalid `tz` falls back to `'UTC'`; never throws.
 */
export function formatInZone(
  d: Date,
  tz: string,
  locale: string,
): { date: string; time: string; zoneAbbr: string } {
  const zone = isValidTimeZone(tz) ? tz : 'UTC'
  const date = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
  const time = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    numberingSystem: 'latn',
  }).format(d)
  const zoneAbbr =
    new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: 'short' })
      .formatToParts(d)
      .find((p) => p.type === 'timeZoneName')?.value ?? zone
  return { date, time, zoneAbbr }
}

/** UTC offset label (e.g. `'GMT+2'`) for an instant in a given zone. */
export function utcOffsetLabel(d: Date, tz: string): string {
  const zone = isValidTimeZone(tz) ? tz : 'UTC'
  for (const style of ['shortOffset', 'short'] as const) {
    try {
      const part = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        timeZoneName: style,
      })
        .formatToParts(d)
        .find((p) => p.type === 'timeZoneName')
      if (part) return part.value
    } catch {
      // 'shortOffset' unsupported: fall through to 'short'
    }
  }
  return 'UTC'
}

/** Sign + hour/minute/second decomposition of a millisecond duration. */
export function formatCountdown(ms: number): { sign: 1 | -1; h: number; m: number; s: number } {
  const sign: 1 | -1 = ms < 0 ? -1 : 1
  const totalSeconds = Math.trunc(Math.abs(ms) / 1000)
  const h = Math.trunc(totalSeconds / 3600)
  const m = Math.trunc((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return { sign, h, m, s }
}
