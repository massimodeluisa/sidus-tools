import { formatLocaleNumber } from '../localeNumber'

/**
 * Format a number for UI results.
 * Language: <html lang> when present (set by the i18n shell), else `en`.
 * Kept free of a hard i18n/React import so pure-SI / MCP bundles stay node-safe.
 */
function activeLng(): string {
  try {
    if (typeof document !== 'undefined') {
      const lang = document.documentElement?.lang?.slice(0, 2)
      if (lang) return lang
    }
  } catch {
    /* node / tests */
  }
  return 'en'
}

export function formatNumber(n: number, digits = 4): string {
  return formatLocaleNumber(n, activeLng(), digits)
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return ': '
  if (seconds < 60) return `${formatNumber(seconds, 2)} s`
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} min ${formatNumber(seconds % 60, 1)} s`
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h} h ${m} min`
  }
  if (seconds < 86400 * 365.25) return `${formatNumber(seconds / 86400, 3)} d`
  return `${formatNumber(seconds / (86400 * 365.25), 4)} yr`
}

export function formatVelocity(ms: number): string {
  if (!Number.isFinite(ms)) return ': '
  return `${formatNumber(ms, 3)} m/s  (${formatNumber(ms / 1000, 4)} km/s)`
}

export function formatLength(m: number): string {
  if (!Number.isFinite(m)) return ': '
  if (Math.abs(m) >= 1e9) return `${formatNumber(m / 1e9, 4)} Gm`
  if (Math.abs(m) >= 1e6) return `${formatNumber(m / 1e6, 4)} Mm`
  if (Math.abs(m) >= 1000) return `${formatNumber(m / 1000, 3)} km`
  return `${formatNumber(m, 3)} m`
}
