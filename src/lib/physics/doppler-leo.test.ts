import { describe, expect, it } from 'vitest'
import { C, EARTH_MU, EARTH_RADIUS } from './constants'
import { circularHorizonRangeRate, dopplerShiftHz, overheadDopplerRateHz } from './discovery-wave'

describe('circular horizon Doppler', () => {
  const altitudeM = 420_000

  it('keeps fd = f0 * vr / c, positive when approaching', () => {
    expect(dopplerShiftHz(2e9, 1000)).toBeCloseTo((2e9 * 1000) / C, 6)
    expect(dopplerShiftHz(2e9, -1000)).toBeLessThan(0)
    expect(dopplerShiftHz(0, 1000)).toBeNull()
  })

  it('horizon range rate is v_orb * R / (R + h), about 7.2 km/s at 420 km', () => {
    const radius = EARTH_RADIUS + altitudeM
    const speed = Math.sqrt(EARTH_MU / radius)
    const rdot = circularHorizonRangeRate(altitudeM)
    expect(rdot).toBeCloseTo(speed * (EARTH_RADIUS / radius), 6)
    expect(rdot).toBeGreaterThan(7000)
    expect(rdot).toBeLessThan(7500)
    expect(circularHorizonRangeRate(0)).toBeNull()
  })

  it('horizon |fd| is a few kHz at 145.8 MHz and about 50 kHz at 2.2 GHz', () => {
    const rdot = circularHorizonRangeRate(altitudeM)
    expect(rdot).not.toBeNull()
    const vhf = dopplerShiftHz(145.8e6, rdot!)
    const sband = dopplerShiftHz(2.2e9, rdot!)
    expect(vhf).toBeGreaterThan(3000)
    expect(vhf).toBeLessThan(4000)
    expect(sband).toBeGreaterThan(50_000)
    expect(sband).toBeLessThan(56_000)
  })

  it('overhead Doppler rate is negative through closest approach', () => {
    const rate = overheadDopplerRateHz(145.8e6, altitudeM)
    expect(rate).not.toBeNull()
    expect(rate!).toBeLessThan(0)
    const radius = EARTH_RADIUS + altitudeM
    const speed = Math.sqrt(EARTH_MU / radius)
    expect(rate).toBeCloseTo((-145.8e6 * speed * speed) / (C * altitudeM), 6)
    expect(overheadDopplerRateHz(0, altitudeM)).toBeNull()
  })
})
