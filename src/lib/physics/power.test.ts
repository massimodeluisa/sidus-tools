import { describe, expect, it } from 'vitest'
import {
  alongTrackFromDeltaM,
  apoapsisRaiseFromCircular,
  batteryEnergyJ,
  diffractionResolution,
  dragForce,
  eclipseWithBeta,
  equilibriumTemperature,
  exteriorSemiMajorFromPeriod,
  groundTrackShiftPerOrbit,
  rcsDeltaV,
  semiMajorFromPeriod,
  solarArrayPower,
  thermalRadiatedPower,
  wheelMomentum,
} from './power'
import { EARTH_MU, EARTH_RADIUS } from './constants'

describe('power / sensors physics', () => {
  it('solar array peaks at normal incidence', () => {
    const p0 = solarArrayPower(10, 0.3, 0, 1)!
    const p60 = solarArrayPower(10, 0.3, 60, 1)!
    expect(p0).toBeCloseTo(4083, 6)
    expect(p60).toBeCloseTo(2041.5, 6)
    expect(p0).toBeGreaterThan(p60)
  })

  it('keeps solar-array incidence inside [0, 90] degrees', () => {
    expect(solarArrayPower(10, 0.3, 90, 1)).toBe(0)
    expect(solarArrayPower(10, 0.3, 300, 1)).toBeNull()
    expect(solarArrayPower(10, 0.3, 360, 1)).toBeNull()
    expect(solarArrayPower(10, 0.3, Number.POSITIVE_INFINITY, 1)).toBeNull()
    expect(solarArrayPower(10, 0.3, -1, 1)).toBeNull()
  })

  it('battery energy scales with C and V', () => {
    expect(batteryEnergyJ(10, 28)).toBe(10 * 28 * 3600)
  })

  it('RCS Δv = Ft/m', () => {
    expect(rcsDeltaV(10, 2, 100)).toBeCloseTo(0.2)
  })

  it('diffraction finer with larger D', () => {
    const a = diffractionResolution(10e9, 1)!
    const b = diffractionResolution(10e9, 2)!
    expect(b.thetaRad).toBeLessThan(a.thetaRad)
  })

  it('thermal power grows with T^4', () => {
    const q1 = thermalRadiatedPower(1, 300, 1)!
    const q2 = thermalRadiatedPower(1, 600, 1)!
    expect(q2 / q1).toBeCloseTo(16, 5)
  })

  it('equilibrium temperature positive in sunlight', () => {
    const T = equilibriumTemperature(0.3, 0.8, 0, 1)!
    // Independent direct evaluation: [α_s S₀ / (ε σ)]^(1/4), with S₀ = 1361 W/m².
    expect(T).toBeCloseTo(308.0132605, 6)
  })

  it('drag force positive', () => {
    expect(dragForce(1e-12, 7600, 2.2, 5)!).toBeGreaterThan(0)
  })

  it('wheel momentum', () => {
    expect(wheelMomentum(0.1, 100)).toBeCloseTo(10)
  })

  it('apo raise needs energy', () => {
    const r = EARTH_RADIUS + 200e3
    const ra = EARTH_RADIUS + 1000e3
    const d = apoapsisRaiseFromCircular(EARTH_MU, r, ra)!
    expect(d.dv).toBeGreaterThan(0)
  })

  it('ground track shift westward for prograde (negative lon)', () => {
    const dL = groundTrackShiftPerOrbit(5400)!
    expect(dL).toBeLessThan(0)
  })

  it('along-track from ΔM', () => {
    const a = 7000e3
    expect(alongTrackFromDeltaM(a, 0.01)).toBeCloseTo(70e3, -2)
  })
})

describe('period match / exterior semi-major axis', () => {
  it('returns null when the circular radius is inside the body', () => {
    expect(exteriorSemiMajorFromPeriod(EARTH_MU, 60, EARTH_RADIUS)).toBeNull()
  })

  it('returns the surface circular semi-major axis at the surface period', () => {
    const T = 2 * Math.PI * Math.sqrt(EARTH_RADIUS ** 3 / EARTH_MU)
    const a = exteriorSemiMajorFromPeriod(EARTH_MU, T, EARTH_RADIUS)!
    expect(Number.isFinite(a)).toBe(true)
    expect(Math.abs(a - EARTH_RADIUS)).toBeLessThan(1e-3)
  })

  it('returns a semi-major axis above the surface for an exterior period', () => {
    const a = exteriorSemiMajorFromPeriod(EARTH_MU, 5400, EARTH_RADIUS)!
    expect(a).toBeGreaterThan(EARTH_RADIUS)
  })

  it('semi-major inversion still returns the inside-body radius', () => {
    const a = semiMajorFromPeriod(EARTH_MU, 60)!
    expect(a).not.toBeNull()
    expect(a).toBeLessThan(EARTH_RADIUS)
  })
})

describe('eclipse vs beta angle domain', () => {
  const R = 6_378_137
  const a = R + 400_000
  const mu = 3.986_004_418e14
  const period = 2 * Math.PI * Math.sqrt(a ** 3 / mu)
  const deg = Math.PI / 180

  it('rejects a beta angle beyond +90°', () => {
    expect(eclipseWithBeta(a, R, 100 * deg, period)).toBeNull()
  })

  it('returns no eclipse at 80°', () => {
    expect(eclipseWithBeta(a, R, 80 * deg, period)).toBe(0)
  })

  it('accepts ±90° as edge-on with no eclipse', () => {
    expect(eclipseWithBeta(a, R, 90 * deg, period)).toBe(0)
    expect(eclipseWithBeta(a, R, -90 * deg, period)).toBe(0)
  })

  it('returns a finite eclipse shorter than the period at 0°', () => {
    const te = eclipseWithBeta(a, R, 0, period)!
    expect(Number.isFinite(te)).toBe(true)
    expect(te).toBeGreaterThan(0)
    expect(te).toBeLessThan(period)
  })

  it('rejects non-finite beta angles', () => {
    expect(eclipseWithBeta(a, R, Number.NaN, period)).toBeNull()
    expect(eclipseWithBeta(a, R, Number.POSITIVE_INFINITY, period)).toBeNull()
  })
})
