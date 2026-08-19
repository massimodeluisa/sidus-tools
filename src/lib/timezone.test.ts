import { describe, expect, it } from 'vitest'
import {
  browserTimeZone,
  formatCountdown,
  formatInZone,
  isValidTimeZone,
  listTimeZones,
  utcOffsetLabel,
} from './timezone'

describe('timezone', () => {
  it('resolves a browser zone (falls back to UTC on failure)', () => {
    const tz = browserTimeZone()
    expect(typeof tz).toBe('string')
    expect(tz.length).toBeGreaterThan(0)
  })

  it('lists zones including UTC and Europe/Rome, sorted', () => {
    const zones = listTimeZones()
    expect(zones).toContain('UTC')
    expect(zones).toContain('Europe/Rome')
    const sorted = [...zones].sort((a, b) => a.localeCompare(b))
    expect(zones).toEqual(sorted)
  })

  it('validates IANA zone ids', () => {
    expect(isValidTimeZone('Europe/Rome')).toBe(true)
    expect(isValidTimeZone('UTC')).toBe(true)
    expect(isValidTimeZone('Not/AZone')).toBe(false)
    expect(isValidTimeZone('')).toBe(false)
  })

  describe('formatInZone: DST correctness', () => {
    // Europe/Rome: CET = UTC+1 (winter), CEST = UTC+2 (summer, EU DST).
    it('Europe/Rome in summer is CEST (UTC+2)', () => {
      const d = new Date('2026-07-15T12:00:00Z')
      // 12:00 UTC + 2h (CEST) = 14:00 local
      expect(formatInZone(d, 'Europe/Rome', 'en-US').time).toBe('14:00:00')
    })

    it('Europe/Rome in winter is CET (UTC+1)', () => {
      const d = new Date('2026-01-15T12:00:00Z')
      // 12:00 UTC + 1h (CET) = 13:00 local
      expect(formatInZone(d, 'Europe/Rome', 'en-US').time).toBe('13:00:00')
    })

    // US DST 2026 starts at 02:00 local (EST, UTC-5) on the second Sunday of
    // March. 2026-01-01 is a Thursday, so 2026-03-01 (Thu + 59 days, 59 % 7 = 3)
    // is a Sunday, making 2026-03-08 the second Sunday of March.
    // 02:00 EST = 07:00Z is the instant clocks spring forward to 03:00 EDT.
    it('America/New_York is EST (UTC-5) before the spring-forward instant', () => {
      const d = new Date('2026-03-08T06:30:00Z')
      // 06:30 UTC - 5h (EST) = 01:30 local
      expect(formatInZone(d, 'America/New_York', 'en-US').time).toBe('01:30:00')
    })

    it('America/New_York is EDT (UTC-4) after the spring-forward instant', () => {
      const d = new Date('2026-03-08T07:30:00Z')
      // 07:30 UTC - 4h (EDT) = 03:30 local; 02:00-03:00 local is skipped
      expect(formatInZone(d, 'America/New_York', 'en-US').time).toBe('03:30:00')
    })

    it('Asia/Kolkata has no DST (fixed UTC+5:30)', () => {
      const d = new Date('2026-07-15T12:00:00Z')
      // 12:00 UTC + 5:30 = 17:30 local
      expect(formatInZone(d, 'Asia/Kolkata', 'en-US').time).toBe('17:30:00')
    })

    it('UTC is the identity zone', () => {
      const d = new Date('2026-07-15T12:00:00Z')
      expect(formatInZone(d, 'UTC', 'en-US').time).toBe('12:00:00')
    })

    it('falls back to UTC for an invalid zone instead of throwing', () => {
      const d = new Date('2026-07-15T12:00:00Z')
      expect(() => formatInZone(d, 'Not/AZone', 'en-US')).not.toThrow()
      expect(formatInZone(d, 'Not/AZone', 'en-US').time).toBe('12:00:00')
    })
  })

  describe('utcOffsetLabel', () => {
    it('reflects the DST-aware offset, no manual math', () => {
      expect(utcOffsetLabel(new Date('2026-07-15T12:00:00Z'), 'Europe/Rome')).toBe('GMT+2')
      expect(utcOffsetLabel(new Date('2026-01-15T12:00:00Z'), 'Europe/Rome')).toBe('GMT+1')
      expect(utcOffsetLabel(new Date('2026-03-08T06:30:00Z'), 'America/New_York')).toBe('GMT-5')
      expect(utcOffsetLabel(new Date('2026-03-08T07:30:00Z'), 'America/New_York')).toBe('GMT-4')
      expect(utcOffsetLabel(new Date('2026-07-15T12:00:00Z'), 'UTC')).toBe('GMT+0')
    })
  })

  describe('formatCountdown', () => {
    it('decomposes a positive duration', () => {
      // 1h 2m 3s = 3723000 ms
      expect(formatCountdown(3723000)).toEqual({ sign: 1, h: 1, m: 2, s: 3 })
    })

    it('decomposes a negative duration (past instant)', () => {
      expect(formatCountdown(-3723000)).toEqual({ sign: -1, h: 1, m: 2, s: 3 })
    })

    it('handles zero', () => {
      expect(formatCountdown(0)).toEqual({ sign: 1, h: 0, m: 0, s: 0 })
    })

    it('truncates sub-second remainders', () => {
      expect(formatCountdown(1999)).toEqual({ sign: 1, h: 0, m: 0, s: 1 })
      expect(formatCountdown(-1999)).toEqual({ sign: -1, h: 0, m: 0, s: 1 })
    })
  })
})
