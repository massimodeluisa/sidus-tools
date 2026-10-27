import { describe, expect, it } from 'vitest'
import { AU, EARTH_MU, EARTH_RADIUS, G0, SUN_MU } from './constants'
import { wienPeakWavelength } from './discovery-wave'
import { lambertSolve } from './lambert'
import { vnorm, vsub } from './vector'
import {
  applyDcm,
  conjunctionPc2d,
  conjunctionPcFoster,
  conjunctionPcReport,
  criticalInclinationRad,
  EARTH_HELIO_L0,
  eirpLinear,
  euler321ToQuat,
  figureOfMeritGT,
  frozenEccentricityJ2J3,
  heoOrbitFromPerigee,
  heoPeriodS,
  heliocentricCircularState,
  J2000_UNIX_S,
  MARS_HELIO_L0,
  MARS_SMA_M,
  parseUtcDayStart,
  planckSpectralRadiance,
  porkchopEarthMarsGrid,
  porkchopTransfer,
  quatToDcm,
  samplesInsideInterval,
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

  it('rejects a periapsis that intersects the body', () => {
    // GitHub #193: a = 5000 km, i = 98 deg used to return e ≈ 0.00148,
    // with periapsis about 1385 km inside the shipped Earth radius.
    expect(frozenEccentricityJ2J3(5_000_000, (98 * Math.PI) / 180)).toBeNull()
    const a = EARTH_RADIUS + 800_000
    const e = frozenEccentricityJ2J3(a, (98 * Math.PI) / 180)!
    expect(a * (1 - e)).toBeGreaterThan(EARTH_RADIUS)
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

  it('preserves independently anchored high-exponent radiance until the result underflows', () => {
    // 80-digit Decimal evaluations of the NIST wavelength law, using exact SI
    // constants and exact binary64 inputs.
    const issueInput = planckSpectralRadiance(1e-10, 205392.84475430887)
    expect(issueInput).not.toBeNull()
    expect(issueInput! / 7.122670560662916e-271).toBeCloseTo(1, 12)

    // At x ≈ 719.388, exp(x) overflows binary64 but B_lambda remains finite.
    const overflowInput = planckSpectralRadiance(1e-10, 200_000)
    expect(overflowInput).not.toBeNull()
    expect(overflowInput! / 4.461677095938781e-279).toBeCloseTo(1, 12)

    // At this wavelength, the exact Planck tail is below the binary64 range.
    expect(planckSpectralRadiance(1e-10, 160_000)).toBe(0)
  })

  it('matches an independent Rayleigh-Jeans-limit anchor without exp-minus-one cancellation', () => {
    // 80-digit Decimal evaluation for the exact binary64 inputs lambda=100 m, T=300 K.
    const radiance = planckSpectralRadiance(100, 300)
    expect(radiance).not.toBeNull()
    expect(radiance! / 2.4834483485500135e-20).toBeCloseTo(1, 14)
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

describe('Molniya apogee dwell (#195)', () => {
  it('matches the 600 km, 30° true-anomaly window', () => {
    const orbit = heoOrbitFromPerigee({
      kind: 'molniya',
      perigeeAlt: 600_000,
      dwellHalfAngle: (30 * Math.PI) / 180,
    })
    expect(orbit).not.toBeNull()
    expect(orbit!.dwell).toBeCloseTo(25995.420865, 3)
  })
})

describe('porkchop Lambert branch (#188)', () => {
  it('keeps the cheaper valid arc for 2026-11-17 and 260 days', () => {
    const tDep = Date.parse('2026-11-17T00:00:00Z') / 1000
    const tof = 260 * 86400
    const earth = heliocentricCircularState(AU, EARTH_HELIO_L0, tDep, SUN_MU)
    const mars = heliocentricCircularState(MARS_SMA_M, MARS_HELIO_L0, tDep + tof, SUN_MU)
    expect(earth).not.toBeNull()
    expect(mars).not.toBeNull()
    const short = lambertSolve(SUN_MU, earth!.r, mars!.r, tof, true)
    const long = lambertSolve(SUN_MU, earth!.r, mars!.r, tof, false)
    expect(short).not.toBeNull()
    expect(long).not.toBeNull()
    const totals = [short!, long!].map((sol) => {
      const dvDep = vnorm(vsub(sol.v1, earth!.v))
      const dvArr = vnorm(vsub(sol.v2, mars!.v))
      return { dvDep, dvArr, dvTot: dvDep + dvArr, c3: dvDep * dvDep }
    })
    const shortTot = totals[0]!
    const longTot = totals[1]!
    expect(shortTot.dvTot / 1000).toBeCloseTo(108.124, 2)
    expect(longTot.dvTot / 1000).toBeCloseTo(5.595, 2)
    expect(shortTot.c3 / 1e6).toBeCloseTo(3908, 0)
    expect(longTot.c3 / 1e6).toBeCloseTo(8.674, 2)
    const picked = porkchopTransfer(tDep, tDep + tof)
    expect(picked).not.toBeNull()
    expect(picked!.dvTot).toBeCloseTo(longTot.dvTot, 6)
    expect(picked!.c3).toBeCloseTo(longTot.c3, 6)
    const grid = porkchopEarthMarsGrid({
      depStart: tDep,
      depCount: 1,
      depStep: 86400,
      depEnd: tDep,
      tofMin: tof,
      tofCount: 1,
      tofStep: 86400,
      tofMax: tof,
    })
    expect(grid).not.toBeNull()
    expect(grid!.bestDv!.dvTot).toBeCloseTo(longTot.dvTot, 6)
    expect(grid!.bestC3!.c3).toBeCloseTo(Math.min(shortTot.c3, longTot.c3), 6)
  })
})

describe('parseUtcDayStart (#190)', () => {
  it('rejects impossible calendar dates instead of rolling them forward', () => {
    expect(parseUtcDayStart('2026-02-30')).toBeNull()
    expect(parseUtcDayStart('2026-02-31')).toBeNull()
    expect(parseUtcDayStart('2026-04-31')).toBeNull()
    expect(parseUtcDayStart('2025-02-29')).toBeNull()
    expect(parseUtcDayStart('1900-02-29')).toBeNull()
    expect(Date.parse('2026-02-30T00:00:00Z')).toBe(Date.parse('2026-03-02T00:00:00Z'))
  })

  it('accepts leap days and month boundaries that round-trip in UTC', () => {
    expect(parseUtcDayStart('2024-02-29')).toBe(Date.parse('2024-02-29T00:00:00Z') / 1000)
    expect(parseUtcDayStart('2000-02-29')).toBe(Date.parse('2000-02-29T00:00:00Z') / 1000)
    expect(parseUtcDayStart('2026-02-28')).toBe(Date.parse('2026-02-28T00:00:00Z') / 1000)
    expect(parseUtcDayStart('2026-01-01')).toBe(Date.parse('2026-01-01T00:00:00Z') / 1000)
    expect(parseUtcDayStart('2026-12-31')).toBe(Date.parse('2026-12-31T00:00:00Z') / 1000)
    expect(parseUtcDayStart('2026/02/28')).toBeNull()
    expect(parseUtcDayStart('')).toBeNull()
  })
})

describe('samplesInsideInterval (#191)', () => {
  it('keeps a step larger than the span on the lower bound', () => {
    expect(samplesInsideInterval(0, 40, 60)).toEqual([0])
  })

  it('keeps a narrow TOF window inside its maximum', () => {
    expect(samplesInsideInterval(120, 125, 20)).toEqual([120])
  })

  it('swaps reversed TOF bounds and stays inside them', () => {
    const samples = samplesInsideInterval(500, 80, 20)
    expect(samples[0]).toBe(80)
    expect(samples.at(-1)).toBe(500)
    expect(samples.every((x) => x >= 80 && x <= 500)).toBe(true)
    expect(samples).not.toContain(520)
  })

  it('stops a non-divisible range on the last interior sample', () => {
    expect(samplesInsideInterval(0, 50, 20)).toEqual([0, 20, 40])
    expect(samplesInsideInterval(120, 120, 20)).toEqual([120])
  })

  it('does not let the porkchop grid step past the displayed window', () => {
    const depStart = Date.parse('2026-11-01T00:00:00Z') / 1000
    const depSpan = 40 * 86400
    const depStep = 60 * 86400
    const tofMin = 120 * 86400
    const tofMax = 125 * 86400
    const tofStep = 20 * 86400
    const grid = porkchopEarthMarsGrid({
      depStart,
      depCount: 9,
      depStep,
      depEnd: depStart + depSpan,
      tofMin,
      tofCount: 9,
      tofStep,
      tofMax,
    })
    expect(grid).not.toBeNull()
    for (const cell of grid!.cells) {
      expect(cell.tDep).toBe(depStart)
      expect(cell.tof).toBe(tofMin)
    }
  })
})

describe('porkchop epoch (#192)', () => {
  it('is 2000-01-01 12:00:00 UTC, 64.184 s after J2000.0 TT', () => {
    expect(J2000_UNIX_S).toBe(Date.UTC(2000, 0, 1, 12, 0, 0) / 1000)
    const j2000TtMs = Date.UTC(2000, 0, 1, 11, 58, 55) + 816
    expect(J2000_UNIX_S - j2000TtMs / 1000).toBeCloseTo(64.184, 6)
  })
})

describe('SMA from Molniya period is above GEO-class perigee check', () => {
  it('rejects a perigee outside the ellipse', () => {
    expect(heoOrbitFromPerigee({ kind: 'molniya', perigeeAlt: 1e12 })).toBeNull()
    expect(heoOrbitFromPerigee({ kind: 'molniya', perigeeAlt: -1 })).toBeNull()
  })
})

void EARTH_MU
