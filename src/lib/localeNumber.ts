/**
 * Locale-aware number parse / format for UI inputs.
 *
 * JS `Number()` / `String(n)` always use `.` as decimal: they ignore browser
 * and app locale. SIDUS inputs must accept `1,5` (it/de/fr/es/…) and display
 * with the active i18n locale separators.
 *
 * URL search params stay invariant (dot decimal) via numParam: only the
 * field chrome is localized.
 */

export type NumberSeparators = { decimal: string; group: string }

const sepCache = new Map<string, NumberSeparators>()

/** Resolve BCP 47 tag for Intl (e.g. `it` → `it-IT` when short). */
export function resolveIntlLocale(locale: string | undefined | null): string {
  const raw = (locale ?? 'en').trim() || 'en'
  if (raw.includes('-') || raw.includes('_')) return raw.replace('_', '-')
  const map: Record<string, string> = {
    en: 'en-US',
    it: 'it-IT',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    ru: 'ru-RU',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    pt: 'pt-BR',
    hi: 'hi-IN',
    ar: 'ar-SA',
  }
  return map[raw.slice(0, 2).toLowerCase()] ?? raw
}

export function getNumberSeparators(locale: string): NumberSeparators {
  const tag = resolveIntlLocale(locale)
  const hit = sepCache.get(tag)
  if (hit) return hit
  try {
    const parts = new Intl.NumberFormat(tag).formatToParts(12345.6)
    const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.'
    const group = parts.find((p) => p.type === 'group')?.value ?? ','
    const sep = { decimal, group }
    sepCache.set(tag, sep)
    return sep
  } catch {
    return { decimal: '.', group: ',' }
  }
}

/** Intermediate typing states while the user edits a decimal field. */
export function isPartialLocaleNumber(s: string, locale: string): boolean {
  const t = s.trim()
  if (t === '' || t === '-' || t === '+' || t === '.' || t === '-.' || t === '+.') return true
  const { decimal } = getNumberSeparators(locale)
  if (decimal !== '.' && (t === decimal || t === `-${decimal}` || t === `+${decimal}`)) return true
  // trailing decimal / exponent in progress: "1,", "1.e", "1e-", "1,5e"
  if (new RegExp(`[eE][+-]?$`).test(t)) return true
  if (t.endsWith(decimal) && !/[eE]/.test(t)) return true
  return false
}

/**
 * Normalize a mantissa string to JS `Number()` form (dot decimal, no groups).
 * Handles:
 * - en: 1,234.5
 * - it/de: 1.234,5  or 1,5
 * - ASCII paste in any locale: 1.5 / 3.986
 */
function normalizeMantissa(raw: string, decimal: string, group: string): string {
  let s = raw
  const body = s.replace(/^[+-]/, '')
  const sign = s.startsWith('-') ? '-' : s.startsWith('+') ? '+' : ''

  // en-US style grouping
  if (decimal === '.' && group === ',') {
    return sign + body.split(',').join('')
  }

  // Comma-decimal locales (it, de, fr, es, …): group is often '.'
  if (decimal === ',') {
    // Thousands with optional comma fraction: 1.234.567 or 1.234,56
    // Require either 2+ dotted groups, or a trailing comma-decimal part.
    // Do NOT treat a single "3.986" as thousands — that is ASCII paste (μ, e, …).
    if (/^\d{1,3}(\.\d{3}){2,}(,\d*)?$/.test(body)) {
      return sign + body.replace(/\./g, '').replace(',', '.')
    }
    if (/^\d{1,3}(\.\d{3})+,\d*$/.test(body)) {
      return sign + body.replace(/\./g, '').replace(',', '.')
    }
    // Locale decimal only: 1,5 or 6378,137
    if (body.includes(',')) {
      // Drop any dots that slipped in, map comma → dot
      return sign + body.replace(/\./g, '').replace(',', '.')
    }
    // ASCII / code paste: 1.5, 3.986, 0.125 — keep dots as decimal
    return sign + body
  }

  // Generic fallback
  if (group && body.includes(group)) {
    s = sign + body.split(group).join('')
  } else {
    s = sign + body
  }
  if (decimal !== '.' && s.includes(decimal)) {
    const i = s.lastIndexOf(decimal)
    s = s.slice(0, i) + '.' + s.slice(i + decimal.length)
  }
  return s
}

/**
 * Parse user input using locale decimal/group separators.
 * Also accepts invariant ASCII forms (`1.5`, `1e3`) so paste from code works
 * even when the active locale uses a comma decimal (it/de/fr/es/…).
 */
export function parseLocaleNumber(input: string, locale: string): number | null {
  let s = input.trim().replace(/\u00a0/g, ' ').replace(/\s/g, '')
  if (!s || s === '-' || s === '+') return null

  const { decimal, group } = getNumberSeparators(locale)

  // Scientific: normalize mantissa, keep e/E exponent
  const expMatch = s.match(/^([+-]?[0-9.,]+)([eE][+-]?\d*)$/)
  let exp = ''
  if (expMatch) {
    s = expMatch[1]!
    exp = expMatch[2]!
    if (/[eE][+-]?$/.test(exp)) return null // incomplete exponent
  }

  s = normalizeMantissa(s, decimal, group)
  const n = Number(s + exp)
  return Number.isFinite(n) ? n : null
}

/**
 * Format a finite number for an editable field (no grouping: easier caret).
 * Uses active locale decimal separator.
 */
export function formatEditableNumber(n: number, locale: string): string {
  if (!Number.isFinite(n)) return ''
  if (Object.is(n, -0) || n === 0) return '0'
  const tag = resolveIntlLocale(locale)
  const abs = Math.abs(n)
  if (abs >= 1e15 || (abs > 0 && abs < 1e-6)) {
    // scientific: keep ASCII e-notation (standard for engineering inputs)
    return n.toExponential()
  }
  try {
    return new Intl.NumberFormat(tag, {
      useGrouping: false,
      maximumFractionDigits: 15,
    }).format(n)
  } catch {
    return String(n)
  }
}

/**
 * Format a number for result display (grouping + digit cap).
 * Scientific for very large / small values.
 */
export function formatLocaleNumber(
  n: number,
  locale: string,
  digits = 4,
): string {
  if (!Number.isFinite(n)) return ': '
  if (Math.abs(n) === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e6 || (abs > 0 && abs < 1e-3)) return n.toExponential(digits)
  const tag = resolveIntlLocale(locale)
  try {
    return new Intl.NumberFormat(tag, { maximumFractionDigits: digits }).format(n)
  } catch {
    return n.toLocaleString(undefined, { maximumFractionDigits: digits })
  }
}
