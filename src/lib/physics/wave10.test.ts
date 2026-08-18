import { describe, expect, it } from 'vitest'
import { EARTH_MU, EARTH_RADIUS, G0 } from './constants'
import { wienPeakWavelength } from './discovery-wave'
import {
  applyDcm,
  conjunctionPc2d,
  conjunctionPcFoster,
  conjunctionPcReport,
  criticalInclinationRad,
  eirpLinear,
  euler321ToQuat,
  figureOfMeritGT,
  frozenEccentricityJ2J3,
  heoOrbitFromPerigee,
  heoPeriodS,
  planckSpectralRadiance,
  porkchopEarthMarsGrid,
  quatToDcm,
  thrustToWeight,
} from './wave10'

describe('Molniya / Tundra sizing', () => {
  it('uses critical inclination and 12 h vs one sidereal day', () => {
    const iCrit = criticalInclinationRad()
    expect(iCrit).toBeCloseTo(Math.acos(Math.sqrt(0.2)), 12)
    expect(iCrit * (180 / Math.PI)).toBeGreaterThan(63)
    expect(iCrit * (180 / Math.PI)).toBeLessThan(64)

    const mol = heoOrbitFromPerigee({ kind: 'molniya', perigeeAlt: 1_000_000 })
    const tun = heoOrbitFromPerigee({ kind: 'tundra', perigeeAlt: 20_000_000 })
    expect(mol).not.toBeNull()
    expect(tun).not.toBeNull()
    expect(mol!.period).toBe(heoPeriodS('molniya'))
    expect(tun!.period).toBe(heoPeriodS('tundra'))
    expect(tun!.period / mol!.period).toBeCloseTo(2, 12)
    expect(mol!.period).toBeCloseTo(86164.0905 / 2, 6)
    expect(tun!.period).toBeCloseTo(86164.0905, 6)
    expect(mol!.inclination).toBeCloseTo(iCrit, 12)
    expect(mol!.e).toBeGreaterThan(0)
    expect(mol!.e).toBeLessThan(1)
    expect(mol!.ra).toBeGreaterThan(mol!.rp)
    expect(mol!.rp).toBeCloseTo(EARTH_RADIUS + 1_000_000, 6)
    expect(mol!.a).toBeCloseTo((mol!.rp + mol!.ra) / 2, 6)
    expect(mol!.dwell).toBeGreaterThan(0)
    expect(mol!.dwell).toBeLessThan(mol!.period)
    expect(mol!.dwell / mol!.period).toBeGreaterThan(0.2)
  })
})

describe('J2/J3 frozen eccentricity', () => {
  it('is positive for typical LEO inclinations and vanishes at i = 0', () => {
    const a = EARTH_RADIUS + 800_000
    const eSso = frozenEccentricityJ2J3(a, (98 * Math.PI) / 180)
    const eEq = frozenEccentricityJ2J3(a, 0)
    const eLow = frozenEccentricityJ2J3(a, (30 * Math.PI) / 180)
    const ePolar = frozenEccentricityJ2J3(a, Math.PI / 2)
    expect(eSso).not.toBeNull()
    expect(eSso!).toBeGreaterThan(0)
    expect(eSso!).toBeLessThan(0.05)
    expect(eEq).toBeNull()
    expect(ePolar!).toBeGreaterThan(eLow!)
  })
})

describe('thrust-to-weight', () => {
  it('is F / (m g0)', () => {
    const m = 250_000
    expect(thrustToWeight(m * G0, m)).toBeCloseTo(1, 12)
    expect(thrustToWeight(2 * m * G0, m)).toBeCloseTo(2, 12)
    expect(thrustToWeight(0, m)).toBeNull()
  })
})

describe('Planck B(λ, T)', () => {
  it('is positive in the visible at solar T and peaks near Wien', () => {
    const T = 5800
    const Bvis = planckSpectralRadiance(500e-9, T)
    expect(Bvis).not.toBeNull()
    expect(Bvis!).toBeGreaterThan(0)
    const lam = wienPeakWavelength(T)!
    const Bpeak = planckSpectralRadiance(lam, T)!
    const Bred = planckSpectralRadiance(2 * lam, T)!
    const Buv = planckSpectralRadiance(lam / 2, T)!
    expect(Bpeak).toBeGreaterThan(Bred)
    expect(Bpeak).toBeGreaterThan(Buv)
  })
})

