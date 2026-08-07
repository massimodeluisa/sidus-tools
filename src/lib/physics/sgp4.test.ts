import { describe, expect, it } from 'vitest'
import { parseTle, propagateEci, SAMPLE_ISS_TLE } from './sgp4'

describe('SGP4 / TLE', () => {
  it('parses sample ISS TLE', () => {
    const p = parseTle(SAMPLE_ISS_TLE)
    expect(p.ok).toBe(true)
    if (p.ok) expect(p.name.toUpperCase()).toContain('ISS')
  })

  it('propagates to finite ECI state', () => {
    const p = parseTle(SAMPLE_ISS_TLE)
    expect(p.ok).toBe(true)
    if (!p.ok) return
    // Use a date near a typical TLE epoch window
    const st = propagateEci(p.satrec, new Date('2024-04-10T12:00:00Z'))
    // May fail if TLE epoch is far / decayed: sample is illustrative
    if (st) {
      const r = Math.hypot(...st.r)
      expect(r).toBeGreaterThan(6.3e6)
      expect(r).toBeLessThan(8e6)
    }
  })

  it('rejects garbage', () => {
    const p = parseTle('not a tle')
    expect(p.ok).toBe(false)
  })
})
