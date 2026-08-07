import { describe, expect, it } from 'vitest'
import {
  formatEditableNumber,
  formatLocaleNumber,
  getNumberSeparators,
  isPartialLocaleNumber,
  parseLocaleNumber,
  resolveIntlLocale,
} from './localeNumber'

describe('localeNumber', () => {
  it('resolves short codes to BCP 47', () => {
    expect(resolveIntlLocale('it')).toBe('it-IT')
    expect(resolveIntlLocale('de')).toBe('de-DE')
    expect(resolveIntlLocale('zh')).toBe('zh-CN')
  })

  it('detects comma decimal locales', () => {
    expect(getNumberSeparators('it').decimal).toBe(',')
    expect(getNumberSeparators('de').decimal).toBe(',')
    expect(getNumberSeparators('en').decimal).toBe('.')
  })

  it('parses Italian / German decimals', () => {
    expect(parseLocaleNumber('1,5', 'it')).toBeCloseTo(1.5)
    expect(parseLocaleNumber('1.234,5', 'de')).toBeCloseTo(1234.5)
    expect(parseLocaleNumber('6378,137', 'it')).toBeCloseTo(6378.137)
  })

  it('still accepts invariant ASCII (paste from code)', () => {
    expect(parseLocaleNumber('1.5', 'it')).toBeCloseTo(1.5)
    expect(parseLocaleNumber('3.986e14', 'en')).toBeCloseTo(3.986e14)
    // Comma locales must not treat 3.986 / 0.125 as thousands grouping
    expect(parseLocaleNumber('3.986', 'it')).toBeCloseTo(3.986)
    expect(parseLocaleNumber('0.125', 'de')).toBeCloseTo(0.125)
    expect(parseLocaleNumber('3.986e14', 'it')).toBeCloseTo(3.986e14)
    // Real thousands + locale decimal still work
    expect(parseLocaleNumber('1.234,5', 'it')).toBeCloseTo(1234.5)
    expect(parseLocaleNumber('1.234.567', 'de')).toBeCloseTo(1234567)
  })

  it('formats editable without grouping, locale decimal', () => {
    const it = formatEditableNumber(1.5, 'it')
    expect(it).toMatch(/1,5/)
    const en = formatEditableNumber(1.5, 'en')
    expect(en).toMatch(/1\.5/)
  })

  it('formats display with grouping where locale expects it', () => {
    const de = formatLocaleNumber(1234.5, 'de', 1)
    // de-DE typically 1.234,5
    expect(de).toMatch(/1\.234,5|1234,5/)
  })

  it('partial states for typing', () => {
    expect(isPartialLocaleNumber('', 'it')).toBe(true)
    expect(isPartialLocaleNumber(',', 'it')).toBe(true)
    expect(isPartialLocaleNumber('1,', 'it')).toBe(true)
    expect(isPartialLocaleNumber('1e-', 'en')).toBe(true)
  })
})