describe('EIRP and G/T', () => {
  it('EIRP is P·G linear and G/T is G/Tsys', () => {
    expect(eirpLinear(10, 2)).toBeCloseTo(20, 12)
    expect(figureOfMeritGT(100, 100)).toBeCloseTo(1, 12)
    expect(figureOfMeritGT(200, 100)).toBeCloseTo(2, 12)
  })
})

describe('quaternion / Euler 3-2-1', () => {
  it('a 90° yaw maps +X onto +Y', () => {
    const yaw = Math.PI / 2
    const q = euler321ToQuat(yaw, 0, 0)
    expect(q).not.toBeNull()
    const R = quatToDcm(q!)
    expect(R).not.toBeNull()
    const out = applyDcm(R!, [1, 0, 0])
    expect(out[0]).toBeCloseTo(0, 12)
    expect(out[1]).toBeCloseTo(1, 12)
    expect(out[2]).toBeCloseTo(0, 12)
    const qz = { w: Math.SQRT1_2, x: 0, y: 0, z: Math.SQRT1_2 }
    const Rz = quatToDcm(qz)!
    const out2 = applyDcm(Rz, [1, 0, 0])
    expect(out2[0]).toBeCloseTo(0, 12)
    expect(out2[1]).toBeCloseTo(1, 12)
  })
})

describe('Earth–Mars porkchop grid', () => {
  it('returns more than one cell and neighboring costs can differ', () => {
    const grid = porkchopEarthMarsGrid({
      depStart: Date.UTC(2026, 10, 1) / 1000,
      depCount: 4,
      depStep: 20 * 86400,
      tofMin: 150 * 86400,
      tofCount: 4,
      tofStep: 30 * 86400,
    })
    expect(grid).not.toBeNull()
    expect(grid!.cells.length).toBeGreaterThan(1)
    expect(grid!.bestDv).not.toBeNull()
    expect(grid!.bestDv!.dvTot).toBeGreaterThan(0)
    const costs = grid!.cells.map((c) => c.dvTot)
    const spread = Math.max(...costs) - Math.min(...costs)
    expect(spread).toBeGreaterThan(0)
    expect(grid!.bestDv!.v1.every(Number.isFinite)).toBe(true)
  })
})

describe('conjunction Pc (Chan / Alfriend-class)', () => {
  it('is in (0, 1] for a close miss and drops as miss grows', () => {
    const R = 20
    const sx = 50
    const sy = 80
    const close = conjunctionPc2d(10, sx, sy, R)
    const far = conjunctionPc2d(400, sx, sy, R)
    expect(close).not.toBeNull()
    expect(far).not.toBeNull()
    expect(close!).toBeGreaterThan(0)
    expect(close!).toBeLessThanOrEqual(1)
    expect(far!).toBeLessThan(close!)
    expect(conjunctionPc2d(0, sx, sy, R)!).toBeGreaterThan(far!)
  })

  it('Foster matches the isotropic disk integral and stays close to Chan when R ≪ σ', () => {
    const iso = conjunctionPcFoster(0, 50, 50, 20)
    const exact = 1 - Math.exp(-(20 * 20) / (2 * 50 * 50))
    expect(iso).not.toBeNull()
    expect(iso! / exact).toBeCloseTo(1, 3)
    const report = conjunctionPcReport(50, 80, 120, 15)
    expect(report).not.toBeNull()
    expect(report!.chanOk).toBe(true)
    expect(Math.abs(report!.foster - report!.chan) / report!.foster).toBeLessThan(0.15)
    const fat = conjunctionPcReport(10, 20, 20, 40)
    expect(fat).not.toBeNull()
    expect(fat!.chanOk).toBe(false)
    expect(fat!.foster).toBeGreaterThan(fat!.chan)
  })
})

describe('SMA from Molniya period is above GEO-class perigee check', () => {
  it('rejects a perigee outside the ellipse', () => {
    expect(heoOrbitFromPerigee({ kind: 'molniya', perigeeAlt: 1e12 })).toBeNull()
    expect(heoOrbitFromPerigee({ kind: 'molniya', perigeeAlt: -1 })).toBeNull()
  })
})

void EARTH_MU
