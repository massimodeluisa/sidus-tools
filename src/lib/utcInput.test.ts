import { describe, expect, it } from 'vitest'
import {
  fromUtcDatetimeLocalValue,
  resolveUtcParam,
  toUtcDatetimeLocalValue,
} from './utcInput'

describe('utcInput', () => {
  it('round-trips UTC datetime-local without shifting timezone', () => {
    const iso = '2026-08-10T08:23:13.000Z'
    const d = new Date(iso)
    const local = toUtcDatetimeLocalValue(d)
    expect(local).toBe('2026-08-10T08:23:13')
    expect(fromUtcDatetimeLocalValue(local)).toBe(iso)
  })

  it('accepts minute-precision picker values', () => {
    expect(fromUtcDatetimeLocalValue('2026-01-01T00:00')).toBe('2026-01-01T00:00:00.000Z')
  })

  it('resolveUtcParam uses fallback for empty', () => {
    const fb = new Date('2020-01-01T00:00:00.000Z')
    expect(resolveUtcParam('', fb).toISOString()).toBe(fb.toISOString())
  })

  it('resolveUtcParam parses ISO free text', () => {
    const d = resolveUtcParam('2026-08-10T12:00:00Z')
    expect(d.toISOString()).toBe('2026-08-10T12:00:00.000Z')
  })
})
