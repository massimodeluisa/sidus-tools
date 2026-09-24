import { describe, expect, it } from 'vitest'
import { EARTH_MU, EARTH_RADIUS } from './constants'
import {
  antennaBeamwidth,
  coellipticDrift,
  deorbitBurn,
  deltaVBudget,
  equalStageMassRatio,
  normalizeEqualStageCount,
  horizonSlantRange,
  losRangeRate,
  meanMotionFromAltitude,
  oberthCompare,
  suttonGravesHeatFlux,
} from './ops'

describe('ops physics', () => {
  it('sums Δv budget', () => {
    expect(deltaVBudget([1, 2, 3])?.total).toBe(6)
  })

  it('Sutton-Graves scales with v³', () => {
    const q1 = suttonGravesHeatFlux(1e-4, 7000, 0.5)!
    const q2 = suttonGravesHeatFlux(1e-4, 14000, 0.5)!
    expect(q2 / q1).toBeCloseTo(8, 5)
  })

  it('coelliptic: lower orbit has positive relative rate magnitude', () => {
    const a = EARTH_RADIUS + 400e3
    const d = coellipticDrift(EARTH_MU, a, -10e3)!
    expect(d.nRel).toBeGreaterThan(0) // below → faster → positive if Δa negative: n_rel = -1.5 n (da/a) with da<0 → n_rel > 0
  })

  it('LOS range-rate', () => {
    const r = losRangeRate([3000, 0, 0], [10, 0, 0])!
    expect(r.range).toBe(3000)
    expect(r.rangeRate).toBeCloseTo(10)
  })

  it('Oberth favors periapsis', () => {
    const o = oberthCompare(EARTH_MU, 10_000e3, 0.3, 1000)!
    expect(o.dEp).toBeGreaterThan(o.dEa)
  })

  it('horizon range grows with sqrt(h)', () => {
    const d1 = horizonSlantRange(400e3)!
    const d2 = horizonSlantRange(1600e3)!
    expect(d2).toBeGreaterThan(d1)
  })

  it('beamwidth decreases with D and f', () => {
    const t1 = antennaBeamwidth(12e9, 1)!
    const t2 = antennaBeamwidth(12e9, 3)!
    expect(t2).toBeLessThan(t1)
  })

  it('deorbit Δv positive', () => {
    const r = EARTH_RADIUS + 400e3
    const rp = EARTH_RADIUS + 80e3
    const d = deorbitBurn(EARTH_MU, r, rp)!
    expect(d.dv).toBeGreaterThan(50)
    expect(d.dv).toBeLessThan(200)
  })

  it('equal stage mass ratio > 1', () => {
    const e = equalStageMassRatio(9000, 3, 300)!
    expect(e.massRatio).toBeGreaterThan(1)
  })

  it('zero total delta-v is a valid no-burn limit', () => {
    expect(equalStageMassRatio(0, 3, 300)).toEqual({
      dvStage: 0,
      massRatio: 1,
      ve: 300 * 9.80665,
    })
    expect(equalStageMassRatio(-1, 3, 300)).toBeNull()
  })

  it('normalizes fractional equal-stage counts once and requires integers in the physics helper', () => {
    const nStages = normalizeEqualStageCount(2.4)
    expect(nStages).toBe(2)
    expect(normalizeEqualStageCount(2.5)).toBe(3)
    expect(normalizeEqualStageCount(0.49)).toBeNull()
    expect(normalizeEqualStageCount(Number.POSITIVE_INFINITY)).toBeNull()
    expect(equalStageMassRatio(9000, 2.4, 300)).toBeNull()

    const result = equalStageMassRatio(9000, nStages!, 300)!
    const exportedFormula = Math.exp((9000 / nStages!) / (300 * 9.80665))
    expect(result.dvStage).toBe(4500)
    expect(exportedFormula).toBeCloseTo(result.massRatio, 14)
    expect(result.massRatio).toBeCloseTo(4.616211372684578, 14)
  })

  it('mean motion LEO ~0.001 rad/s', () => {
    const m = meanMotionFromAltitude(400e3)!
    expect(m.n).toBeGreaterThan(0.001)
    expect(m.n).toBeLessThan(0.0013)
  })
})
