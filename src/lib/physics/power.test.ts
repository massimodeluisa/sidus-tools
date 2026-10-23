import { describe, expect, it } from 'vitest'
import {
  alongTrackFromDeltaM,
  apoapsisRaiseFromCircular,
  batteryEnergyJ,
  diffractionResolution,
  dragForce,
  eclipseWithBeta,
  equilibriumTemperature,
  groundTrackShiftPerOrbit,
  rcsDeltaV,
  solarArrayPower,
  thermalRadiatedPower,
  wheelMomentum,
} from './power'
import { EARTH_MU, EARTH_RADIUS } from './constants'

describe('power / sensors physics', () => {
  it('solar array peaks at normal incidence', () => {
    const p0 = solarArrayPower(10, 0.3, 0, 1)!
    const p60 = solarArrayPower(10, 0.3, 60, 1)!
    expect(p0).toBeGreaterThan(p60)
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

  it('matches circular beta-angle eclipse geometry inside the principal domain and rejects outside it', () => {
    const R = 6_378_137
    const a = R + 400_000
    const mu = 3.986_004_418e14
    const period = 2 * Math.PI * Math.sqrt(a ** 3 / mu)

    // NASA SSRI Small Satellite Thermal Analysis, section II.A: circular beta-angle shadow geometry.
    expect(eclipseWithBeta(a, R, 0, period)).toBeCloseTo(2166.466708, 3)
    expect(eclipseWithBeta(a, R, (70 * Math.PI) / 180, period)).toBeCloseTo(255.879851, 3)
    expect(eclipseWithBeta(a, R, (80 * Math.PI) / 180, period)).toBe(0)

    expect(eclipseWithBeta(a, R, Math.PI / 2, period)).toBe(0)
    expect(eclipseWithBeta(a, R, -Math.PI / 2, period)).toBe(0)
    expect(eclipseWithBeta(a, R, (90.000001 * Math.PI) / 180, period)).toBeNull()
    expect(eclipseWithBeta(a, R, (-100 * Math.PI) / 180, period)).toBeNull()
    expect(eclipseWithBeta(a, R, Number.NaN, period)).toBeNull()
    expect(eclipseWithBeta(a, R, Number.POSITIVE_INFINITY, period)).toBeNull()
  })
})
